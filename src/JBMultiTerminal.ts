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
import { getEventParams } from "./util/getEventParams";

ponder.on("JBMultiTerminal:AddToBalance", async ({ event, context }) => {
  try {
    const { projectId, amount, memo, metadata, returnedFees } = event.args;

    await Promise.all([
      context.db
        .update(project, {
          chainId: context.network.chainId,
          projectId: Number(projectId),
        })
        .set((p) => ({
          balance: p.balance + amount,
        })),

      context.db.insert(addToBalanceEvent).values({
        ...getEventParams({ event, context }),
        projectId: Number(projectId),
        amount,
        memo,
        metadata,
        returnedFees,
      }),
    ]);
  } catch (e) {
    console.error("JBMultiTerminal:AddToBalance", e);
  }
});

ponder.on("JBMultiTerminal:SendPayouts", async ({ event, context }) => {
  try {
    const {
      projectId,
      amount,
      amountPaidOut,
      netLeftoverPayoutAmount,
      fee,
      rulesetCycleNumber,
      rulesetId,
    } = event.args;

    await Promise.all([
      context.db
        .update(project, {
          chainId: context.network.chainId,
          projectId: Number(projectId),
        })
        .set((p) => ({
          balance: p.balance - amountPaidOut,
        })),

      context.db.insert(sendPayoutsEvent).values({
        ...getEventParams({ event, context }),
        projectId: Number(projectId),
        amount,
        amountPaidOut,
        netLeftoverPayoutAmount,
        // amountUsd: t.bigint().notNull(),
        // amountPaidOutUsd: t.bigint().notNull(),
        fee,
        // feeUsd: t.bigint().notNull(),
        rulesetId: Number(rulesetId),
        rulesetCycleNumber: Number(rulesetCycleNumber),
      }),
    ]);
  } catch (e) {
    console.error("JBMultiTerminal:SendPayouts", e);
  }
});

ponder.on("JBMultiTerminal:SendPayoutToSplit", async ({ event, context }) => {
  try {
    const { projectId, amount, netAmount, rulesetId, split, group } =
      event.args;

    await context.db.insert(sendPayoutToSplitEvent).values({
      ...getEventParams({ event, context }),
      projectId: Number(projectId),
      amount,
      netAmount,
      rulesetId: Number(rulesetId),
      group,
      beneficiary: split.beneficiary,
      lockedUntil: split.lockedUntil,
      hook: split.hook,
      percent: split.percent,
      preferAddToBalance: split.preferAddToBalance,
      splitProjectId: Number(split.projectId),
    });

    // TODO
    // // DistributeToPayoutSplitEvent always occurs right after the Pay event, in the case of split payments to projects
    // if (event.params.split.projectId.gt(BIGINT_0)) {
    //   const payEvent = PayEvent.loadInBlock(idForPrevPayEvent());

    //   if (
    //     !payEvent ||
    //     payEvent.projectId != event.params.split.projectId.toI32()
    //   ) {
    //     log.warning(
    //       "[handleDistributeToPayoutSplit] Missing or mismatched pay event. splitProjectId: {}, payEvent projectId: {}",
    //       [
    //         event.params.split.projectId.toString(),
    //         payEvent ? payEvent.projectId.toString() : "missing",
    //       ]
    //     );
    //     return;
    //   } else {
    //     payEvent.distributionFromProjectId = projectId.toI32();
    //     payEvent.save();
    //   }
    // }
  } catch (e) {
    console.error("JBMultiTerminal:SendPayoutToSplit", e);
  }
});

