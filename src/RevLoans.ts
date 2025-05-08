import { ponder } from "ponder:registry";
import {
  borrowEvent,
  liquidateEvent,
  loan,
  reallocateLoanEvent,
  repayLoanEvent,
} from "ponder:schema";
import { REVLoansAbi } from "../abis/REVLoansAbi";
import { ADDRESS } from "./constants/address";
import { getEventParams } from "./util/getEventParams";
import { insertActivityEvent } from "./util/activityEvent";

ponder.on("RevLoans:Borrow", async ({ event, context }) => {
  try {
    const {
      revnetId,
      beneficiary,
      loanId,
      loan: _loan,
      caller,
      source,
      sourceFeeAmount,
      borrowAmount,
      collateralCount,
    } = event.args;

    const projectId = Number(revnetId);

    const tokenUri = await context.client.readContract({
      abi: REVLoansAbi,
      address: ADDRESS.revLoans,
      functionName: "tokenURI",
      args: [loanId],
    });

    await context.db.insert(loan).values({
      id: loanId,
      projectId,
      chainId: context.network.chainId,
      owner: caller,
      beneficiary,
      borrowAmount,
      collateral: collateralCount,
      createdAt: _loan.createdAt,
      token: source.token,
      terminal: source.terminal,
      sourceFeeAmount,
      prepaidDuration: _loan.prepaidDuration,
      prepaidFeePercent: _loan.prepaidFeePercent,
      tokenUri,
    });

    const { id } = await context.db.insert(borrowEvent).values({
      ...getEventParams({ event, context }),
      projectId,
      beneficiary,
      borrowAmount,
      collateral: collateralCount,
      token: source.token,
      terminal: source.terminal,
      sourceFeeAmount,
      prepaidDuration: _loan.prepaidDuration,
      prepaidFeePercent: _loan.prepaidFeePercent,
    });
    await insertActivityEvent("borrowEvent", {
      id,
      event,
      context,
      projectId,
    });
  } catch (e) {
    console.error("RevLoans:Borrow", e);
  }
});

ponder.on("RevLoans:Liquidate", async ({ event, context }) => {
  try {
    const { loanId, revnetId, loan: _loan, caller } = event.args;

    const projectId = Number(revnetId);

    await context.db
      .update(loan, {
        id: loanId,
        chainId: context.network.chainId,
      })
      .set({
        collateral: _loan.collateral,
        borrowAmount: _loan.amount,
      });

    const { id } = await context.db.insert(liquidateEvent).values({
      ...getEventParams({ event, context }),
      projectId,
      borrowAmount: _loan.amount,
      collateral: _loan.collateral,
    });
    await insertActivityEvent("liquidateEvent", {
      id,
      event,
      context,
      projectId,
    });
  } catch (e) {
    console.error("RevLoans:Liquidate", e);
  }
});

ponder.on("RevLoans:RepayLoan", async ({ event, context }) => {
  try {
    const {
      loanId,
      loan: _loan,
      paidOffLoanId,
      paidOffLoan,
      revnetId,
      repayBorrowAmount,
      sourceFeeAmount,
      collateralCountToReturn,
      beneficiary,
      caller,
    } = event.args;

    const projectId = Number(revnetId);

    const shouldCreateLoan = loanId !== paidOffLoanId;

    if (shouldCreateLoan) {
      // loan is partially paid off. old loan is burned, we create new loan from `paidOffLoan`. old loan handled by Transfer
      await context.db.insert(loan).values({
        id: paidOffLoanId,
        projectId,
        chainId: context.network.chainId,
        createdAt: paidOffLoan.createdAt,
        borrowAmount: paidOffLoan.amount,
        collateral: paidOffLoan.collateral,
        prepaidDuration: paidOffLoan.prepaidDuration,
        prepaidFeePercent: paidOffLoan.prepaidFeePercent,
        token: paidOffLoan.source.token,
        terminal: paidOffLoan.source.terminal,
        beneficiary,
        sourceFeeAmount,
        owner: caller,
      });
    } else {
      // loan is completely paid off and burned. (owner updated on Transfer)
      await context.db
        .update(loan, { id: loanId, chainId: context.network.chainId })
        .set({
          borrowAmount: BigInt(0),
          collateral: BigInt(0),
          sourceFeeAmount, // not sure if necessary
          beneficiary, // not sure if necessary
        });
    }

    const { id } = await context.db.insert(repayLoanEvent).values({
      ...getEventParams({ event, context }),
      projectId,
      loanId,
      paidOffLoanId,
      repayBorrowAmount,
      collateralCountToReturn,
    });

    await insertActivityEvent("repayLoanEvent", {
      id,
      event,
      context,
      projectId,
    });
  } catch (e) {
    console.error("RevLoans:RepayLoan", e);
  }
});

ponder.on("RevLoans:SetTokenUriResolver", async ({ event, context }) => {
  try {
    const loans = await context.db.sql.select().from(loan);

    // update tokenUri for all loans
    await Promise.all(
      loans.map(async (l) => {
        const tokenUri = await context.client.readContract({
          abi: REVLoansAbi,
          address: ADDRESS.revLoans,
          functionName: "tokenURI",
          args: [l.id],
        });

        return context.db
          .update(loan, { id: l.id, chainId: context.network.chainId })
          .set({ tokenUri });
      })
    );
  } catch (e) {
    console.error("RevLoans:SetTokenUriResolver", e);
  }
});

ponder.on("RevLoans:ReallocateCollateral", async ({ event, context }) => {
  try {
    const {
      loanId,
      revnetId,
      reallocatedLoanId,
      reallocatedLoan,
      removedcollateralCount,
      caller,
    } = event.args;

    const projectId = Number(revnetId);

    await context.db.insert(loan).values({
      id: reallocatedLoanId,
      projectId,
      chainId: context.network.chainId,
      createdAt: reallocatedLoan.createdAt,
      borrowAmount: reallocatedLoan.amount,
      collateral: reallocatedLoan.collateral,
      prepaidDuration: reallocatedLoan.prepaidDuration,
      prepaidFeePercent: reallocatedLoan.prepaidFeePercent,
      token: reallocatedLoan.source.token,
      terminal: reallocatedLoan.source.terminal,
      beneficiary: caller,
      sourceFeeAmount: BigInt(0),
      owner: caller,
    });

    const { id } = await context.db.insert(reallocateLoanEvent).values({
      ...getEventParams({ event, context }),
      loanId,
      reallocatedLoanId,
      projectId,
      removedCollateralCount: removedcollateralCount,
    });

    await insertActivityEvent("reallocateLoanEvent", {
      id,
      event,
      context,
      projectId,
    });
  } catch (e) {
    console.error("RevLoans:ReallocateCollateral", e);
  }
});

ponder.on("RevLoans:Transfer", async ({ event, context }) => {
  try {
    const { to, tokenId } = event.args;

    // There are three cases where a Loan NFT is minted: Borrow, ReallocateCollateral, and RepayLoan* (*where a loan is not completely repaid)
    // Mint (Transfer) event will emit before either event. But if we insert a loan here it will have 0 values (unless we do a contract call)
    // Instead we will only create loans at Borrow/RepayLoan
    const existingLoan = await context.db.find(loan, {
      id: tokenId,
      chainId: context.network.chainId,
    });

    if (!existingLoan) return;

    await context.db
      .update(loan, { id: tokenId, chainId: context.network.chainId })
      .set({ owner: to });
  } catch (e) {
    console.error("RevLoans:Transfer", e);
  }
});
