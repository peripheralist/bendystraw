import { ponder } from "ponder:registry";
import {
  addToBalanceEvent,
  cashOutTokensEvent,
  participant,
  payEvent,
  project,
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
import { usdPriceForEth } from "./util/usdPrice";

ponder.on("JBMultiTerminal:AddToBalance", async ({ event, context }) => {
  try {
    const { projectId, amount, memo, metadata, returnedFees } = event.args;

    // update project
    const { suckerGroupId } = await context.db
      .update(project, {
        chainId: context.chain.id,
        projectId: Number(projectId),
      })
      .set((p) => ({
        balance: p.balance + amount,
      }));

    await onProjectStatsUpdated({
      projectId,
      event,
      context,
    });

    // insert event
    const { id } = await context.db.insert(addToBalanceEvent).values({
      ...getEventParams({ event, context }),
      suckerGroupId,
      projectId: Number(projectId),
      amount,
      memo,
      metadata,
      returnedFees,
    });
    await insertActivityEvent("addToBalanceEvent", {
      id,
      event,
      context,
      projectId,
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

    const projectId = Number(_projectId);

    // update project
    const { suckerGroupId } = await context.db
      .update(project, {
        chainId: context.chain.id,
        projectId: projectId,
      })
      .set((p) => ({
        balance: p.balance - amountPaidOut,
      }));

    await onProjectStatsUpdated({
      projectId,
      event,
      context,
    });

    // insert event
    const { id } = await context.db.insert(sendPayoutsEvent).values({
      ...getEventParams({ event, context }),
      suckerGroupId,
      projectId: Number(projectId),
      amount,
      amountUsd: await usdPriceForEth({
        context,
        projectId: _projectId,
        ethAmount: amount,
      }),
      amountPaidOut,
      amountPaidOutUsd: await usdPriceForEth({
        context,
        projectId: _projectId,
        ethAmount: amountPaidOut,
      }),
      netLeftoverPayoutAmount,
      fee,
      feeUsd: await usdPriceForEth({
        context,
        projectId: _projectId,
        ethAmount: fee,
      }),
      rulesetId: Number(rulesetId),
      rulesetCycleNumber: Number(rulesetCycleNumber),
    });
    await insertActivityEvent("sendPayoutsEvent", {
      id,
      event,
      context,
      projectId,
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

    const _project = await context.db.find(project, {
      projectId,
      chainId: context.chain.id,
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
      amountUsd: await usdPriceForEth({
        context,
        projectId: _projectId,
        ethAmount: amount,
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
    });
    await insertActivityEvent("sendPayoutToSplitEvent", {
      id,
      event,
      context,
      projectId,
    });

    // DistributeToPayoutSplitEvent always occurs right after the Pay event, in the case of split payments to projects
    if (split.projectId > 0) {
      const latestPayEvent = await getLatestPayEvent({ context });

      if (latestPayEvent?.projectId !== Number(split.projectId)) {
        throw new Error("Mismatched latest pay event");
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

    const reclaimAmountUsd = await usdPriceForEth({
      context,
      projectId: _projectId,
      ethAmount: reclaimAmount,
    });

    // update project
    const { suckerGroupId } = await context.db
      .update(project, {
        projectId,
        chainId,
      })
      .set((p) => ({
        redeemCount: p.redeemCount + 1,
        redeemVolume: p.redeemVolume + reclaimAmount,
        redeemVolumeUsd: p.redeemVolumeUsd + reclaimAmountUsd,
        balance: p.balance - reclaimAmount,
      }));

    await onProjectStatsUpdated({
      projectId,
      event,
      context,
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
    });
    await insertActivityEvent("cashOutTokensEvent", {
      id,
      event,
      context,
      projectId,
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

    // update project
    const { suckerGroupId } = await context.db
      .update(project, {
        chainId: context.chain.id,
        projectId: Number(projectId),
      })
      .set((p) => ({
        balance: p.balance - event.args.amountPaidOut,
      }));

    await onProjectStatsUpdated({
      projectId,
      event,
      context,
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
    });
    await insertActivityEvent("useAllowanceEvent", {
      id,
      event,
      context,
      projectId,
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

    const amountUsd = await usdPriceForEth({
      context,
      projectId: _projectId,
      ethAmount: amount,
    });

    const payerParticipant = await context.db.find(participant, {
      address: payer,
      projectId,
      chainId,
    });

    // update project
    const { suckerGroupId, isRevnet } = await context.db
      .update(project, {
        projectId,
        chainId,
      })
      .set((p) => ({
        balance: p.balance + amount,
        volume: p.volume + amount,
        volumeUsd: p.volumeUsd + amountUsd,
        paymentsCount: p.paymentsCount + 1,
        contributorsCount: p.contributorsCount + (payerParticipant ? 0 : 1),
      }));

    // will update project trending score
    await handleTrendingPayment(event.block.timestamp, context);

    // ...NOW handle project update
    await onProjectStatsUpdated({
      projectId,
      event,
      context,
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
      })
      .onConflictDoUpdate((p) => ({
        volume: p.volume + amount,
        volumeUsd: p.volumeUsd + amountUsd,
        lastPaidTimestamp: Number(event.block.timestamp),
        paymentsCount: p.paymentsCount + 1,
        suckerGroupId,
        isRevnet,
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
    });
    await insertActivityEvent("payEvent", {
      id,
      event,
      context,
      projectId,
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
      await context.db
        .update(project, {
          projectId: Number(event.args.projectId),
          chainId: context.chain.id,
        })
        .set({
          currency: BigInt(event.args.context.currency),
          decimals: event.args.context.decimals,
          token: event.args.context.token,
        });
    } catch (e) {
      console.error("JBMultiTerminal:SetAccountingContext", e);
    }
  }
);
