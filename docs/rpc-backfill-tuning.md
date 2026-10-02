# RPC / Backfill Tuning Notes

Reference doc for optimizing this Ponder instance's RPC usage and full-reindex
backfill time. Not a committed plan — a place to come back to and put a strategy
in place later.

Context: this is a complex omnichain Ponder instance (4 mainnets + 4 testnets,
many contracts, multiple `factory()` configs) where a fresh full reindex can take
multiple days. Ponder `^0.16.6` (installed `0.16.6`), viem `^2.21.3`.

---

## The incident that triggered this

Production log, emitted continuously and looking "stuck":

```
Unable to find available JSON-RPC provider within expected time
action=fetch_block_data chain=base rate_limit=[3.4728750000000006]
is_active=[true] is_warming_up=[false] (15s)
```

Meanwhile the Chainstack dashboard showed **100% HTTP 200s** for the prior hour.
Chainstack endpoint, **400 req/s** cap, single endpoint per chain.

### Diagnosis

The mismatch (dashboard healthy, Ponder stuck) is the key clue. The provider was
**not** being rate-limited — requests were **timing out**, and Ponder treats a
timeout the same as a 429.

Mechanics, from the installed Ponder source
(`node_modules/ponder/dist/esm/rpc/index.js`):

- Per-request HTTP timeout is **10000ms** (`getHttpRpcClient(..., { timeout: 10000 })`,
  ~line 78).
- On error, line ~415:
  ```js
  if (error.code === 429 || error.status === 429 || error instanceof TimeoutError) {
    bucket.isActive = false;
    bucket.rpsLimit = Math.max(bucket.rpsLimit * RPS_DECREASE_FACTOR, MIN_RPS);
    scheduleBucketActivation(bucket);
    ...
  }
  ```
  A **`TimeoutError` is bucketed with 429** → the provider is deactivated, its
  `rpsLimit` is ratcheted down toward `MIN_RPS` (that's the **3.47** in the log),
  and a delayed reactivation is scheduled.
- With **one** provider per chain, `buckets.every(b => b.isActive === false)`
  becomes true → **no available buckets at all**.
- `getBucket()` then spins (`wait(20)` loop, ~line 245); the 15s timer fires and
  emits the "Unable to find available JSON-RPC provider" warning.
- Bucket reactivates after backoff → the **same heavy request times out again** →
  back to deactivation. **Self-sustaining stuck loop.**

Why the dashboard still showed 200s: requests the client abandons at 10s aren't
recorded as served failures by Chainstack, so the dashboard and Ponder disagree.

The `rate_limit=[3.47]` value is **misleading** — it's reached via the *timeout*
decrease path, not because Chainstack returned 429s.

### Likely root cause of the timeouts

A slow/oversized **`eth_getLogs`**. Base has dense logs, and this config has two
`factory()` configs on base (`ERC20` via `DeployERC20`, `JBSucker` via
`SuckerDeployedFor`) plus many contracts. A wide-range or many-address getLogs can
exceed 10s.

Important nuance (lines ~380–407): Ponder only auto-splits a getLogs range when
the provider returns a **recognizable range error** AND
`chain.ethGetLogsBlockRange === undefined`. A **timeout is not a range error**, so
Ponder never shrinks the range — it just deactivates and retries the same
oversized query. That's what makes it self-sustaining.

---

## Primary lever: `ethGetLogsBlockRange`

Per-chain cap on how many blocks each `eth_getLogs` covers. Set in
`ponder.config.ts` on the chain entry:

```ts
base: {
  id: base.id,
  rpc: process.env.RPC_URL_BASE,
  // ethGetLogsBlockRange: 500, // tune; largest value that stays < ~7s p99
},
```

### Why it fixes the incident

Caps request size so individual getLogs stay under the 10s timeout → no
timeout-driven deactivation spiral.

### Downsides / trade-offs

1. **Slower historical backfill.** Smaller range → more requests for the same
   span. Only matters during backfill; once caught up (realtime polls a few
   blocks), it's nearly irrelevant.
2. **Chain-wide, not per-contract.** Applies to every getLogs on the chain,
   including cheap ones. Must be sized for the **densest** query on that chain.
3. **Too low backfires.** More requests → pushes toward the 400 req/s cap and
   burns more request quota/billing. There's a floor.
4. **Disables Ponder's auto range-splitting** for that chain (the
   `=== undefined` guard). Fine here — our problem is timeouts, which that helper
   doesn't catch — but it's an explicit opt-out of the adaptive behavior.

Asymmetry that makes it safe: downside is "somewhat slower / more requests";
upside is "service doesn't deadlock." Trivially reversible (just a config value).

---

## The real goal: optimize a multi-day full reindex

`ethGetLogsBlockRange` is one lever. The backfill getLogs phase is roughly:

