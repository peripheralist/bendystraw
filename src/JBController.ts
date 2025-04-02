import { ponder } from "ponder:registry";
import {
  mintTokensEvent,
  project,
  sendReservedTokensToSplitEvent,
  sendReservedTokensToSplitsEvent,
} from "ponder:schema";
import { getEventParams } from "./util/getEventParams";

ponder.on("JBController:MintTokens", async ({ event, context }) => {
  try {
    await context.db.insert(mintTokensEvent).values({
      ...getEventParams({ event, context }),
      projectId: Number(event.args.projectId),
      beneficiary: event.args.beneficiary,
      beneficiaryTokenCount: event.args.beneficiaryTokenCount,
      memo: event.args.memo,
      reservedPercent: event.args.reservedPercent,
      tokenCount: event.args.tokenCount,
    });
  } catch (e) {
    console.error("JBController:MintTokens", e);
  }
});

ponder.on("JBController:LaunchProject", async ({ event, context }) => {
  try {
    // Emitted after JBProjects:Create. This is only needed to set deployer + metadataUri
    // If the controller emits a launchProject event, the project launch tx was called via the JBController, and we want to prefer its `caller` param over any existing value
    await context.db
      .update(project, {
        chainId: context.network.chainId,
        projectId: Number(event.args.projectId),
      })
      .set({ deployer: event.args.caller, metadataUri: event.args.projectUri });
  } catch (e) {
    console.error("JBController:LaunchProject", e);
  }
});

ponder.on("JBController:SetUri", async ({ event, context }) => {
  try {
    await context.db
      .update(project, {
        chainId: context.network.chainId,
        projectId: Number(event.args.projectId),
      })
      .set({ metadataUri: event.args.uri });
  } catch (e) {
    console.error("JBController:SetUri", e);
  }
});

ponder.on(
  "JBController:SendReservedTokensToSplits",
  async ({ event, context }) => {
    try {
      await context.db.insert(sendReservedTokensToSplitsEvent).values({
        ...getEventParams({ event, context }),
        projectId: Number(event.args.projectId),
        from: event.transaction.from,
        tokenCount: event.args.tokenCount,
        leftoverAmount: event.args.leftoverAmount,
        owner: event.args.owner,
        rulesetId: Number(event.args.rulesetId),
        rulesetCycleNumber: Number(event.args.rulesetCycleNumber),
      });
    } catch (e) {
      console.error("JBController:SendReservedTokensToSplits", e);
    }
  }
);

ponder.on(
  "JBController:SendReservedTokensToSplit",
  async ({ event, context }) => {
    try {
      const { split, rulesetId, projectId, tokenCount, groupId } = event.args;

      await context.db.insert(sendReservedTokensToSplitEvent).values({
        ...getEventParams({ event, context }),
        projectId: Number(projectId),
        rulesetId: Number(rulesetId),
        tokenCount,
        groupId,
        beneficiary: split.beneficiary,
        hook: split.hook,
        lockedUntil: split.lockedUntil,
        percent: split.percent,
        preferAddToBalance: split.preferAddToBalance,
        splitProjectId: Number(split.projectId),
      });
    } catch (e) {
      console.error("JBController:SendReservedTokensToSplit", e);
    }
  }
);

// ponder.on("JBController:LaunchRulesets", async ({ event, context }) => {
//   console.log(event.args);
// });

// ponder.on("JBController:Migrate", async ({ event, context }) => {
//   console.log(event.args);
// });
