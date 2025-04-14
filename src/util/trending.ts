import { gt, gte, or } from "ponder";
import { Context } from "ponder:registry";
import { payEvent, project } from "ponder:schema";

const TRENDING_WINDOW_DAYS = 7;

export async function handleTrendingPayment(
  timestamp: BigInt,
  context: Context
) {
  try {
    // TODO we can use trendingLastUpdatedTimestamp pattern to avoid updating too often

    const oldestValidTimestampSecs =
      Number(timestamp) - TRENDING_WINDOW_DAYS * 24 * 60 * 60;

    const [trendingProjects, trendingWindowPayments] = await Promise.all([
      context.db.sql
        .select()
        .from(project)
        .where(
          or(
            gt(project.trendingPaymentsCount, 0),
            gt(project.trendingScore, BigInt(0)),
            gt(project.trendingVolume, BigInt(0))
          )
        ),
      context.db.sql
        .select()
        .from(payEvent)
        .where(gte(payEvent.timestamp, oldestValidTimestampSecs)),
    ]);

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
    // TODO we can probably reduce this to one db update per project. Unclear how it may affect performance. We cannot `await Promise.all` because state updates depend on each other
    for (const twp of trendingWindowPayments) {
      await context.db.update(project, twp).set((p) => {
        const trendingPaymentsCount = p.trendingPaymentsCount + 1;
        const trendingVolume = p.trendingVolume + twp.amount;
        const trendingScore =
          trendingVolume * BigInt(trendingPaymentsCount) ** BigInt(2);

        return {
          trendingPaymentsCount,
          trendingVolume,
          trendingScore,
          createdWithinTrendingWindow: p.createdAt >= oldestValidTimestampSecs,
        };
      });
    }
  } catch (e) {
    console.warn("Error updating trending projects", e);
  }
}
