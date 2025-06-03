import { ponder } from "ponder:registry";
import {
  mintTokensEvent,
  project,
  sendReservedTokensToSplitEvent,
  sendReservedTokensToSplitsEvent,
} from "ponder:schema";
import { getEventParams } from "./util/getEventParams";
import { parseProjectMetadata } from "./util/projectMetadata";
import { insertActivityEvent } from "./util/activityEvent";
import { isAddressEqual } from "viem";
import { ADDRESS } from "./constants/address";

ponder.on("JBController4_1:MintTokens", async ({ event, context }) => {
  try {
    const _project = await context.db.find(project, {
      projectId: Number(event.args.projectId),
      chainId: context.chain.id,
    });

    if (!_project) {
      throw new Error("Missing project");
    }

    const { id } = await context.db.insert(mintTokensEvent).values({
      ...getEventParams({ event, context }),
      suckerGroupId: _project.suckerGroupId,
      projectId: Number(event.args.projectId),
      beneficiary: event.args.beneficiary,
      beneficiaryTokenCount: event.args.beneficiaryTokenCount,
      memo: event.args.memo,
      reservedPercent: event.args.reservedPercent,
      tokenCount: event.args.tokenCount,
    });

    await insertActivityEvent("mintTokensEvent", {
      id,
      event,
      context,
      projectId: event.args.projectId,
    });
  } catch (e) {
    console.error("JBController4_1:MintTokens", e);
  }
});

ponder.on("JBController4_1:LaunchProject", async ({ event, context }) => {
  // Emitted after JBProjects:Create. This is only needed to set deployer + metadataUri
  // If the controller emits a launchProject event, the project launch tx was called via the JBController, and we want to prefer its `caller` param over any existing value
  const { projectId: _projectId, caller, projectUri } = event.args;
  const projectId = Number(_projectId);
  const chainId = context.chain.id;
  try {
    const metadata = await parseProjectMetadata(projectUri);

    await context.db.update(project, { chainId, projectId }).set({
      deployer: caller,
      isRevnet: isAddressEqual(caller, ADDRESS.revDeployer),
      metadataUri: projectUri,
      metadata,
      name: metadata?.name,
      infoUri: metadata?.infoUri,
      logoUri: metadata?.logoUri,
      coverImageUri: metadata?.coverImageUri,
      twitter: metadata?.twitter,
      discord: metadata?.discord,
      telegram: metadata?.telegram,
      tokens: metadata?.tokens,
      domain: metadata?.domain,
      description: metadata?.description,
      tags: metadata?.tags,
      projectTagline: metadata?.projectTagline,
    });
  } catch (e) {
    console.error("JBController4_1:LaunchProject", e, event.transaction.hash);
  }
});

ponder.on("JBController4_1:SetUri", async ({ event, context }) => {
  try {
    const { projectId: _projectId, uri } = event.args;
    const projectId = Number(_projectId);
    const chainId = context.chain.id;

    const metadata = await parseProjectMetadata(uri);

    await context.db.update(project, { chainId, projectId }).set({
      metadataUri: uri,
      metadata,
      name: metadata?.name,
      infoUri: metadata?.infoUri,
      logoUri: metadata?.logoUri,
      coverImageUri: metadata?.coverImageUri,
      twitter: metadata?.twitter,
      discord: metadata?.discord,
      telegram: metadata?.telegram,
      tokens: metadata?.tokens,
      domain: metadata?.domain,
      description: metadata?.description,
      tags: metadata?.tags,
      projectTagline: metadata?.projectTagline,
    });
  } catch (e) {
    console.error("JBController4_1:SetUri", e, event.transaction.hash);
  }
});

ponder.on(
  "JBController4_1:SendReservedTokensToSplits",
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

      const _project = await context.db.find(project, {
        projectId: Number(event.args.projectId),
        chainId: context.chain.id,
      });

      if (!_project) {
        throw new Error("Missing project");
      }

      const { id } = await context.db
        .insert(sendReservedTokensToSplitsEvent)
        .values({
          ...getEventParams({ event, context }),
          suckerGroupId: _project.suckerGroupId,
          projectId: Number(projectId),
          from: event.transaction.from,
          tokenCount: tokenCount,
          leftoverAmount: leftoverAmount,
          owner: owner,
          rulesetId: Number(rulesetId),
          rulesetCycleNumber: Number(rulesetCycleNumber),
        });

      await insertActivityEvent("sendReservedTokensToSplitsEvent", {
        id,
        event,
        context,
        projectId,
      });
    } catch (e) {
      console.error("JBController4_1:SendReservedTokensToSplits", e);
    }
  }
);

ponder.on(
  "JBController4_1:SendReservedTokensToSplit",
  async ({ event, context }) => {
    try {
      const { split, rulesetId, projectId, tokenCount, groupId } = event.args;

      const _project = await context.db.find(project, {
        projectId: Number(event.args.projectId),
        chainId: context.chain.id,
      });

      if (!_project) {
        throw new Error("Missing project");
      }

      const { id } = await context.db
        .insert(sendReservedTokensToSplitEvent)
        .values({
          ...getEventParams({ event, context }),
          suckerGroupId: _project.suckerGroupId,
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

      await insertActivityEvent("sendReservedTokensToSplitEvent", {
        id,
        event,
        context,
        projectId,
      });
    } catch (e) {
      console.error("JBController4_1:SendReservedTokensToSplit", e);
    }
  }
);
