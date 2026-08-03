import { ponder } from "ponder:registry";
import { buybackPool, buybackPoolPosition } from "ponder:schema";
import { UniswapV4PositionManagerAbi } from "../abis/UniswapV4PositionManagerAbi";
import { UniswapV4StateViewAbi } from "../abis/UniswapV4StateViewAbi";
import {
  POSITION_MANAGER_BY_CHAIN,
  STATE_VIEW_BY_CHAIN,
} from "./constants/uniswapV4";
import { feesAccrued, positionKey } from "./util/lpFees";

const VERSION = 6;

/**
 * Position bookkeeping for Juicebox buyback pools, including lifetime fees.
 *
 * Every mint, liquidity change, and fee collect is a `ModifyLiquidity` — a V4
 * collect is a zero-liquidity decrease — and each one settles the fees accrued
 * since the position's last checkpoint. Those settled amounts are visible only
 * at the moment they happen: the pool overwrites `feeGrowthInsideLast` on every
 * modification, so live state can only ever report what is currently
 * UNCLAIMED. Accumulating them here is what makes lifetime earnings knowable
 * without replaying archive state.
 *
 * The interval is priced from the position's own checkpoint rather than the
 * pool's current fee growth, which keeps it exact when other swaps land in the
 * same block, and self-correcting if one position is modified twice in a block.
 *
 * The subscription is filtered to the canonical PositionManager, and anything
 * outside a registered `buybackPool` is dropped before a single RPC call — a
 * non-Juicebox pool costs one database miss.
 */
ponder.on("UniswapV4PoolManager6:ModifyLiquidity", async ({ event, context }) => {
  try {
    const chainId = context.chain.id;
    const { id: poolId, tickLower, tickUpper, salt } = event.args;

    const pool = await context.db.find(buybackPool, { chainId, poolId });
    if (!pool) return;

    // Positions minted through the PositionManager carry their NFT id as salt.
    const tokenId = BigInt(salt);
    if (tokenId === 0n) return;

    const positionManager = POSITION_MANAGER_BY_CHAIN[chainId];
    const stateView = STATE_VIEW_BY_CHAIN[chainId];
    if (!positionManager || !stateView) return;

    const [liquidityAfter, feeGrowthInside0, feeGrowthInside1] =
      await context.client.readContract({
        abi: UniswapV4StateViewAbi,
        address: stateView,
        functionName: "getPositionInfo",
        args: [poolId, positionKey(positionManager, tickLower, tickUpper, salt)],
        blockNumber: event.block.number,
      });

    const existing = await context.db.find(buybackPoolPosition, {
      chainId,
      tokenId,
    });
    const timestamp = Number(event.block.timestamp);

    if (!existing) {
      // A fresh position starts at the pool's current growth, so nothing has
      // accrued to it yet. Ownership comes from the NFT rather than the event,
      // whose sender is the PositionManager.
      const owner = await context.client.readContract({
        abi: UniswapV4PositionManagerAbi,
        address: positionManager,
        functionName: "ownerOf",
        args: [tokenId],
        blockNumber: event.block.number,
      });

      await context.db.insert(buybackPoolPosition).values({
        chainId,
        projectId: pool.projectId,
        version: VERSION,
        createdAt: timestamp,
        poolId,
        tokenId,
        owner,
        tickLower,
        tickUpper,
        liquidity: liquidityAfter,
        feeGrowthInside0LastX128: feeGrowthInside0,
        feeGrowthInside1LastX128: feeGrowthInside1,
        feesClaimed0: 0n,
        feesClaimed1: 0n,
        updatedAt: timestamp,
        burned: false,
      });
      return;
    }

    await context.db
      .update(buybackPoolPosition, { chainId, tokenId })
      .set({
        liquidity: liquidityAfter,
        feeGrowthInside0LastX128: feeGrowthInside0,
        feeGrowthInside1LastX128: feeGrowthInside1,
        feesClaimed0:
          existing.feesClaimed0 +
          feesAccrued(
            existing.liquidity,
            existing.feeGrowthInside0LastX128,
            feeGrowthInside0
          ),
        feesClaimed1:
          existing.feesClaimed1 +
          feesAccrued(
            existing.liquidity,
            existing.feeGrowthInside1LastX128,
            feeGrowthInside1
          ),
        updatedAt: timestamp,
      });
  } catch (e) {
    console.error("UniswapV4PoolManager6:ModifyLiquidity", e);
  }
});
