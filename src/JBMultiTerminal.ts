import { ponder } from "ponder:registry";
import {
  addToBalanceEvent,
  cashOutTokensEvent,
  participant,
  payEvent,
  project,
  projectPayer,
  sendPayoutsEvent,
  sendPayoutToSplitEvent,
  useAllowanceEvent,
  wallet,
} from "ponder:schema";
import { insertActivityEvent } from "./util/activityEvent";
import { getEventParams } from "./util/getEventParams";
import { getLatestPayEvent } from "./util/getLatestPayEvent";
import { onProjectStatsUpdated } from "./util/onProjectStatsUpdated";
import { setParticipantSnapshot } from "./util/participantSnapshot";
import { handleTrendingPayment } from "./util/trending";
import { usdPriceForToken, usdRate18ForToken } from "./util/usdPrice";
import { getVersion, type Version } from "./util/getVersion";
import { erc20Abi, isAddressEqual, zeroAddress } from "viem";
import type { Context } from "ponder:registry";

async function updateProjectPayerStats({
  context,
  version,
  projectId,
  address,
  amount,
  amountUsd,
  timestamp,
  mode,
}: {
  context: Context;
  version: Version;
  projectId: number;
  address: `0x${string}`;
  amount: bigint;
  amountUsd: bigint;
  timestamp: number;
  mode: "pay" | "addToBalance";
}) {
  await context.db
    .update(projectPayer, {
      chainId: context.chain.id,
      projectId,
      version,
      address,
    })
    .set((p) => ({
      ...(mode === "pay"
        ? {
            volume: p.volume + amount,
            volumeUsd: p.volumeUsd + amountUsd,
            paymentsCount: p.paymentsCount + 1,
          }
        : {
            balanceAdded: p.balanceAdded + amount,
            balanceAddedUsd: p.balanceAddedUsd + amountUsd,
            addToBalanceCount: p.addToBalanceCount + 1,
          }),
      totalFacilitated: p.totalFacilitated + amount,
      totalFacilitatedUsd: p.totalFacilitatedUsd + amountUsd,
      lastUsedAt: timestamp,
    }));
}

async function findProjectPayerAddress({
  context,
  version,
  projectId,
  caller,
}: {
  context: Context;
  version: Version;
  projectId: number;
  caller: `0x${string}`;
}) {
  const address = caller.toLowerCase() as `0x${string}`;
  const existingProjectPayer = await context.db.find(projectPayer, {
    chainId: context.chain.id,
    projectId,
    version,
    address,
  });

  return existingProjectPayer ? address : null;
}

ponder.on("JBMultiTerminal:AddToBalance", async ({ event, context }) => {
  try {
    const { projectId, amount, memo, metadata, returnedFees } = event.args;

    const version = getVersion(event, "jbMultiTerminal");

    const _project = await context.db.find(project, {
      chainId: context.chain.id,
      projectId: Number(projectId),
      version,
    });

    if (!_project) {
      throw new Error("Missing project");
    }

    // Valued BEFORE the balance update so the USD delta accrues alongside the
    // raw one, in the context in force right now.
    const amountUsd = await usdPriceForToken({
      context,
      version,
      projectId,
      amount,
      currency: _project.currency,
      token: _project.token,
      decimals: _project.decimals,
      timestamp: event.block.timestamp,
    });

    // update project
    const updatedProject = await context.db
      .update(project, {
        chainId: context.chain.id,
        projectId: Number(projectId),
        version,
      })
      .set((p) => ({
        balance: p.balance + amount,
        balanceUsd: p.balanceUsd + amountUsd,
      }));

    const projectPayerAddress = await findProjectPayerAddress({
      context,
      version,
      projectId: Number(projectId),
      caller: event.args.caller,
    });

    if (projectPayerAddress) {
      await updateProjectPayerStats({
        context,
        version,
        projectId: Number(projectId),
        address: projectPayerAddress,
        amount,
        amountUsd,
        timestamp: Number(event.block.timestamp),
        mode: "addToBalance",
      });
    }

    await onProjectStatsUpdated({
      projectId,
      version,
      event,
      context,
      _project: updatedProject,
    });

    // insert event
    const { id } = await context.db.insert(addToBalanceEvent).values({
      ...getEventParams({ event, context }),
      suckerGroupId: updatedProject.suckerGroupId,
      projectId: Number(projectId),
      amount,
      amountUsd,
      memo,
      metadata,
      returnedFees,
      version,
    });
    await insertActivityEvent("addToBalanceEvent", {
      id,
      event,
      context,
      projectId,
      suckerGroupId: updatedProject.suckerGroupId,
      version,
    });
  } catch (e) {
    console.error("JBMultiTerminal:AddToBalance", e);
  }
});

