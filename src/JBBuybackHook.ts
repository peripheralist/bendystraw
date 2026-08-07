import { Context } from "ponder:registry";
import { ponder } from "ponder:registry";
import {
  buybackPool,
  buybackPoolEvent,
  project,
  swapEvent,
} from "ponder:schema";
import {
  encodeAbiParameters,
  isAddressEqual,
  keccak256,
  parseEventLogs,
  zeroAddress,
} from "viem";
import { JBBuybackHookV6Abi } from "../abis/JBBuybackHookV6Abi";
import { UniswapV4PoolManagerAbi } from "../abis/UniswapV4PoolManagerAbi";
import {
  NATIVE_TOKEN,
  POOL_MANAGER_BY_CHAIN,
} from "./constants/uniswapV4";
import { insertActivityEvent } from "./util/activityEvent";
import { getEventParams } from "./util/getEventParams";
import { usdPerAccountingTokenAtBlock } from "./util/usdPrice";

// JBBuybackHook is a V6-only singleton (events carry `projectId`), so version
// is always 6 for everything indexed here.
const VERSION = 6;

async function findProject(context: Context, projectId: number) {
  const _project = await context.db.find(project, {
    projectId,
    chainId: context.chain.id,
    version: VERSION,
  });

  if (!_project) {
    throw new Error("Missing project");
  }

  return _project;
}

// Leftover terminal tokens minted as project tokens instead of swapped.
ponder.on("JBBuybackHook6:Mint", async ({ event, context }) => {
  try {
    const { projectId: _projectId, leftoverAmount, tokenCount } = event.args;
    const projectId = Number(_projectId);

    const _project = await findProject(context, projectId);

    const { id } = await context.db.insert(swapEvent).values({
      ...getEventParams({ event, context }),
      projectId,
      suckerGroupId: _project.suckerGroupId,
      version: VERSION,
      direction: "mint",
      poolId: null,
      terminalTokenAmount: leftoverAmount,
      projectTokenAmount: tokenCount,
      sqrtPriceX96: null,
      projectTokenIsCurrency0: null,
      accountingTokenUsdRate: await usdPerAccountingTokenAtBlock({
        context,
        version: VERSION,
        projectId,
        currency: _project.currency,
      }),
    });

    await insertActivityEvent("swapEvent", {
      id,
      event,
      context,
      projectId,
      suckerGroupId: _project.suckerGroupId,
      version: VERSION,
    });
  } catch (e) {
    console.error("JBBuybackHook6:Mint", e);
  }
});

// A Uniswap V4 pool registered for a project's buyback for a terminal token.
ponder.on("JBBuybackHook6:PoolAdded", async ({ event, context }) => {
  try {
    const { projectId: _projectId, terminalToken, poolId } = event.args;
    const projectId = Number(_projectId);

    const _project = await findProject(context, projectId);
    const poolManager = POOL_MANAGER_BY_CHAIN[context.chain.id];
    if (!poolManager) throw new Error("Missing PoolManager");

    const key = await context.client.readContract({
      abi: JBBuybackHookV6Abi,
      address: event.log.address,
      functionName: "poolKeyOf",
      args: [_projectId, terminalToken],
      blockNumber: event.block.number,
    });
    const normalizedTerminal = isAddressEqual(terminalToken, NATIVE_TOKEN)
      ? zeroAddress
      : terminalToken;
    const terminalIsCurrency0 = isAddressEqual(
      normalizedTerminal,
      key.currency0
    );
    const terminalIsCurrency1 = isAddressEqual(
      normalizedTerminal,
      key.currency1
    );
    if (!terminalIsCurrency0 && !terminalIsCurrency1) {
      throw new Error("Terminal token is not in the registered PoolKey");
    }

    const receipt = await context.client.getTransactionReceipt({
      hash: event.transaction.hash,
    });
    const initializeLogs = parseEventLogs({
      abi: UniswapV4PoolManagerAbi,
      eventName: "Initialize",
      logs: receipt.logs.filter((log) =>
        isAddressEqual(log.address, poolManager)
      ),
      strict: true,
    });
    const initialize = initializeLogs.find((log) => log.args.id === poolId);

    let initialSqrtPriceX96 = initialize?.args.sqrtPriceX96 ?? null;
    if (initialSqrtPriceX96 === null) {
      // A project may register a pool initialized in an earlier transaction.
      // Capture slot0 at registration so its history still has a real seed.
      const stateSlot = keccak256(
        encodeAbiParameters(
          [{ type: "bytes32" }, { type: "uint256" }],
          [poolId, 6n]
        )
      );
      const slot0 = await context.client.readContract({
        abi: UniswapV4PoolManagerAbi,
        address: poolManager,
        functionName: "extsload",
        args: [stateSlot],
        blockNumber: event.block.number,
      });
      const sqrtPriceX96 = BigInt(slot0) & ((1n << 160n) - 1n);
      initialSqrtPriceX96 = sqrtPriceX96 > 0n ? sqrtPriceX96 : null;
    }

    await context.db
      .insert(buybackPool)
      .values({
        chainId: context.chain.id,
        projectId,
        version: VERSION,
        createdAt: Number(event.block.timestamp),
        poolId,
        terminalToken,
        currency0: key.currency0,
        currency1: key.currency1,
        projectTokenIsCurrency0: terminalIsCurrency1,
        initialSqrtPriceX96,
      })
      .onConflictDoUpdate({
        projectId,
        version: VERSION,
        createdAt: Number(event.block.timestamp),
        terminalToken,
        currency0: key.currency0,
        currency1: key.currency1,
        projectTokenIsCurrency0: terminalIsCurrency1,
        initialSqrtPriceX96,
      });

    const { id } = await context.db.insert(buybackPoolEvent).values({
      ...getEventParams({ event, context }),
      projectId,
      suckerGroupId: _project.suckerGroupId,
      version: VERSION,
      terminalToken,
      poolId,
      currency0: key.currency0,
      currency1: key.currency1,
      projectTokenIsCurrency0: terminalIsCurrency1,
      initialSqrtPriceX96,
    });

    await insertActivityEvent("buybackPoolEvent", {
      id,
      event,
      context,
      projectId,
      suckerGroupId: _project.suckerGroupId,
      version: VERSION,
    });
  } catch (e) {
    console.error("JBBuybackHook6:PoolAdded", e);
  }
});
