import { gt, gte, or } from "ponder";
import { Context } from "ponder:registry";
import { payEvent, project } from "ponder:schema";

const TRENDING_WINDOW_DAYS = 7;
const TRENDING_WINDOW_SECS = TRENDING_WINDOW_DAYS * 24 * 60 * 60;

// TODO make this a cron job?
export async function handleTrendingPayment(
  timestamp: BigInt,
  context: Context
) {
  try {
    // TODO we could use a trendingLastUpdatedTimestamp pattern to avoid updating too often

    const oldestValidTimestampSecs = Number(timestamp) - TRENDING_WINDOW_SECS;

    // Promise.all() get [trendingProjects, trendingWindowPayments] fails in production "current transaction is aborted...". Reason unclear
    const trendingProjects = await context.db.sql
      .select()
      .from(project)
      .where(
        or(
          gt(project.trendingPaymentsCount, 0),
          gt(project.trendingScore, BigInt(0)),
          gt(project.trendingVolume, BigInt(0))
        )
      );

    const trendingWindowPayments = await context.db.sql
      .select()
      .from(payEvent)
      .where(gte(payEvent.timestamp, oldestValidTimestampSecs));

    /**
     * We first reset the trending stats for all trending projects
     */
    await Promise.all(
      trendingProjects.map((tp) =>
        context.db.update(project, tp).set({
          trendingPaymentsCount: 0,
          trendingScore: BigInt(0),
          trendingVolume: BigInt(0),
          createdWithinTrendingWindow: tp.createdAt >= oldestValidTimestampSecs,
        })
      )
    );

    /**
     * Next we calculate new trending stats.
     *
     * We iterate over all payments in the trending window. Then for each payment, update the trending stats of the project that received it.
     */
    // TODO we can probably reduce this to one db update per project. Unclear if/how it may improve performance. We cannot `await Promise.all` because each project update depends on the state of the previous
    for (const payment of trendingWindowPayments) {
      const { projectId, chainId, version, amount, amountUsd } = payment;

      await context.db
        .update(project, { projectId, chainId, version })
        .set((p) => {
          const trendingPaymentsCount = p.trendingPaymentsCount + 1;
          const trendingVolume = p.trendingVolume + amount;
          const trendingVolumeUsd = p.trendingVolumeUsd + amountUsd;

          // use USD value to normalize score for non-ETH projects
          // in case volumeUsd is 0 due to failed conversion, use 1 so trendingPaymentsCount can still factor into non-zero score. score will still be 0 if paymentsCount is 0
          const trendingScoreVolume =
            trendingVolumeUsd === BigInt(0) ? BigInt(1) : trendingVolumeUsd;

          // trendingScoreVolume is proportional to square of trendingPaymentsCount in score formula
          const trendingScore =
            trendingScoreVolume * BigInt(trendingPaymentsCount) ** BigInt(2);

          return {
            trendingPaymentsCount,
            trendingVolume,
            trendingVolumeUsd,
            trendingScore,
            createdWithinTrendingWindow:
              p.createdAt >= oldestValidTimestampSecs,
          };
        });
    }
  } catch (e) {
    console.warn("Error updating trending projects", e);
  }
}