ponder.on("JBMultiTerminal:CashOutTokens", async ({ event, context }) => {
  try {
    const {
      projectId,
      cashOutCount,
      beneficiary,
      cashOutTaxRate,
      holder,
      reclaimAmount,
      metadata,
      rulesetCycleNumber,
      rulesetId,
    } = event.args;

    await Promise.all([
      context.db
        .update(project, {
          projectId: Number(projectId),
          chainId: context.network.chainId,
        })
        .set((p) => ({
          totalRedeemed: p.totalRedeemed + reclaimAmount,
          balance: p.balance - reclaimAmount,
        })),

      context.db.insert(cashOutTokensEvent).values({
        ...getEventParams({ event, context }),
        projectId: Number(projectId),
        cashOutCount,
        beneficiary,
        holder,
        reclaimAmount,
        metadata,
        cashOutTaxRate,
        rulesetCycleNumber,
        rulesetId,
      }),
    ]);
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

    await Promise.all([
      context.db
        .update(project, {
          chainId: context.network.chainId,
          projectId: Number(projectId),
        })
        .set((p) => ({
          balance: p.balance - event.args.amountPaidOut,
        })),

      context.db.insert(useAllowanceEvent).values({
        ...getEventParams({ event, context }),
        projectId: Number(projectId),
        amount,
        amountPaidOut,
        netAmountPaidOut,
        beneficiary,
        feeBeneficiary,
        memo,
        rulesetCycleNumber: Number(rulesetCycleNumber),
        rulesetId: Number(rulesetId),
      }),
    ]);
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
    const { chainId } = context.network;

    const projectId = Number(_projectId);

    await Promise.all([
      context.db
        .update(project, {
          projectId,
          chainId,
        })
        .set((p) => ({
          balance: p.balance + amount,
          totalPaid: p.totalPaid + amount,
        })),

      context.db.insert(payEvent).values({
        ...getEventParams({ event, context }),
        projectId,
        amount,
        beneficiary,
        memo,
        newlyIssuedTokenCount,
      }),
    ]);

    const [payerParticipant, payerWallet] = await Promise.all([
      context.db.find(participant, {
        address: payer,
        chainId,
        projectId,
      }),
      context.db.find(wallet, {
        address: payer,
      }),
    ]);

    if (payerParticipant) {
      // update participant
      await context.db
        .update(participant, {
          address: payer,
          chainId,
          projectId,
        })
        .set({
          volume: payerParticipant.volume + amount,
          lastPaidTimestamp: Number(event.block.timestamp),
        });
    } else {
      // create participant if none exists
      await context.db.insert(participant).values({
        address: payer,
        chainId,
        projectId,
        volume: amount,
        lastPaidTimestamp: Number(event.block.timestamp),
      });
    }

    if (!payerWallet) {
      await context.db.insert(wallet).values({ address: payer });
    }

    // handle beneficiary participant / wallet on token mint
  } catch (e) {
    console.error("JBMultiTerminal:Pay", e);
  }

  // handleTrendingPayment(event.block.timestamp, pay.id);

  // // if (!isDistribution) {
  // const lastPaidTimestamp = event.block.timestamp.toI32();

  // const payer = event.params.payer;

  // const participantId = idForParticipant(projectId, payer);

  // let participant = Participant.load(participantId);

  // // update contributorsCount
  // if (!participant || participant.volume.isZero()) {
  //   project.contributorsCount = project.contributorsCount + 1;
  // }

  // if (!participant) {
  //   participant = newParticipant(projectId, payer);
  // }

  // participant.volume = participant.volume.plus(amount);
  // if (amountUSD) {
  //   participant.volumeUSD = participant.volumeUSD.plus(amountUSD);
  // }
  // participant.lastPaidTimestamp = lastPaidTimestamp;
  // participant.paymentsCount = participant.paymentsCount + 1;
  // participant.save();

  // // Update wallet, create if needed
  // const walletId = toHexLowercase(payer);
  // let wallet = Wallet.load(walletId);
  // if (!wallet) {
  //   wallet = newWallet(walletId);
  // }
  // wallet.volume = wallet.volume.plus(amount);
  // if (amountUSD) {
  //   wallet.volumeUSD = wallet.volumeUSD.plus(amountUSD);
  // }
  // wallet.lastPaidTimestamp = lastPaidTimestamp;
  // wallet.save();
  // // }

  // const protocolLog = ProtocolLog.load(PROTOCOL_ID);
  // if (protocolLog) {
  //   if (amountUSD) {
  //     protocolLog.volumeUSD = protocolLog.volumeUSD.plus(amountUSD);
  //   }
  //   protocolLog.paymentsCount = protocolLog.paymentsCount + 1;
  //   protocolLog.save();
  // }
});

ponder.on("JBMultiTerminal:ProcessFee", async ({ event, context }) => {
  // const id = idForPrevPayEvent();
  // const pay = PayEvent.loadInBlock(id);
  // if (!pay) {
  //   log.error("[handleProcessFee] Missing PayEvent. ID:{}", [id]);
  //   return;
  // }
  // // Sanity check to ensure pay event was to juicebox project
  // if (pay.projectId != 1) return;
  // pay.feeFromProject = projectId.toI32();
  // pay.save();
});