```
wall_clock ≈ (blocks_to_sync / range_per_request) × latency_per_request
```

But `latency_per_request` grows with range, bounded by two ceilings:
- **10s viem client timeout** (hardcoded) → the deactivation cliff.
- **Provider getLogs limits** (Chainstack result-count / range / response-size).

So the **ideal range = the largest value where p99 latency stays comfortably
under ~7s (headroom below 10s) AND the provider doesn't reject it.** Bigger is not
monotonically better — past the knee, latency climbs faster than the request-count
savings, and you risk the cliff.

### Why ideal range is per-chain (really per-contract)

Depends on **log density** = events/block across the queried addresses:
- **Base / Optimism / Arbitrum**: fast blocks, high density → smaller ideal range.
- **Mainnet**: 12s blocks; JB contracts may be sparse → can tolerate larger range
  than you'd guess.
- A **factory scanning one sparse event** (`SuckerDeployedFor`) tolerates a huge
  range; a **high-traffic terminal** on the same chain doesn't. The knob is
  chain-wide, so size for the densest query per chain.

No universal number — values should come from measurement, not guesses.

---

## How to determine ideal per-chain numbers

### Option A — Mine existing trace logs (cheapest)
Run a backfill window with `PONDER_LOG_LEVEL=trace`. Capture
`Received JSON-RPC response` lines (`method`, `chain`, `duration`) and, for
`eth_getLogs`, correlate `duration` against the block range in the request body.
Per chain, find where p99 approaches ~6–7s; that knee is the target range. Uses
real density on real Chainstack latency — most trustworthy signal.

Grep targets in trace logs:
- `eth_getLogs` durations
- `JSON-RPC request unexpectedly surpassed timeout` (method + chain)
- `JSON-RPC provider rate limited` (the deactivation events)
- `Caught eth_getLogs range error` (where auto-split would have kicked in)

### Option B — Calibration probe script (most rigorous)
Standalone script that calls `eth_getLogs` against the actual Chainstack
endpoints for the actual contract addresses, sweeping ranges
(100, 250, 500, 1k, 2k, 5k, 10k) over representative block windows, recording
latency + errors. Per chain, pick the largest range with p99 < ~7s and zero
rejections. Doesn't disturb the running sync. **Recommended for a multi-day
reindex** — a couple hours of calibration can cut days off backfill and yields
defensible numbers.

### Option C — Adaptive / iterative (lowest upfront effort)
Start each chain at a safe value; watch for `surpassed timeout` / deactivation;
bisect (no timeouts → raise; timeouts → lower). Slow to converge, no tooling.

---

## Other backfill levers (range isn't the only one)

- **`concurrency`** — rpc queue concurrency, default **25** per chain in this
  Ponder version (`createRpc({ ..., concurrency = 25 })`). With a 400 req/s
  Chainstack cap there is likely headroom to raise it; parallelizes the many
  getLogs calls a smaller range creates, offsetting range's request-count cost.
  (Verify how to set it in 0.16.x config before relying on it.)

- **Multiple RPC endpoints per chain** (array form `rpc: [a, b]`) — more buckets
  = more aggregate throughput AND timeout resilience. Critically, with >1 bucket,
  one stalled provider can't make `every bucket inactive` true, so the chain keeps
  moving instead of deadlocking. Requires provisioning more endpoints.

- **`ordering: "omnichain"` vs `"multichain"`** — currently **omnichain**
  (`ponder.config.ts`), which serializes progress across chains for a global event
  order. Almost certainly required by cross-chain handlers (suckers, etc.), so
  **do not change without confirming handler dependencies on global ordering**.
  But it is the single biggest structural lever on total backfill time —
  multichain allows far more parallel backfill across chains.

---

## Suggested order of operations (when we pick this up)

1. Turn on `PONDER_LOG_LEVEL=trace` for a window; confirm timeouts precede the
   deactivation spam, and capture getLogs duration-vs-range data (Option A) or run
   the probe (Option B).
2. Set per-chain `ethGetLogsBlockRange` to each chain's measured knee (start
   conservative on base: ~500–1000, raise toward the knee).
3. Add a 2nd RPC endpoint per chain (array form) for throughput + anti-deadlock.
4. Evaluate raising `concurrency` given the 400 req/s headroom.
5. Only if backfill time is still the bottleneck and handlers permit: revisit
   omnichain vs multichain.

## Open questions to resolve later

- Exact way to set rpc `concurrency` via `ponder.config.ts` in 0.16.x.
- Do any handlers actually depend on global omnichain ordering, or could a subset
  of chains run multichain?
- Per-chain p99 getLogs latency at various ranges (needs Option A or B data).
- Is the Chainstack node region/tier adding baseline latency (would show up as
  high p99 even on cheap calls, not just getLogs)?
