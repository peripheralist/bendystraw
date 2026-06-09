import { ponder } from "ponder:registry";
import {
  borrowLoanEvent,
  liquidateLoanEvent,
  loan,
  participant,
  project,
  reallocateLoanEvent,
  repayLoanEvent,
  wallet,
} from "ponder:schema";
import { REVLoansV6Abi } from "../abis/REVLoansV6Abi";
import { ADDRESS } from "./constants/address";
import { insertActivityEvent } from "./util/activityEvent";
import { getEventParams } from "./util/getEventParams";
import { setParticipantSnapshot } from "./util/participantSnapshot";

// V6 REVLoans. Mirrors src/RevLoans.ts, but for the V6 event shapes: the borrowed token comes from the
// flattened `REVLoan.sourceToken` (V5 used a `source` tuple with `{ token, terminal }`), and the Borrow
// event's standalone source tuple became an `address token`. V6 has no per-loan terminal — the source is
// always the revnet's canonical multi terminal, so we record that (jbMultiTerminal6) for the `terminal`
// column. RevLoans6 only watches the V6 address, so version is always 6.
const VERSION = 6;
const V6_TERMINAL = ADDRESS.jbMultiTerminal6;

ponder.on("RevLoans6:Borrow", async ({ event, context }) => {
  try {
    const {
      revnetId,
      beneficiary,
      loanId,
      loan: _loan,
      caller,
      token,
      sourceFeeAmount,
      borrowAmount,
      collateralCount,
    } = event.args;

    const chainId = context.chain.id;
    const projectId = Number(revnetId);
    const version = VERSION;

    const _project = await context.db.find(project, { projectId, chainId, version });
    if (!_project) {
      throw new Error("Missing project");
    }

    await context.db.insert(wallet).values({ address: caller }).onConflictDoNothing();

    const _participant = await context.db
      .insert(participant)
      .values({
        address: caller,
        chainId,
        projectId,
        createdAt: Number(event.block.timestamp),
        suckerGroupId: _project.suckerGroupId,
        isRevnet: _project.isRevnet,
        version,
      })
      .onConflictDoUpdate({
        suckerGroupId: _project.suckerGroupId,
        isRevnet: _project.isRevnet,
      });
    await setParticipantSnapshot({ participant: _participant, context, event });

    const tokenUri = await context.client.readContract({
      abi: REVLoansV6Abi,
      address: event.log.address,
      functionName: "tokenURI",
      args: [loanId],
    });

    const loanValues = {
      owner: caller,
      beneficiary,
      borrowAmount,
      collateral: collateralCount,
      createdAt: _loan.createdAt,
      token,
      terminal: V6_TERMINAL,
      sourceFeeAmount,
      prepaidDuration: _loan.prepaidDuration,
      prepaidFeePercent: _loan.prepaidFeePercent,
      tokenUri,
    };

    await context.db
      .insert(loan)
      .values({ id: loanId, projectId, chainId, version, ...loanValues })
      .onConflictDoUpdate(loanValues);

    const { id } = await context.db.insert(borrowLoanEvent).values({
      ...getEventParams({ event, context }),
      projectId,
      suckerGroupId: _project.suckerGroupId,
      beneficiary,
      borrowAmount,
      collateral: collateralCount,
      token,
      terminal: V6_TERMINAL,
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
      suckerGroupId: _project.suckerGroupId,
      version,
    });
  } catch (e) {
    console.error("RevLoans6:Borrow", e);
  }
});

ponder.on("RevLoans6:Liquidate", async ({ event, context }) => {
  try {
    const { loanId, revnetId, loan: _loan } = event.args;
    const chainId = context.chain.id;
    const projectId = Number(revnetId);
    const version = VERSION;

    const _project = await context.db.find(project, { projectId, chainId, version });
    if (!_project) {
      throw new Error("Missing project");
    }

    await context.db
      .update(loan, { id: loanId, chainId, version })
      .set({ collateral: _loan.collateral, borrowAmount: _loan.amount });

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
      suckerGroupId: _project.suckerGroupId,
      version,
    });
  } catch (e) {
    console.error("RevLoans6:Liquidate", e);
  }
});

