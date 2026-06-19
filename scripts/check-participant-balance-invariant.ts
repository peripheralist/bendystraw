// Regression check for the omnichain participant-balance bug.
//
// Invariant: a participant's `balance` MUST always equal `creditBalance + erc20Balance`.
// The bug: JBTokens:ClaimTokens decremented `creditBalance` but left `balance` unchanged, while
// the paired ERC20:Transfer mint credited BOTH `erc20Balance` and `balance` — so every claim
// double-counted the claimed amount. A sucker move (Ethereum -> Base) on project 8 claims jango's
// credits as part of prepare, which inflated his source balance from ~99,952.61 to ~299,905.22.
//
// No Ponder test harness exists in this repo, so this models the exact per-handler balance deltas
// for the move+claim flow and asserts the invariant + supply conservation. Run: `yarn tsx
// scripts/check-participant-balance-invariant.ts` (wired as `yarn test`). Keep these transitions in
// sync with the handler `.set()` closures in src/JBTokens.ts and src/ERC20.ts.

import assert from "node:assert/strict";

type Participant = {
  creditBalance: bigint;
  erc20Balance: bigint;
  balance: bigint;
};

const fresh = (): Participant => ({
  creditBalance: 0n,
  erc20Balance: 0n,
  balance: 0n,
});

// JBTokens:Mint (tokensWereClaimed === false) — credits unclaimed tokens.
const jbTokensMintCredits = (p: Participant, count: bigint): Participant => ({
  creditBalance: p.creditBalance + count,
  erc20Balance: p.erc20Balance,
  balance: p.balance + count,
});

// JBTokens:ClaimTokens — credits converted to ERC20. balance drops the claimed credits here; the
// paired ERC20 mint re-adds them as erc20Balance, netting zero. (This is the fixed transition.)
const jbTokensClaim = (p: Participant, count: bigint): Participant => ({
  creditBalance: p.creditBalance - count,
  erc20Balance: p.erc20Balance,
  balance: p.balance - count,
});

// ERC20:Transfer, mint leg (from === zeroAddress) — claimed tokens minted to holder.
const erc20Credit = (p: Participant, value: bigint): Participant => ({
  creditBalance: p.creditBalance,
  erc20Balance: p.erc20Balance + value,
  balance: p.balance + value,
});

// ERC20:Transfer, `from` leg — claimed tokens leave the holder (e.g. pulled by the sucker).
const erc20Debit = (p: Participant, value: bigint): Participant => ({
  creditBalance: p.creditBalance,
  erc20Balance: p.erc20Balance - value,
  balance: p.balance - value,
});

const invariant = (p: Participant, label: string) =>
  assert.equal(
    p.balance,
    p.creditBalance + p.erc20Balance,
    `${label}: balance (${p.balance}) != creditBalance + erc20Balance (${
      p.creditBalance + p.erc20Balance
    })`
  );

// jango's real numbers (project 8, V6), in wei.
const INITIAL_CREDITS = 199_952_611_231_138_220_241_802n; // pre-move Ethereum balance
const MOVED = 100_000_000_000_000_000_000_000n; // 100,000 BREADFRUIT, Ethereum -> Base

// --- Source chain (Ethereum): mint credits -> claim to ERC20 -> sucker pulls the moved amount ---
let source = fresh();
source = jbTokensMintCredits(source, INITIAL_CREDITS);
invariant(source, "source after mint");

// Claim all credits to ERC20: ClaimTokens + paired ERC20 mint.
source = jbTokensClaim(source, INITIAL_CREDITS);
source = erc20Credit(source, INITIAL_CREDITS);
invariant(source, "source after claim");
assert.equal(source.creditBalance, 0n, "all credits claimed");
assert.equal(source.erc20Balance, INITIAL_CREDITS, "credits became ERC20");

// Sucker prepare pulls the moved amount out of the holder (ERC20 Transfer holder -> sucker).
const sourceBeforeMove = source.balance;
source = erc20Debit(source, MOVED);
invariant(source, "source after move");
assert.equal(
  sourceBeforeMove - source.balance,
  MOVED,
  "source holder balance decreased by exactly the moved amount"
);
assert.equal(
  source.balance,
  INITIAL_CREDITS - MOVED,
  "source balance == on-chain totalBalanceOf (99,952.61)"
);

// --- Destination chain (Base): sucker claim mints the bridged tokens to the holder ---
let dest = fresh();
dest = erc20Credit(dest, MOVED);
invariant(dest, "dest after claim mint");
assert.equal(dest.balance, MOVED, "dest balance == 100,000");

// --- Group total supply is conserved across the move ---
assert.equal(
  source.balance + dest.balance,
  INITIAL_CREDITS,
  "group total conserved (source + dest == pre-move supply)"
);

console.log("participant balance invariant holds across move+claim flow ✓");