ponder.on("JBMultiTerminal:SendPayouts", async ({ event, context }) => {
  try {
    const {
      projectId: _projectId,
      amount,
      amountPaidOut,
      netLeftoverPayoutAmount,
      fee,
      rulesetCycleNumber,
      rulesetId,
    } = event.args;

    const { timestamp } = event.block;

    const projectId = Number(_projectId);

    const version = getVersion(event, "jbMultiTerminal");

    const _project = await context.db.find(project, {
      chainId: context.chain.id,
      projectId: projectId,
      version,
    });

    if (!_project) {
      throw new Error("Missing project");
    }

    // One 18-dec USD-per-whole-token rate reused for every conversion. The
    // previous 1e18-sized usdPriceForToken probe returned token-decimal-scaled
    // values, so USD figures for non-18-decimal accounting tokens were wrong.
    const usdRate = await usdRate18ForToken({
      context,
      version,
      projectId: _projectId,
      currency: _project.currency,
      token: _project.token,
      timestamp,
    });
    const scale = BigInt(10) ** BigInt(_project.decimals ?? 18);
    const amountUsd = usdRate > 0 ? (amount * usdRate) / scale : BigInt(0);
    const amountPaidOutUsd = usdRate > 0 ? (amountPaidOut * usdRate) / scale : BigInt(0);
    const feeUsd = usdRate > 0 ? (fee * usdRate) / scale : BigInt(0);

    // update project
    const updatedProject = await context.db
      .update(project, {
        chainId: context.chain.id,
        projectId: projectId,
        version,
      })
      .set((p) => ({
        balance: p.balance - amountPaidOut,
        balanceUsd: p.balanceUsd - amountPaidOutUsd,
      }));

    const { suckerGroupId } = updatedProject;

    await onProjectStatsUpdated({
      projectId,
      version,
      event,
      context,
      _project: updatedProject,
    });

    // insert event
    const { id } = await context.db.insert(sendPayoutsEvent).values({
      ...getEventParams({ event, context }),
      suckerGroupId,
      projectId: Number(projectId),
      amount,
      amountUsd,
      amountPaidOut,
      amountPaidOutUsd,
      netLeftoverPayoutAmount,
      fee,
      feeUsd,
      rulesetId: Number(rulesetId),
      rulesetCycleNumber: Number(rulesetCycleNumber),
      version,
    });
    await insertActivityEvent("sendPayoutsEvent", {
      id,
      event,
      context,
      projectId,
      suckerGroupId,
      version,
    });
  } catch (e) {
    console.error("JBMultiTerminal:SendPayouts", e);
  }
});

ponder.on("JBMultiTerminal:SendPayoutToSplit", async ({ event, context }) => {
  try {
    const {
      projectId: _projectId,
      amount,
      netAmount,
      rulesetId,
      split,
      group,
    } = event.args;
    const projectId = Number(_projectId);

    const version = getVersion(event, "jbMultiTerminal");

    const _project = await context.db.find(project, {
      projectId,
      chainId: context.chain.id,
      version,
    });

    if (!_project) {
      throw new Error("Missing project");
    }

    // insert event
    const { id } = await context.db.insert(sendPayoutToSplitEvent).values({
      ...getEventParams({ event, context }),
      suckerGroupId: _project.suckerGroupId,
      projectId: projectId,
      amount,
      amountUsd: await usdPriceForToken({
        context,
        version,
        projectId: _projectId,
        amount,
        currency: _project.currency,
        token: _project.token,
        decimals: _project.decimals,
        timestamp: event.block.timestamp,
      }),
      netAmount,
      rulesetId: Number(rulesetId),
      group,
      beneficiary: split.beneficiary,
      lockedUntil: BigInt(split.lockedUntil),
      hook: split.hook,
      percent: split.percent,
      preferAddToBalance: split.preferAddToBalance,
      splitProjectId: Number(split.projectId),
      version,
    });
    await insertActivityEvent("sendPayoutToSplitEvent", {
      id,
      event,
      context,
      projectId,
      suckerGroupId: _project.suckerGroupId,
      version,
    });

    // DistributeToPayoutSplitEvent always occurs right after the Pay event, in the case of split payments to projects
    if (split.projectId > 0) {
      const latestPayEvent = await getLatestPayEvent({ context });

      if (latestPayEvent?.projectId !== Number(split.projectId)) {
        throw new Error(
          `Mismatched latest pay event: tx: ${event.transaction.hash}, chain: ${context.chain.id}, projectId: ${split.projectId}`
        );
      }

      await context.db.update(payEvent, latestPayEvent).set({
        distributionFromProjectId: projectId,
      });
    }
  } catch (e) {
    console.error("JBMultiTerminal:SendPayoutToSplit", e);
  }
});

