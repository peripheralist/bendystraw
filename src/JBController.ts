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
  // Emitted after JBProjects:Create. This is only needed to set deployer + metadataUri
  // If the controller emits a launchProject event, the project launch tx was called via the JBController, and we want to prefer its `caller` param over any existing value
  try {
    const { projectId, caller, projectUri } = event.args;

    await context.db
      .update(project, {
        chainId: context.network.chainId,
        projectId: Number(projectId),
      })
      .set({ deployer: caller, metadataUri: projectUri });
  } catch (e) {
    console.error("JBController:LaunchProject", e);
  }
});

ponder.on("JBController:SetUri", async ({ event, context }) => {
  try {
    const { projectId, uri } = event.args;

    await context.db
      .update(project, {
        chainId: context.network.chainId,
        projectId: Number(projectId),
      })
      .set({ metadataUri: uri });
  } catch (e) {
    console.error("JBController:SetUri", e);
  }
});

ponder.on(
  "JBController:SendReservedTokensToSplits",
  async ({ event, context }) => {
    try {
      const {
        projectId,
        tokenCount,
        leftoverAmount,
        owner,
        rulesetId,
        rulesetCycleNumber,
      } = event.args;

      await context.db.insert(sendReservedTokensToSplitsEvent).values({
        ...getEventParams({ event, context }),
        projectId: Number(projectId),
        from: event.transaction.from,
        tokenCount: tokenCount,
        leftoverAmount: leftoverAmount,
        owner: owner,
        rulesetId: Number(rulesetId),
        rulesetCycleNumber: Number(rulesetCycleNumber),
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
