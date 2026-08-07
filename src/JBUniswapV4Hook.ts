import { ponder } from "ponder:registry";
import { buybackPool, project, swapEvent } from "ponder:schema";
import { isAddressEqual, parseEventLogs } from "viem";
import { UniswapV4PoolManagerAbi } from "../abis/UniswapV4PoolManagerAbi";
import { POOL_MANAGER_BY_CHAIN } from "./constants/uniswapV4";
import { insertActivityEvent } from "./util/activityEvent";
import { getEventParams } from "./util/getEventParams";
import { usdPerAccountingTokenAtBlock } from "./util/usdPrice";

const VERSION = 6;

const magnitude = (value: bigint) => (value < 0n ? -value : value);

// RouteSelected is emitted by the pool's hook for every attempted swap. A
// false route settles against Uniswap V4 and therefore moves the market price;
// a true route settles through Juicebox and leaves the pool price unchanged.
ponder.on("JBUniswapV4Hook6:RouteSelected", async ({ event, context }) => {
  try {
    const { poolId, useJuicebox } = event.args;
    if (useJuicebox) return;

    const poolManager = POOL_MANAGER_BY_CHAIN[context.chain.id];
    if (!poolManager) return;

    const pool = await context.db.find(buybackPool, {
      chainId: context.chain.id,
      poolId,
    });
    if (!pool) return;

    const receipt = await context.client.getTransactionReceipt({
      hash: event.transaction.hash,
    });
    const poolManagerLogs = receipt.logs.filter((log) =>
      isAddressEqual(log.address, poolManager)
    );
    const swaps = parseEventLogs({
      abi: UniswapV4PoolManagerAbi,
      eventName: "Swap",
      logs: poolManagerLogs,
      strict: true,
    });
    // RouteSelected is emitted immediately before its PoolManager Swap. Using
    // the first matching later log keeps multi-hop/multi-swap transactions
    // paired with the correct post-trade sqrt price.
    const settled = swaps.find(
      (log) =>
        log.args.id === poolId &&
        log.logIndex !== null &&
        log.logIndex > event.log.logIndex
    );
    if (!settled) return;

    const projectDelta = pool.projectTokenIsCurrency0
      ? settled.args.amount0
      : settled.args.amount1;
    const terminalDelta = pool.projectTokenIsCurrency0
      ? settled.args.amount1
      : settled.args.amount0;
    if (projectDelta === 0n || terminalDelta === 0n) return;

    const _project = await context.db.find(project, {
      projectId: pool.projectId,
      chainId: context.chain.id,
      version: VERSION,
    });
    if (!_project) throw new Error("Missing project");

    const { id } = await context.db.insert(swapEvent).values({
      ...getEventParams({ event, context }),
      projectId: pool.projectId,
      suckerGroupId: _project.suckerGroupId,
      version: VERSION,
      direction: projectDelta > 0n ? "buy" : "sell",
      poolId,
      terminalTokenAmount: magnitude(terminalDelta),
      projectTokenAmount: magnitude(projectDelta),
      sqrtPriceX96: settled.args.sqrtPriceX96,
      projectTokenIsCurrency0: pool.projectTokenIsCurrency0,
      accountingTokenUsdRate: await usdPerAccountingTokenAtBlock({
        context,
        version: VERSION,
        projectId: pool.projectId,
        currency: _project.currency,
      }),
    });

    await insertActivityEvent("swapEvent", {
      id,
      event,
      context,
      projectId: pool.projectId,
      suckerGroupId: _project.suckerGroupId,
      version: VERSION,
    });
  } catch (e) {
    console.error("JBUniswapV4Hook6:RouteSelected", e);
  }
});