ponder.on("JBMultiTerminal:CashOutTokens", async ({ event, context }) => {
  try {
    const {
      projectId: _projectId,
      cashOutCount,
      beneficiary,
      cashOutTaxRate,
      holder,
      reclaimAmount,
      metadata,
      rulesetCycleNumber,
      rulesetId,
    } = event.args;
    const { id: chainId } = context.chain;

    const projectId = Number(_projectId);

    const version = getVersion(event, "jbMultiTerminal");

    const _project = await context.db.find(project, {
      projectId,
      chainId: context.chain.id,
      version,
    });

    if (!_project) {
      throw new Error("Missing project");
    }

    const reclaimAmountUsd = await usdPriceForToken({
      context,
      version,
      projectId: _projectId,
      amount: reclaimAmount,
      currency: _project.currency,
      token: _project.token,
      decimals: _project.decimals,
      timestamp: event.block.timestamp,
    });

    // update project
    const updatedProject = await context.db
      .update(project, {
        projectId,
        chainId,
        version,
      })
      .set((p) => ({
        redeemCount: p.redeemCount + 1,
        redeemVolume: p.redeemVolume + reclaimAmount,
        redeemVolumeUsd: p.redeemVolumeUsd + reclaimAmountUsd,
        balance: p.balance - reclaimAmount,
        balanceUsd: p.balanceUsd - reclaimAmountUsd,
      }));

    const { suckerGroupId } = updatedProject;

    await onProjectStatsUpdated({
      version,
      projectId,
      event,
      context,
      _project: updatedProject,
    });

    // insert event
    const { id } = await context.db.insert(cashOutTokensEvent).values({
      ...getEventParams({ event, context }),
      suckerGroupId,
      projectId,
      cashOutCount,
      beneficiary,
      holder,
      reclaimAmount,
      reclaimAmountUsd,
      metadata,
      cashOutTaxRate,
      rulesetCycleNumber,
      rulesetId,
      version,
    });
    await insertActivityEvent("cashOutTokensEvent", {
      id,
      event,
      context,
      projectId,
      suckerGroupId,
      version,
    });
  } catch (e) {
    console.error("JBMultiTerminal:CashOutTokens", e);
  }
});

ponder.on("JBMultiTerminal:UseAllowance", async ({ event, context }) => {
  try {
    const {
      projectId,
      amount,
      amountPaidOut,
      netAmountPaidOut,
      beneficiary,
      feeBeneficiary,
      memo,
      rulesetCycleNumber,
      rulesetId,
    } = event.args;

    const version = getVersion(event, "jbMultiTerminal");

    const _project = await context.db.find(project, {
      chainId: context.chain.id,
      projectId: Number(projectId),
      version,
    });

    if (!_project) {
      throw new Error("Missing project");
    }

    const amountPaidOutUsd = await usdPriceForToken({
      context,
      version,
      projectId,
      amount: amountPaidOut,
      currency: _project.currency,
      token: _project.token,
      decimals: _project.decimals,
      timestamp: event.block.timestamp,
    });

    // update project
    const updatedProject = await context.db
      .update(project, {
        chainId: context.chain.id,
        projectId: Number(projectId),
        version,
      })
      .set((p) => ({
        balance: p.balance - event.args.amountPaidOut,
        balanceUsd: p.balanceUsd - amountPaidOutUsd,
      }));

    const { suckerGroupId } = updatedProject;

    await onProjectStatsUpdated({
      projectId,
      version,
      event,
      context,
      _project: updatedProject,
    });

    // insert event
    const { id } = await context.db.insert(useAllowanceEvent).values({
      ...getEventParams({ event, context }),
      suckerGroupId,
      projectId: Number(projectId),
      amount,
      amountPaidOut,
      netAmountPaidOut,
      beneficiary,
      feeBeneficiary,
      memo,
      rulesetCycleNumber: Number(rulesetCycleNumber),
      rulesetId: Number(rulesetId),
      version,
    });
    await insertActivityEvent("useAllowanceEvent", {
      id,
      event,
      context,
      projectId,
      suckerGroupId,
      version,
    });
  } catch (e) {
    console.error("JBMultiTerminal:UseAllowance", e);
  }
});

