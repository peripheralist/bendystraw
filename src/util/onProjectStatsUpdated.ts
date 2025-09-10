import { eq } from "ponder";
import { Context } from "ponder:registry";
import { project, suckerGroup, suckerGroupMoment } from "ponder:schema";

/**
 * Handles everything that should happen after a project's **stats** are updated. Inserts a projectMoment and updates the project's suckerGroup's stats.
 */
export async function onProjectStatsUpdated({
  projectId,
  context,
  event,
}: {
  projectId: bigint | number;
  context: Context;
  event: {
    block: {
      number: bigint;
      timestamp: bigint;
    };
  };
}) {
  const _project = await context.db.find(project, {
    chainId: context.chain.id,
    projectId: Number(projectId),
  });

  if (!_project) {
    throw new Error("[onProjectStatsUpdated] Missing project");
  }

  // // insert project moment
  // NOT WORKING due to duplicate key bs
  // await context.db
  //   .insert(projectMoment)
  //   .values({
  //     projectId: Number(projectId),
  //     chainId: context.chain.id,
  //     block: Number(event.block.number),
  //     timestamp: Number(event.block.timestamp),
  //     balance: _project.balance,
  //     volume: _project.volume,
  //     volumeUsd: _project.volumeUsd,
  //     trendingScore: _project.trendingScore,
  //   })
  //   .onConflictDoUpdate(() => ({
  //     balance: _project.balance,
  //     volume: _project.volume,
  //     volumeUsd: _project.volumeUsd,
  //     trendingScore: _project.trendingScore,
  //   }));

  const _suckerGroup = await context.db.find(suckerGroup, {
    id: _project.suckerGroupId,
  });

  if (!_suckerGroup) {
    throw new Error("[onProjectStatsUpdated] Missing suckerGroup");
  }

  // const projects = await Promise.all(
  //   _suckerGroup.projects.map((id) =>
  //     context.db.sql.query.project.findFirst({ where: eq(project.id, id) })
  //   )
  // );

  // Promise.all() throws `error: savepoint "flush" does not exist`
  const projects: (typeof project.$inferSelect)[] = [];
  for (const id of _suckerGroup.projects) {
    const _project = await context.db.sql.query.project.findFirst({
      where: eq(project.id, id),
    });

    if (_project) projects.push(_project);
  }

  const aggregateStats = projects
    .filter((p) => !!p)
    .reduce(
      (acc, p) => ({
        paymentsCount: acc.paymentsCount + p.paymentsCount,
        redeemCount: acc.redeemCount + p.redeemCount,
        volume: acc.volume + p.volume,
        volumeUsd: acc.volumeUsd + p.volumeUsd,
        redeemVolume: acc.redeemVolume + p.redeemVolume,
        redeemVolumeUsd: acc.redeemVolumeUsd + p.redeemVolumeUsd,
        nftsMintedCount: acc.nftsMintedCount + p.nftsMintedCount,
        balance: acc.balance + p.balance,
        tokenSupply: acc.tokenSupply + p.tokenSupply,
        trendingScore: acc.trendingScore + p.trendingScore,
        trendingVolume: acc.trendingVolume + p.trendingVolume,
        trendingPaymentsCount:
          acc.trendingPaymentsCount + p.trendingPaymentsCount,
        contributorsCount: acc.contributorsCount + p.contributorsCount,
      }),
      {
        paymentsCount: 0,
        redeemCount: 0,
        volume: BigInt(0),
        volumeUsd: BigInt(0),
        redeemVolume: BigInt(0),
        redeemVolumeUsd: BigInt(0),
        nftsMintedCount: 0,
        balance: BigInt(0),
        tokenSupply: BigInt(0),
        trendingScore: BigInt(0),
        trendingVolume: BigInt(0),
        trendingPaymentsCount: 0,
        contributorsCount: 0,
      }
    );

  const updatedSuckerGroup = await context.db
    .update(suckerGroup, { id: _project.suckerGroupId })
    .set(aggregateStats);

  await context.db
    .insert(suckerGroupMoment)
    .values({
      ...updatedSuckerGroup,
      suckerGroupId: updatedSuckerGroup.id,
      block: Number(event.block.number),
      timestamp: Number(event.block.timestamp),
    })
    .onConflictDoNothing();
}
