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
    const trendingWindowStart = Number(timestamp) - TRENDING_WINDOW_SECS;

    if (Number(timestamp) < trendingWindowStart) {
      // don't run calculations during historical indexing. only run once within trending window, ensuring trending will still be calculated if latest payment is barely within window when bendystraw is deployed.
      return;
    }

    /**
     * We first reset the trending stats for all trending projects
     */
    await context.db.sql
      .update(project)
      .set({
        trendingPaymentsCount: 0,
        trendingScore: BigInt(0),
        trendingVolume: BigInt(0),
      })
      .where(
        or(
          gt(project.trendingPaymentsCount, 0),
          gt(project.trendingScore, BigInt(0)),
          gt(project.trendingVolume, BigInt(0))
        )
      );

    const trendingPayments = await context.db.sql.query.payEvent.findMany({
      where: gte(payEvent.timestamp, trendingWindowStart),
      with: { project: { columns: { id: true } } },
    });

    /**
     * Store a dictionary of pending project updates, derived from the trending payments list.
     *
     * Stats for each project will change with each payment it has received within the trending window. This pattern allows us to coalesce all updates into a single record, and only update the database once per project.
     */
    const updates = trendingPayments.reduce(
      (acc, { project: { id }, projectId, chainId, version }) => ({
        ...acc,
        [id]: {
          projectId,
          chainId,
          version,
          trendingPaymentsCount: 0,
          trendingVolume: BigInt(0),
          trendingVolumeUsd: BigInt(0),
        },
      }),
      {} as Record<
        string,
        Pick<
          typeof project.$inferSelect,
          | "projectId"
          | "chainId"
          | "version"
          | "trendingPaymentsCount"
          | "trendingVolume"
          | "trendingVolumeUsd"
        >
      >
    );

    /**
     * Next we update the updates dictionary with payments data.
     *
     * Iterate over all trending payments. Then for each payment, update record of trending stats for the project that received it.
     */
    for (const {
      project: { id },
      amount,
      amountUsd,
    } of trendingPayments) {
      if (!updates[id]) {
        throw new Error(`Missing update record, id: ${id}`);
      }

      updates[id].trendingPaymentsCount++;
      updates[id].trendingVolume += amount;
      updates[id].trendingVolumeUsd += amountUsd;
    }

    /**
     * Finally we update the projects table.
     *
     * For each project in the updates dictionary, we'll calculate a new trending score and store all trending stats.
     */
    for (const {
      trendingPaymentsCount,
      trendingVolume,
      trendingVolumeUsd,
      ...keys
    } of Object.values(updates)) {
      await context.db.update(project, keys).set(({ createdAt, currency }) => {
        // TODO we should use USD values to normalize score regardless of project currency, but must coordinate with legacy subgraph for consistent scoring
        // if currency is not native, ignore ETH-denominated trendingVolume but use 1 so that trendingPaymentsCount can still factor into non-zero score
        // TODO must convert pricing before we can factor in non-native trendingVolume
        const trendingScoreVolume =
          currency !== BigInt(61166) ? BigInt(1) : trendingVolume;

        // calculate trendingScore
        const trendingScore =
          trendingScoreVolume * BigInt(trendingPaymentsCount) ** BigInt(2);

        // finally, set value of createdWithinTrendingWindow
        const createdWithinTrendingWindow = createdAt >= trendingWindowStart;

        return {
          trendingPaymentsCount,
          trendingVolume,
          trendingVolumeUsd,
          trendingScore,
          createdWithinTrendingWindow,
        };
      });
    }
  } catch (e) {
    console.warn("Error updating trending projects", e);
  }
}