ponder.on("JBMultiTerminal:Pay", async ({ event, context }) => {
  try {
    const {
      projectId: _projectId,
      amount,
      beneficiary,
      memo,
      newlyIssuedTokenCount,
      payer,
    } = event.args;
    const { id: chainId } = context.chain;

    const projectId = Number(_projectId);

    const version = getVersion(event, "jbMultiTerminal");

    const _project = await context.db.find(project, {
      projectId,
      chainId: context.chain.id,
      version,
    });

    if (!_project) {
      throw new Error("Missing project");
    }

    const amountUsd = await usdPriceForToken({
      context,
      version,
      projectId: _projectId,
      amount,
      currency: _project.currency,
      token: _project.token,
      decimals: _project.decimals,
      timestamp: event.block.timestamp,
    });

    const projectPayerAddress = await findProjectPayerAddress({
      context,
      version,
      projectId,
      caller: event.args.caller,
    });

    if (projectPayerAddress) {
      await updateProjectPayerStats({
        context,
        version,
        projectId,
        address: projectPayerAddress,
        amount,
        amountUsd,
        timestamp: Number(event.block.timestamp),
        mode: "pay",
      });
    }

    const payerParticipant = await context.db.find(participant, {
      address: payer,
      projectId,
      chainId,
      version,
    });

    // update project
    const updatedProject = await context.db
      .update(project, {
        projectId,
        chainId,
        version,
      })
      .set((p) => ({
        balance: p.balance + amount,
        balanceUsd: p.balanceUsd + amountUsd,
        volume: p.volume + amount,
        volumeUsd: p.volumeUsd + amountUsd,
        paymentsCount: p.paymentsCount + 1,
        contributorsCount: p.contributorsCount + (payerParticipant ? 0 : 1),
      }));

    const { suckerGroupId, isRevnet, isHomerun, isSticky } = updatedProject;

    // will update project trending score (uses raw SQL, updates project in DB)
    await handleTrendingPayment(event.block.timestamp, context);

    // Re-fetch ONLY to get trending values that handleTrendingPayment updated
    const projectAfterTrending = await context.db.find(project, {
      projectId,
      chainId,
      version,
    });

    // Merge: use updatedProject for our changes (balance, volume, etc.)
    // but copy trending fields from re-fetch
    const projectForMoment = {
      ...updatedProject,
      trendingScore: projectAfterTrending?.trendingScore ?? updatedProject.trendingScore,
      trendingVolume: projectAfterTrending?.trendingVolume ?? updatedProject.trendingVolume,
      trendingPaymentsCount: projectAfterTrending?.trendingPaymentsCount ?? updatedProject.trendingPaymentsCount,
    };

    await onProjectStatsUpdated({
      projectId,
      version,
      event,
      context,
      _project: projectForMoment,
    });

    // insert/update payer participant
    const _participant = await context.db
      .insert(participant)
      .values({
        address: payer,
        chainId,
        projectId,
        createdAt: Number(event.block.timestamp),
        volume: amount,
        volumeUsd: amountUsd,
        lastPaidTimestamp: Number(event.block.timestamp),
        suckerGroupId,
        isRevnet,
        isHomerun,
        isSticky,
        version,
      })
      .onConflictDoUpdate((p) => ({
        volume: p.volume + amount,
        volumeUsd: p.volumeUsd + amountUsd,
        lastPaidTimestamp: Number(event.block.timestamp),
        paymentsCount: p.paymentsCount + 1,
        suckerGroupId,
        isRevnet,
        isHomerun,
        isSticky,
      }));
    await setParticipantSnapshot({ participant: _participant, context, event });

    // insert/update payer wallet
    await context.db
      .insert(wallet)
      .values({
        address: payer,
        volume: amount,
        volumeUsd: amountUsd,
      })
      .onConflictDoUpdate((w) => ({
        volume: w.volume + amount,
        volumeUsd: w.volumeUsd + amountUsd,
      }));

    // insert event
    const { id } = await context.db.insert(payEvent).values({
      ...getEventParams({ event, context }),
      suckerGroupId,
      projectId,
      amount,
      amountUsd,
      beneficiary,
      memo,
      newlyIssuedTokenCount,
      version,
    });
    await insertActivityEvent("payEvent", {
      id,
      event,
      context,
      projectId,
      suckerGroupId,
      version,
    });

    // beneficiary participant/wallet will be handled on token mint
  } catch (error) {
    console.error("JBMultiTerminal:Pay", {
      chain: context.chain.id,
      tx: event.transaction.hash,
      error,
    });
  }
});

