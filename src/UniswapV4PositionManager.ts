import { ponder } from "ponder:registry";
import { buybackPool, buybackPoolPosition } from "ponder:schema";
import { isAddressEqual, parseEventLogs, zeroAddress } from "viem";
import { UniswapV4PoolManagerAbi } from "../abis/UniswapV4PoolManagerAbi";
import { POOL_MANAGER_BY_CHAIN } from "./constants/uniswapV4";

const VERSION = 6;

/**
 * LP positions in Juicebox buyback pools.
 *
 * Uniswap V4 keeps positions in PoolManager storage with no per-owner view, so
 * a client that wants a pool's providers has to walk `ModifyLiquidity` logs
 * back to the pool's `Initialize` — hundreds of thousands of blocks for an
 * established pool, and it has to do it again for every wallet. Indexing the
 * PositionManager NFT gives that answer in one query.
 *
 * Only positions in a registered `buybackPool` are stored. A position's pool is
 * only knowable from the mint transaction's PoolManager log, so a mint costs
 * one receipt fetch; every later transfer of a position we did not record is a
 * pure database miss with no RPC at all.
 */
ponder.on("UniswapV4PositionManager6:Transfer", async ({ event, context }) => {
  try {
    const { from, to, id: tokenId } = event.args;
    const chainId = context.chain.id;
    const timestamp = Number(event.block.timestamp);

    const existing = await context.db.find(buybackPoolPosition, {
      chainId,
      tokenId,
    });

    // A burn ends the position. Keep the row so a client can distinguish a
    // position that closed from one that never existed.
    if (isAddressEqual(to, zeroAddress)) {
      if (existing) {
        await context.db
          .update(buybackPoolPosition, { chainId, tokenId })
          .set({ owner: to, burned: true, updatedAt: timestamp });
      }
      return;
    }

    // Ownership change on a position we already track: no pool lookup needed.
    if (existing) {
      await context.db
        .update(buybackPoolPosition, { chainId, tokenId })
        .set({ owner: to, burned: false, updatedAt: timestamp });
      return;
    }

    // Anything else that is not a mint belongs to a pool we ignored at mint
    // time — some other Uniswap V4 pool.
    if (!isAddressEqual(from, zeroAddress)) return;

    const poolManager = POOL_MANAGER_BY_CHAIN[chainId];
    if (!poolManager) return;

    // The mint's PoolManager log carries the pool, the range, and the salt,
    // which is this token id.
    const receipt = await context.client.getTransactionReceipt({
      hash: event.transaction.hash,
    });
    const modifications = parseEventLogs({
      abi: UniswapV4PoolManagerAbi,
      eventName: "ModifyLiquidity",
      logs: receipt.logs.filter((log) =>
        isAddressEqual(log.address, poolManager)
      ),
      strict: true,
    });
    const mint = modifications.find(
      (log) => BigInt(log.args.salt) === tokenId && log.args.liquidityDelta > 0n
    );
    if (!mint) return;

    const pool = await context.db.find(buybackPool, {
      chainId,
      poolId: mint.args.id,
    });
    // Not a Juicebox pool.
    if (!pool) return;

    await context.db
      .insert(buybackPoolPosition)
      .values({
        chainId,
        projectId: pool.projectId,
        version: VERSION,
        createdAt: timestamp,
        poolId: mint.args.id,
        tokenId,
        owner: to,
        tickLower: mint.args.tickLower,
        tickUpper: mint.args.tickUpper,
        updatedAt: timestamp,
        burned: false,
      })
      .onConflictDoUpdate({
        owner: to,
        burned: false,
        updatedAt: timestamp,
      });
  } catch (e) {
    console.error("UniswapV4PositionManager6:Transfer", e);
  }
});
