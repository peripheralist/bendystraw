import type { Context } from "ponder:registry";
import { addNftTierEvent, nftTier, removeNftTierEvent } from "ponder:schema";
import { insertActivityEvent } from "./activityEvent";
import { getEventParams } from "./getEventParams";
import type { Version } from "./getVersion";

type TierActivityEvent = Parameters<typeof getEventParams>[0]["event"] & {
  args: { tierId: bigint };
  log: { address: `0x${string}` };
};

type NftTierActivityInfo = {
  projectId: number;
  suckerGroupId: string;
  version: Version;
};

type AddedTier = {
  price: bigint;
  initialSupply: bigint | number;
  category: bigint | number;
  encodedIPFSUri: `0x${string}`;
};

export async function recordAddNftTierActivity(
  event: TierActivityEvent & { args: { tier: AddedTier } },
  context: Context,
  info: NftTierActivityInfo & {
    metadata: unknown;
    resolvedUri: string;
  }
) {
  const initialSupply = Number(event.args.tier.initialSupply);
  const { id } = await context.db.insert(addNftTierEvent).values({
    ...getEventParams({ event, context }),
    projectId: info.projectId,
    suckerGroupId: info.suckerGroupId,
    version: info.version,
    hook: event.log.address,
    tierId: Number(event.args.tierId),
    price: event.args.tier.price,
    initialSupply,
    remainingSupply: initialSupply,
    category: Number(event.args.tier.category),
    encodedIpfsUri: event.args.tier.encodedIPFSUri,
    resolvedUri: info.resolvedUri,
    metadata: info.metadata,
  });

  await insertActivityEvent("addNftTierEvent", {
    id,
    event,
    context,
    projectId: info.projectId,
    suckerGroupId: info.suckerGroupId,
    version: info.version,
  });
}

export async function recordRemoveNftTierActivity(
  event: TierActivityEvent,
  context: Context,
  info: NftTierActivityInfo
) {
  const tierId = Number(event.args.tierId);
  const existingTier = await context.db.find(nftTier, {
    chainId: context.chain.id,
    hook: event.log.address,
    tierId,
    version: info.version,
  });

  const { id } = await context.db.insert(removeNftTierEvent).values({
    ...getEventParams({ event, context }),
    projectId: info.projectId,
    suckerGroupId: info.suckerGroupId,
    version: info.version,
    hook: event.log.address,
    tierId,
    price: existingTier?.price ?? null,
    initialSupply: existingTier?.initialSupply ?? null,
    remainingSupply: existingTier?.remainingSupply ?? null,
    category: existingTier?.category ?? null,
    encodedIpfsUri: existingTier?.encodedIpfsUri ?? null,
    resolvedUri: existingTier?.resolvedUri ?? null,
    metadata: existingTier?.metadata ?? null,
  });

  await insertActivityEvent("removeNftTierEvent", {
    id,
    event,
    context,
    projectId: info.projectId,
    suckerGroupId: info.suckerGroupId,
    version: info.version,
  });
}
