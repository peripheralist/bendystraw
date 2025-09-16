import { ponder } from "ponder:registry";
import { loan, reallocateLoanEvent, repayLoanEvent } from "ponder:schema";
import { REVLoansAbi } from "../abis/REVLoansAbi";
import { ADDRESS } from "./constants/address";
import { getEventParams } from "./util/getEventParams";
import { insertActivityEvent } from "./util/activityEvent";
import { borrowLoanEvent } from "ponder:schema";
import { liquidateLoanEvent } from "ponder:schema";
import { project } from "ponder:schema";
import { getVersion } from "./util/getVersion";

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

    const version = getVersion(event, "revLoans5");

    const _project = await context.db.find(project, {
      projectId: Number(event.args.revnetId),
      chainId: context.chain.id,
      version,
    });

    if (!_project) {
      throw new Error("Missing project");
    }

    const tokenUri = await context.client.readContract({
      abi: REVLoansAbi,
      address: ADDRESS.revLoans,
      functionName: "tokenURI",
      args: [loanId],
    });

    await context.db
      .insert(loan)
      .values({
        id: loanId,
        projectId,
        chainId: context.chain.id,
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
        version,
      })
      // TODO Not sure why there would be a conflict, but duplicate key errors are being thrown
      .onConflictDoUpdate({
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

    const { id } = await context.db.insert(borrowLoanEvent).values({
      ...getEventParams({ event, context }),
      projectId,
      suckerGroupId: _project.suckerGroupId,
      beneficiary,
      borrowAmount,
      collateral: collateralCount,
      token: source.token,
      terminal: source.terminal,
      sourceFeeAmount,
      prepaidDuration: _loan.prepaidDuration,
      prepaidFeePercent: _loan.prepaidFeePercent,
      version,
    });
    await insertActivityEvent("borrowLoanEvent", {
      id,
      event,
      context,
      projectId,
      version,
    });
  } catch (e) {
    console.error("RevLoans:Borrow", e);
  }
});

ponder.on("RevLoans:Liquidate", async ({ event, context }) => {
  try {
    const { loanId, revnetId, loan: _loan } = event.args;

    const projectId = Number(revnetId);

    const version = getVersion(event, "revLoans5");

    const _project = await context.db.find(project, {
      projectId: Number(event.args.revnetId),
      chainId: context.chain.id,
      version,
    });

    if (!_project) {
      throw new Error("Missing project");
    }

    await context.db
      .update(loan, {
        id: loanId,
        chainId: context.chain.id,
        version,
      })
      .set({
        collateral: _loan.collateral,
        borrowAmount: _loan.amount,
      });

    const { id } = await context.db.insert(liquidateLoanEvent).values({
      ...getEventParams({ event, context }),
      suckerGroupId: _project.suckerGroupId,
      projectId,
      borrowAmount: _loan.amount,
      collateral: _loan.collateral,
      version,
    });
    await insertActivityEvent("liquidateLoanEvent", {
      id,
      event,
      context,
      projectId,
      version,
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

    const version = getVersion(event, "revLoans5");

    const shouldCreateLoan = loanId !== paidOffLoanId;

    const _project = await context.db.find(project, {
      projectId: Number(event.args.revnetId),
      chainId: context.chain.id,
      version,
    });

    if (!_project) {
      throw new Error("Missing project");
    }

    if (shouldCreateLoan) {
      // loan is partially paid off. old loan is burned, we create new loan from `paidOffLoan`. old loan handled by Transfer
      await context.db
        .insert(loan)
        .values({
          id: paidOffLoanId,
          projectId,
          chainId: context.chain.id,
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
          version,
        })
        .onConflictDoUpdate(() => ({
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
        }));
    } else {
      // loan is completely paid off and burned. (owner updated on Transfer)
      await context.db
        .update(loan, { id: loanId, chainId: context.chain.id, version })
        .set({
          borrowAmount: BigInt(0),
          collateral: BigInt(0),
          sourceFeeAmount, // not sure if necessary
          beneficiary, // not sure if necessary
        });
    }

    const { id } = await context.db.insert(repayLoanEvent).values({
      ...getEventParams({ event, context }),
      suckerGroupId: _project.suckerGroupId,
      projectId,
      loanId,
      paidOffLoanId,
      repayBorrowAmount,
      collateralCountToReturn,
      version,
    });

    await insertActivityEvent("repayLoanEvent", {
      id,
      event,
      context,
      projectId,
      version,
    });
  } catch (e) {
    console.error("RevLoans:RepayLoan", e);
  }
});

ponder.on("RevLoans:SetTokenUriResolver", async ({ event, context }) => {
  try {
    const loans = await context.db.sql.query.loan.findMany();

    const version = getVersion(event, "revLoans5");

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
          .update(loan, { id: l.id, chainId: context.chain.id, version })
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

    const version = getVersion(event, "revLoans5");

    const _project = await context.db.find(project, {
      projectId: Number(event.args.revnetId),
      chainId: context.chain.id,
      version,
    });

    if (!_project) {
      throw new Error("Missing project");
    }

    await context.db
      .insert(loan)
      .values({
        id: reallocatedLoanId,
        projectId,
        chainId: context.chain.id,
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
        version,
      })
      .onConflictDoUpdate({
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
      suckerGroupId: _project.suckerGroupId,
      loanId,
      reallocatedLoanId,
      projectId,
      removedCollateralCount: removedcollateralCount,
      version,
    });

    await insertActivityEvent("reallocateLoanEvent", {
      id,
      event,
      context,
      projectId,
      version,
    });
  } catch (e) {
    console.error("RevLoans:ReallocateCollateral", e);
  }
});

ponder.on("RevLoans:Transfer", async ({ event, context }) => {
  try {
    const { to, tokenId } = event.args;

    const version = getVersion(event, "revLoans5");

    // There are three cases where a Loan NFT is minted: Borrow, ReallocateCollateral, and RepayLoan* (*where a loan is not completely repaid)
    // Mint (Transfer) event will emit before either event. But if we insert a loan here it will have 0 values (unless we do a contract call)
    // Instead we will only create loans at Borrow/RepayLoan
    const existingLoan = await context.db.find(loan, {
      id: tokenId,
      chainId: context.chain.id,
      version,
    });

    if (!existingLoan) return;

    await context.db
      .update(loan, { id: tokenId, chainId: context.chain.id, version })
      .set({ owner: to });
  } catch (e) {
    console.error("RevLoans:Transfer", e);
  }
});
