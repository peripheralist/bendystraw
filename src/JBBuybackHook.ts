import { Context } from "ponder:registry";
import { ponder } from "ponder:registry";
import { buybackPoolEvent, project, swapEvent } from "ponder:schema";
import { insertActivityEvent } from "./util/activityEvent";
import { getEventParams } from "./util/getEventParams";

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

// Buy-side AMM trade: terminal tokens swapped for project tokens on a payment.
ponder.on("JBBuybackHook6:Swap", async ({ event, context }) => {
  try {
    const { projectId: _projectId, amountToSwapWith, amountReceived, poolId } =
      event.args;
    const projectId = Number(_projectId);

    const _project = await findProject(context, projectId);

    const { id } = await context.db.insert(swapEvent).values({
      ...getEventParams({ event, context }),
      projectId,
      suckerGroupId: _project.suckerGroupId,
      version: VERSION,
      direction: "buy",
      poolId,
      terminalTokenAmount: amountToSwapWith,
      projectTokenAmount: amountReceived,
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
    console.error("JBBuybackHook6:Swap", e);
  }
});

// Sell-side AMM trade: reminted project tokens swapped for terminal tokens on a cash out.
ponder.on("JBBuybackHook6:CashOutSwap", async ({ event, context }) => {
  try {
    const { projectId: _projectId, cashOutCount, amountReceived, poolId } =
      event.args;
    const projectId = Number(_projectId);

    const _project = await findProject(context, projectId);

    const { id } = await context.db.insert(swapEvent).values({
      ...getEventParams({ event, context }),
      projectId,
      suckerGroupId: _project.suckerGroupId,
      version: VERSION,
      direction: "sell",
      poolId,
      terminalTokenAmount: amountReceived,
      projectTokenAmount: cashOutCount,
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
    console.error("JBBuybackHook6:CashOutSwap", e);
  }
});

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

    const { id } = await context.db.insert(buybackPoolEvent).values({
      ...getEventParams({ event, context }),
      projectId,
      suckerGroupId: _project.suckerGroupId,
      version: VERSION,
      terminalToken,
      poolId,
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
