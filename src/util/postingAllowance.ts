import type { Context, Event } from "ponder:registry";
import { configurePostingCriteriaEvent, nftHook, postingAllowance } from "../../ponder.schema";
import { JB721TiersHookV6Abi } from "../../abis/JB721TiersHookV6Abi";

/** No catch: a failed hook resolution must retry rather than silently omit a row. */
export async function recordPostingAllowance(
  event: Event<"CTPublisher6:ConfigurePostingCriteria">,
  context: Context<"CTPublisher6:ConfigurePostingCriteria">,
) {
  const version = 6;
  const hook = event.args.hook.toLowerCase() as `0x${string}`;
  if (hook !== event.args.allowedPost.hook.toLowerCase()) {
    throw new Error("ConfigurePostingCriteria hook does not match its allowance");
  }
  const existingHook = await context.db.find(nftHook, { chainId: context.chain.id, address: hook, version });
  const rawProjectId = existingHook?.projectId ?? await context.client.readContract({
    abi: JB721TiersHookV6Abi, address: hook, functionName: "projectId", blockNumber: event.block.number,
  });
  const projectId = Number(rawProjectId);
  if (!Number.isSafeInteger(projectId) || projectId <= 0) throw new Error("Invalid allowance hook projectId");
  if (!existingHook) {
    await context.db.insert(nftHook).values({ chainId: context.chain.id, address: hook, version, projectId, createdAt: Number(event.block.timestamp) });
  }
  const criteria = event.args.allowedPost;
  const values = {
    chainId: context.chain.id, version, projectId,
    publisher: event.log.address.toLowerCase() as `0x${string}`, hook,
    category: Number(criteria.category), minimumPrice: criteria.minimumPrice,
    minimumTotalSupply: BigInt(criteria.minimumTotalSupply),
    maximumTotalSupply: BigInt(criteria.maximumTotalSupply),
    maximumSplitPercent: BigInt(criteria.maximumSplitPercent),
    allowedAddresses: criteria.allowedAddresses.map((address) => address.toLowerCase() as `0x${string}`),
    txHash: event.transaction.hash, logIndex: event.log.logIndex, caller: event.args.caller,
  };
  await context.db.insert(configurePostingCriteriaEvent).values({
    ...values, id: `${context.chain.id}:${event.transaction.hash}:${event.log.logIndex}`,
    blockNumber: event.block.number, timestamp: Number(event.block.timestamp), from: event.transaction.from,
  });
  // Ponder processes canonical logs in order and rolls this state back on reorgs.
  const current = { ...values, updatedAtBlock: event.block.number, updatedAt: Number(event.block.timestamp) };
  await context.db.insert(postingAllowance).values(current).onConflictDoUpdate(current);
}
