import { ponder } from "ponder:registry";
import { buybackPoolPosition } from "ponder:schema";
import { isAddressEqual, zeroAddress } from "viem";

/**
 * Ownership of LP positions in Juicebox buyback pools.
 *
 * The positions themselves are discovered and priced in the PoolManager
 * handler, which sees every mint, liquidity change, and fee collect. This
 * handler only follows the NFT: who holds a position now, and whether it has
 * been burned. A transfer of any position we do not track — every other
 * Uniswap V4 pool — costs one database miss and no RPC at all.
 */
ponder.on("UniswapV4PositionManager6:Transfer", async ({ event, context }) => {
  try {
    const { to, id: tokenId } = event.args;
    const chainId = context.chain.id;

    const existing = await context.db.find(buybackPoolPosition, {
      chainId,
      tokenId,
    });
    // Either a position in another pool, or a mint whose ModifyLiquidity has
    // not been processed yet — that handler reads the owner from the NFT, so
    // there is nothing to do here.
    if (!existing) return;

    // A burn ends the position. The row stays so a client can distinguish a
    // position that closed from one that never existed.
    await context.db
      .update(buybackPoolPosition, { chainId, tokenId })
      .set({
        owner: to,
        burned: isAddressEqual(to, zeroAddress),
        updatedAt: Number(event.block.timestamp),
      });
  } catch (e) {
    console.error("UniswapV4PositionManager6:Transfer", e);
  }
});