ponder.on("JBMultiTerminal:HookAfterRecordPay", async ({ event, context }) => {
  try {
    const version = getVersion(event, "jbMultiTerminal");
    const projectId = Number(event.args.context.projectId);
    const amount = event.args.specificationAmount;

    if (amount === BigInt(0)) return;

    const _project = await context.db.find(project, {
      chainId: context.chain.id,
      projectId,
      version,
    });

    if (!_project) {
      throw new Error("Missing project");
    }

    // Valued at the same block as the pay that funded it, so a buyback-routed
    // payment nets to zero in balanceUsd just as it does in balance.
    const amountUsd = await usdPriceForToken({
      context,
      version,
      projectId: BigInt(projectId),
      amount,
      currency: _project.currency,
      token: _project.token,
      decimals: _project.decimals,
      timestamp: event.block.timestamp,
    });

    const updatedProject = await context.db
      .update(project, {
        chainId: context.chain.id,
        projectId,
        version,
      })
      .set((p) => ({
        balance: p.balance - amount,
        balanceUsd: p.balanceUsd - amountUsd,
      }));

    await onProjectStatsUpdated({
      projectId,
      version,
      event,
      context,
      _project: updatedProject,
    });
  } catch (e) {
    console.error("JBMultiTerminal:HookAfterRecordPay", e);
  }
});

ponder.on("JBMultiTerminal:ProcessFee", async ({ event, context }) => {
  try {
    const latestPayEvent = await getLatestPayEvent({
      context,
    });

    if (latestPayEvent?.projectId !== 1) {
      throw new Error(
        "Latest PayEvent projectId != 1" +
          ` (${latestPayEvent?.projectId}), tx: ${context.chain.id} ${event.transaction.hash}`
      );
    }

    await context.db
      .update(payEvent, latestPayEvent)
      .set({ feeFromProject: Number(event.args.projectId) });
  } catch (e) {
    console.error("JBMultiTerminal:ProcessFee", e);
  }
});

ponder.on(
  "JBMultiTerminal:SetAccountingContext",
  async ({ event, context }) => {
    try {
      const version = getVersion(event, "jbMultiTerminal");

      const token = event.args.context.token;

      let tokenSymbol = "ETH";

      if (
        !isAddressEqual(token, zeroAddress) &&
        !isAddressEqual(token, "0x000000000000000000000000000000000000eeee")
      ) {
        try {
          tokenSymbol = await context.client.readContract({
            abi: erc20Abi,
            address: token,
            functionName: "symbol",
          });
        } catch (e) {}
      }

      await context.db
        .update(project, {
          projectId: Number(event.args.projectId),
          chainId: context.chain.id,
          version,
        })
        .set({
          currency: BigInt(event.args.context.currency),
          decimals: event.args.context.decimals,
          token,
          tokenSymbol,
        });
    } catch (e) {
      console.error("JBMultiTerminal:SetAccountingContext", e);
    }
  }
);
