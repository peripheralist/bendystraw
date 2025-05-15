import { eq } from "ponder";
import { Context } from "ponder:registry";
import { project, suckerGroup, suckerGroupMoment } from "ponder:schema";

export async function tryUpdateSuckerGroup({
  suckerGroupId,
  context,
  event,
}: {
  suckerGroupId: string | null;
  context: Context;
  event: {
    block: {
      number: bigint;
      timestamp: bigint;
    };
  };
}) {
  if (!suckerGroupId) return;

  const _suckerGroup = await context.db.find(suckerGroup, {
    id: suckerGroupId,
  });

  if (!_suckerGroup) return;

  const projects = await Promise.all(
    _suckerGroup.projects.map((id) =>
      context.db.sql.query.project.findFirst({ where: eq(project.id, id) })
    )
  );

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
    .update(suckerGroup, { id: suckerGroupId })
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