ponder.on("RevLoans6:RepayLoan", async ({ event, context }) => {
  try {
    const {
      loanId,
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
    const chainId = context.chain.id;
    const version = VERSION;
    const shouldCreateLoan = loanId !== paidOffLoanId;

    const _project = await context.db.find(project, { projectId, chainId, version });
    if (!_project) {
      throw new Error("Missing project");
    }

    if (shouldCreateLoan) {
      const loanValues = {
        createdAt: paidOffLoan.createdAt,
        borrowAmount: paidOffLoan.amount,
        collateral: paidOffLoan.collateral,
        prepaidDuration: paidOffLoan.prepaidDuration,
        prepaidFeePercent: paidOffLoan.prepaidFeePercent,
        token: paidOffLoan.sourceToken,
        terminal: V6_TERMINAL,
        beneficiary,
        sourceFeeAmount,
        owner: caller,
      };
      await context.db
        .insert(loan)
        .values({ id: paidOffLoanId, projectId, chainId, version, ...loanValues })
        .onConflictDoUpdate(() => ({ ...loanValues }));
    } else {
      await context.db.update(loan, { id: loanId, chainId, version }).set({
        borrowAmount: BigInt(0),
        collateral: BigInt(0),
        sourceFeeAmount,
        beneficiary,
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
      suckerGroupId: _project.suckerGroupId,
      version,
    });
  } catch (e) {
    console.error("RevLoans6:RepayLoan", e);
  }
});

ponder.on("RevLoans6:ReallocateCollateral", async ({ event, context }) => {
  try {
    const {
      loanId,
      revnetId,
      reallocatedLoanId,
      reallocatedLoan,
      removedCollateralCount,
      caller,
    } = event.args;

    const chainId = context.chain.id;
    const projectId = Number(revnetId);
    const version = VERSION;

    const _project = await context.db.find(project, { projectId, chainId, version });
    if (!_project) {
      throw new Error("Missing project");
    }

    const loanValues = {
      borrowAmount: reallocatedLoan.amount,
      collateral: reallocatedLoan.collateral,
      createdAt: reallocatedLoan.createdAt,
      prepaidDuration: reallocatedLoan.prepaidDuration,
      prepaidFeePercent: reallocatedLoan.prepaidFeePercent,
      token: reallocatedLoan.sourceToken,
      terminal: V6_TERMINAL,
      beneficiary: caller,
      sourceFeeAmount: BigInt(0),
      owner: caller,
    };
    await context.db
      .insert(loan)
      .values({ id: reallocatedLoanId, projectId, chainId, version, ...loanValues })
      .onConflictDoUpdate(loanValues);

    const { id } = await context.db.insert(reallocateLoanEvent).values({
      ...getEventParams({ event, context }),
      suckerGroupId: _project.suckerGroupId,
      loanId,
      reallocatedLoanId,
      projectId,
      removedCollateralCount,
      version,
    });
    await insertActivityEvent("reallocateLoanEvent", {
      id,
      event,
      context,
      projectId,
      suckerGroupId: _project.suckerGroupId,
      version,
    });
  } catch (e) {
    console.error("RevLoans6:ReallocateCollateral", e);
  }
});

ponder.on("RevLoans6:SetTokenUriResolver", async ({ event, context }) => {
  try {
    const allLoans = await context.db.sql.query.loan.findMany();
    const v6Loans = allLoans.filter((l) => l.version === VERSION);

    await Promise.all(
      v6Loans.map(async (l) => {
        const tokenUri = await context.client.readContract({
          abi: REVLoansV6Abi,
          address: event.log.address,
          functionName: "tokenURI",
          args: [l.id],
        });
        return context.db
          .update(loan, { id: l.id, chainId: context.chain.id, version: VERSION })
          .set({ tokenUri });
      })
    );
  } catch (e) {
    console.error("RevLoans6:SetTokenUriResolver", e);
  }
});

ponder.on("RevLoans6:Transfer", async ({ event, context }) => {
  try {
    const { to, tokenId } = event.args;
    const chainId = context.chain.id;
    const version = VERSION;

    const existingLoan = await context.db.find(loan, { id: tokenId, chainId, version });
    if (!existingLoan) return;

    await context.db.update(loan, { id: tokenId, chainId, version }).set({ owner: to });
  } catch (e) {
    console.error("RevLoans6:Transfer", e);
  }
});
