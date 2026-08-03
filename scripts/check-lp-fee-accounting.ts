// Regression check for lifetime LP-fee accounting in src/UniswapV4PoolManager.ts.
//
// The pool overwrites `feeGrowthInsideLast` on every modification, so fees a
// position already took cannot be recovered from live state — the indexer has to
// accumulate them as they settle. Two things make that arithmetic easy to get
// wrong, and both are asserted here:
//
//   1. The accumulators are unchecked uint256 in the pool and are EXPECTED to
//      wrap. A plain subtraction reads a wrapped accumulator as an enormous
//      balance and would credit a position with fees nobody earned.
//   2. Each interval must be priced with the liquidity held DURING it, not the
//      liquidity after the modification that ended it.
//
// No Ponder test harness exists in this repo, so this models the handler's
// per-event transitions. Run: `yarn tsx scripts/check-lp-fee-accounting.ts`
// (wired as part of `yarn test`). Keep in sync with the `.set()` closure in
// src/UniswapV4PoolManager.ts.

import assert from "node:assert/strict";
import { feesAccrued, positionKey } from "../src/util/lpFees";

const UINT256_MAX = (1n << 256n) - 1n;

// The ART/USDC pool's only LP on Base, position #2864727: liquidity and the
// pool's fee growth read from chain at block 49,458,950.
const ART_LIQUIDITY = 143800072655163317n;
const ART_FEE_GROWTH_INSIDE_1 = 32541020662148266151501820090n;
const BASE_POSITION_MANAGER = "0x7c5f5a4bbd8fd63184577525326123b519429bdc";

// A live position's realized fees, as the pool would settle them.
assert.equal(feesAccrued(ART_LIQUIDITY, 0n, ART_FEE_GROWTH_INSIDE_1), 13751523n);

// A wrapped accumulator is forward progress, not a colossal balance.
assert.equal(feesAccrued(1n << 128n, UINT256_MAX - 3n, 4n), 8n);

// A closed position accrues nothing, however far the pool has moved.
assert.equal(feesAccrued(0n, 0n, ART_FEE_GROWTH_INSIDE_1), 0n);

// An unmoved checkpoint accrues nothing.
assert.equal(
  feesAccrued(ART_LIQUIDITY, ART_FEE_GROWTH_INSIDE_1, ART_FEE_GROWTH_INSIDE_1),
  0n
);

// The position key must match what the pool stores it under: derived here, and
// confirmed against StateView.getPositionInfo on Base, which returns this
// position's real liquidity for it. A wrong key silently reads an empty
// position, which would report every position as earning nothing.
assert.equal(
  positionKey(
    BASE_POSITION_MANAGER,
    -392200,
    -340600,
    `0x${(2864727n).toString(16).padStart(64, "0")}`
  ),
  "0x34bf69524209147fed65f9af6b1b20091647aff24618aeb98279c5b48767e734"
);

// A position's life: mint, a collect, a liquidity increase, then another
// collect. Lifetime is the sum of what each interval settled — priced with the
// liquidity held during it, never the liquidity that follows.
{
  const growth = { atMint: 100n << 128n, atFirstCollect: 140n << 128n };
  let liquidity = 1_000n;
  let checkpoint = growth.atMint;
  let claimed = 0n;

  // Collect: 1,000 liquidity across 40 units of growth.
  claimed += feesAccrued(liquidity, checkpoint, growth.atFirstCollect);
  checkpoint = growth.atFirstCollect;
  assert.equal(claimed, 40_000n);

  // Increase to 3,000 in the same modification that settled the fees above.
  liquidity = 3_000n;

  // Second collect, 10 units of growth later, at the NEW liquidity.
  const atSecondCollect = growth.atFirstCollect + (10n << 128n);
  claimed += feesAccrued(liquidity, checkpoint, atSecondCollect);
  checkpoint = atSecondCollect;
  assert.equal(claimed, 70_000n);

  // Pricing the first interval at the later liquidity would have said 120,000 —
  // the failure this ordering exists to prevent.
  assert.notEqual(claimed, 120_000n + 30_000n);

  // Lifetime is what has been taken plus whatever is currently unclaimed.
  const unclaimed = feesAccrued(liquidity, checkpoint, atSecondCollect + (2n << 128n));
  assert.equal(claimed + unclaimed, 76_000n);
}

console.log("LP fee accounting invariants verified.");
