import { Context } from "ponder:registry";
import { defifaEvent, defifaGame, defifaHolding, nftHook } from "ponder:schema";
import { DefifaHookAbi } from "../../abis/DefifaHookAbi";
import { zeroAddress } from "viem";
import { getEventParams } from "./getEventParams";

// Defifa games are V6 projects.
export const DEFIFA_VERSION = 6;

// Defifa1155HookLib.RESERVE_TOKEN_ID_OFFSET: reserve-minted positions use tierId + 65536.
const RESERVE_TOKEN_ID_OFFSET = 1n << 16n;

// JB721 token IDs are tierId * 1e9 + the tier's mint number.
const JB721_TIER_DIVISOR = 1_000_000_000n;

type DefifaEventInput = Parameters<typeof getEventParams>[0]["event"];
type DefifaEventFields = Omit<typeof defifaEvent.$inferInsert, keyof ReturnType<typeof getEventParams> | "id" | "version" | "projectId" | "type">;

/**
 * The game (project) a hook belongs to: the nftHook row its LaunchGame seeded, else the hook itself. A referee's
 * initializeGameFor callback runs before LaunchGame in the launch transaction, and Ponder delivers a factory
 * child's logs from its whole creation block, so hook events can precede the seed.
 */
export async function gameIdOfHook(context: Context, hook: `0x${string}`) {
  const row = await context.db.find(nftHook, { chainId: context.chain.id, address: hook, version: DEFIFA_VERSION });
  if (row) return row.projectId;
  return Number(await context.client.readContract({ abi: DefifaHookAbi, address: hook, functionName: "projectId" }));
}

export const tierOf721TokenId = (tokenId: bigint) => Number(tokenId / JB721_TIER_DIVISOR);

export function tierOf1155TokenId(tokenId: bigint) {
  const reserve = tokenId > RESERVE_TOKEN_ID_OFFSET;
  return { tierId: Number(reserve ? tokenId - RESERVE_TOKEN_ID_OFFSET : tokenId), reserve };
}

/**
 * Add `delta` positions (negative to remove) to an owner's tier holding. Zero-address sides of mints and burns
 * are skipped. `reserveDelta` is set only for ERC-1155 games.
 */
export async function moveDefifaHolding({
  context, timestamp, projectId, hook, owner, tierId, delta, reserveDelta,
}: {
  context: Context; timestamp: number; projectId: number; hook: `0x${string}`; owner: `0x${string}`;
  tierId: number; delta: number; reserveDelta?: number;
}) {
  if (owner === zeroAddress || delta === 0) return;
  const key = { chainId: context.chain.id, hook, owner, tierId };
  const existing = await context.db.find(defifaHolding, key);
  if (!existing) {
    // An owner can only lose positions they were indexed as receiving.
    if (delta < 0) throw new Error(`Defifa holding underflow for ${owner} tier ${tierId}`);
    await context.db.insert(defifaHolding).values({
      ...key, projectId, version: DEFIFA_VERSION, count: delta, reserveCount: reserveDelta, updatedAt: timestamp,
    });
    return;
  }
  if (existing.count + delta < 0) throw new Error(`Defifa holding underflow for ${owner} tier ${tierId}`);
  await context.db.update(defifaHolding, key).set({
    count: existing.count + delta,
    reserveCount: reserveDelta === undefined ? existing.reserveCount : (existing.reserveCount ?? 0) + reserveDelta,
    updatedAt: timestamp,
  });
}

/**
 * Refresh the game's totalMintCost after a mint or burn (a transfer from or to the zero address), the only
 * transfers that change it. No event carries the value, so it is read at the event's block.
 */
export async function syncDefifaTotalMintCost({
  context, blockNumber, projectId, hook, from, to,
}: {
  context: Context; blockNumber: bigint; projectId: number; hook: `0x${string}`; from: `0x${string}`; to: `0x${string}`;
}) {
  if (from !== zeroAddress && to !== zeroAddress) return;
  // Before LaunchGame in the launch block there is no game row yet; the launch reads the block's final value.
  const key = { chainId: context.chain.id, projectId };
  if (!await context.db.find(defifaGame, key)) return;
  // Both 2.0 hook types expose the same getter. The read is the block's final value, so repeats are idempotent.
  const totalMintCost = await context.client.readContract({ abi: DefifaHookAbi, address: hook, functionName: "totalMintCost", blockNumber });
  await context.db.update(defifaGame, key).set({ totalMintCost });
}

/** Append one row to the Defifa activity feed. */
export async function insertDefifaEvent({
  event, context, projectId, type, ...fields
}: {
  event: DefifaEventInput; context: Context; projectId: number; type: typeof defifaEvent.$inferInsert["type"];
} & DefifaEventFields) {
  await context.db.insert(defifaEvent).values({
    ...getEventParams({ event, context }), version: DEFIFA_VERSION, projectId, type, ...fields,
  });
}
