import { ponder } from "ponder:registry";
import {
  addToBalanceEvent,
  cashOutTokensEvent,
  project,
  sendPayoutsEvent,
  sendPayoutToSplitEvent,
  useAllowanceEvent,
} from "ponder:schema";
import { getEventParams } from "./util/getEventParams";

ponder.on("JBMultiTerminal:AddToBalance", async ({ event, context }) => {
  try {
    const { projectId, amount, memo, metadata, returnedFees } = event.args;

    const _project = await context.db.find(project, {
      chainId: context.network.chainId,
      projectId,
    });

    if (!_project) {
      throw new Error("Missing project");
    }

    await context.db
      .update(project, {
        chainId: context.network.chainId,
        projectId,
      })
      .set({ balance: _project.balance + amount });

    await context.db.insert(addToBalanceEvent).values({
      ...getEventParams({ event, context }),
      projectId,
      amount,
      memo,
      metadata,
      returnedFees,
    });
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

    const _project = await context.db.find(project, {
      chainId: context.network.chainId,
      projectId,
    });

    if (!_project) {
      throw new Error("Missing project");
    }

    await context.db
      .update(project, {
        chainId: context.network.chainId,
        projectId,
      })
      .set({
        balance: _project.balance - amountPaidOut,
      });

    await context.db.insert(sendPayoutsEvent).values({
      ...getEventParams({ event, context }),
      projectId,
      amount,
      amountPaidOut,
      netLeftoverPayoutAmount,
      // amountUsd: t.bigint().notNull(),
      // amountPaidOutUsd: t.bigint().notNull(),
      fee,
      // feeUsd: t.bigint().notNull(),
      rulesetId,
      rulesetCycleNumber,
    });
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
      projectId,
      amount,
      netAmount,
      rulesetId,
      group,
      beneficiary: split.beneficiary,
      lockedUntil: split.lockedUntil,
      hook: split.hook,
      percent: split.percent,
      preferAddToBalance: split.preferAddToBalance,
      splitProjectId: split.projectId,
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

    const _project = await context.db.find(project, {
      chainId: context.network.chainId,
      projectId,
    });

    if (!_project) {
      throw new Error("Missing project");
    }

    await context.db
      .update(project, {
        projectId,
        chainId: context.network.chainId,
      })
      .set({
        totalRedeemed: _project.totalRedeemed + reclaimAmount,
        balance: _project.balance - reclaimAmount,
      });

    await context.db.insert(cashOutTokensEvent).values({
      ...getEventParams({ event, context }),
      projectId,
      cashOutCount,
      beneficiary,
      holder,
      reclaimAmount,
      metadata,
      cashOutTaxRate,
      rulesetCycleNumber,
      rulesetId,
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

    const _project = await context.db.find(project, {
      chainId: context.network.chainId,
      projectId,
    });

    if (!_project) {
      throw new Error("Missing project");
    }

    await context.db
      .update(project, {
        chainId: context.network.chainId,
        projectId,
      })
      .set({
        balance: _project.balance - event.args.amountPaidOut,
      });

    await context.db.insert(useAllowanceEvent).values({
      ...getEventParams({ event, context }),
      projectId,
      amount,
      amountPaidOut,
      netAmountPaidOut,
      beneficiary,
      feeBeneficiary,
      memo,
      rulesetCycleNumber,
      rulesetId,
    });
  } catch (e) {
    console.error("JBMultiTerminal:UseAllowance", e);
  }
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
