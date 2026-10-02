/**
 * fix-v6-sucker-factory-intervals.ts
 * ----------------------------------------------------------------------------
 * PURPOSE
 *
 * Repairs a Ponder sync-state bug that prevents V6 sucker bridge transactions
 * (the `suckerTransaction` table, version 6 rows) from ever being indexed.
 *
 *
 * THE BUG (what we observed)
 *
 * The V6 sucker registry (JBSuckersRegistry6, 0x7903a854…) is a Ponder
 * `factory`: Ponder watches its `SuckerDeployedFor` events to discover child
 * sucker contracts, then subscribes to each child's events
 * (InsertToOutboxTree / RootToRemote / Claimed), which is what writes
 * `suckerTransaction` rows.
 *
 * On every chain, the suckers were deployed in TWO waves:
 *   - an initial batch shortly after the registry was deployed, and
 *   - a later "second wave" at a single block (eth 25346808, op 153107685,
 *     base 47512400, arb 474891880).
 *
 * Ponder discovered the FIRST wave and wrote those child addresses into
 * `ponder_sync.factory_addresses`. But by the time the second wave's
 * `SuckerDeployedFor` events were processed, the child-event log filters had
 * ALREADY recorded their completed block range in `ponder_sync.intervals`
 * covering past the second-wave block. Because Ponder never re-fetches a range
 * a filter has marked complete, the second-wave suckers were never added to
 * the factory's address set, and their own events were therefore never
 * fetched or indexed.
 *
 * Net effect, confirmed on all 4 chains:
 *   - `_sucker`             rows: present for ALL suckers (registry handler ran)
 *   - `factory_addresses`        : MISSING the second-wave suckers
 *   - `suckerTransaction` v6 rows: ZERO (no child events ever fetched)
 *
 * The eth→base bridge we used to diagnose this has BOTH of its sucker
 * endpoints in the untracked set, which is exactly why it produced no rows.
 *
 * This is NOT a config bug — addresses, start blocks, ABIs, and the handler
 * logic are all correct (the handler was dry-run against the real on-chain
 * event and produces a valid row). The defect is purely in Ponder's cached
 * sync state. It is present through at least ponder 0.16.6 and there is no
 * fix for it in the 0.16.2 → 0.16.6 changelog.
 *
 *
 * THE FIX (what this script does)
 *
 * Deletes the `ponder_sync.intervals` rows for the V6 sucker factory — both
 * the factory-discovery fragment (`factory_log_…`) and the per-child-event
 * log fragments (`log_…offset32_<childTopic>…`), across all chains. These are
 * the rows that tell Ponder "this range is already synced, skip it."
 *
 * On the next indexer start, Ponder sees those fragments as un-synced and:
 *   1. re-runs factory discovery over the full V6 window, re-deriving ALL
 *      child suckers (including the previously-missed second wave) and
 *      re-inserting them into `factory_addresses` (an idempotent upsert keyed
 *      on factoryId+address — the already-present children are harmless), then
 *   2. re-runs the child-event filters over that window WITH the now-complete
 *      address set, fetching the previously-skipped InsertToOutboxTree /
 *      RootToRemote / Claimed logs, which the handlers turn into
 *      `suckerTransaction` rows.
 *
 * Scope: this only re-fetches the V6 sucker registry's own logs plus its
 * children's events over the V6 block window (a single contract + its factory
 * children, a handful of topics, ~tens of thousands to ~2M blocks per chain).
 * It does NOT re-index everything. All other contracts, all v4/v5 data, and
 * the currently-served schema are untouched, so the service stays online while
 * the next deploy backfills.
 *
 *
 * SAFETY
 *
 *   - DRY RUN BY DEFAULT. It prints exactly which interval rows it would
 *     delete and stops. Pass `--apply` to actually delete.
 *   - It writes a timestamped backup of the matched rows to
 *     ./ponder-intervals-backup-<ts>.sql before deleting (restore instructions
 *     are printed and embedded in the backup file).
 *   - The delete is tightly scoped by a LIKE pattern containing BOTH the V6
 *     registry address AND the SuckerDeployedFor event selector, so it cannot
 *     match the v4/v5 registry or any other contract. The script asserts the
 *     match count and the distinct matched address before deleting.
 *
 *
 * USAGE
 *
 *   # 1. Dry run — review what would be deleted (no changes):
 *   npx tsx scripts/fix-v6-sucker-factory-intervals.ts
 *
 *   # 2. Apply — back up, then delete the interval rows:
 *   npx tsx scripts/fix-v6-sucker-factory-intervals.ts --apply
 *
 *   # 3. Restart / redeploy the indexer so historical sync re-runs.
 *   #    (Ideally restart against a fresh schema so the backfill happens off
 *   #     to the side, then cut over — zero downtime.)
 *
 *   # 4. Verify (re-run the dry run; or use the verification query printed at
 *   #    the end). Tracked-child counts should reach 33/25/25/25 and v6
 *   #    `suckerTransaction` rows should begin to appear.
 *
 * Reads DATABASE_URL from .env.local (same as the other scripts here).
 * ----------------------------------------------------------------------------
 */

import * as dotenv from "dotenv";
import pg from "pg";
import { writeFileSync } from "node:fs";

const { Client } = pg;

dotenv.config({ path: ".env.local" });

// --- Constants identifying the broken factory -------------------------------

/** JBSuckersRegistry6 — the V6 sucker factory contract. */
const V6_SUCKER_REGISTRY = "0x7903a854ae91eaf635430d120a1a434085cef297";

/** topic0 of `SuckerDeployedFor` on the V6 registry ABI. */
const SUCKER_DEPLOYED_FOR_SELECTOR =
  "0x4d33ed88848a039f44d3828ced48c3992796e9af4f90e48c5ff6f3d0ca1f4e21";

/**
 * Matches every interval fragment tied to this factory: the factory-discovery
 * fragment (`factory_log_<chain>_<registry>_<selector>_…`) and each child-event
 * log fragment (`log_<chain>_<registry>_<selector>_offset32_<childTopic>_…`).
 * Both the address and the selector must appear, so nothing else can match.
 * Underscores are escaped because `_` is a LIKE wildcard.
 */
const FRAGMENT_LIKE_PATTERN =
  `%\\_${V6_SUCKER_REGISTRY}\\_${SUCKER_DEPLOYED_FOR_SELECTOR}%`;

/** We expect exactly 7 fragments per chain × 4 chains = 28. */
const EXPECTED_FRAGMENT_COUNT = 28;
const EXPECTED_CHAINS = ["1", "10", "8453", "42161"];

const APPLY = process.argv.includes("--apply");

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Missing DATABASE_URL in .env.local");
  }

  const db = new Client({ connectionString });
  await db.connect();

  try {
    // --- 1. Find the rows that would be affected ---------------------------
    const { rows: matched } = await db.query<{
      fragment_id: string;
      chain_id: string;
      blocks: string;
    }>(
      `SELECT fragment_id, chain_id, blocks::text AS blocks
         FROM ponder_sync.intervals
        WHERE fragment_id LIKE $1 ESCAPE '\\'
        ORDER BY chain_id, fragment_id`,
      [FRAGMENT_LIKE_PATTERN]
    );

    console.log(
      `\nFound ${matched.length} interval fragment(s) for the V6 sucker factory:\n`
    );

    const byChain = new Map<string, typeof matched>();
    for (const r of matched) {
      if (!byChain.has(r.chain_id)) byChain.set(r.chain_id, []);
      byChain.get(r.chain_id)!.push(r);
    }
    for (const [chain, rows] of [...byChain.entries()].sort()) {
      console.log(`  chain ${chain}: ${rows.length} fragment(s)`);
      for (const r of rows) {
        const kind = r.fragment_id.startsWith("factory_log_")
          ? "discovery"
          : "child-log";
        console.log(`    [${kind}] ${r.blocks}  ${r.fragment_id}`);
      }
    }

    // --- 2. Safety assertions ---------------------------------------------
    if (matched.length === 0) {
      console.log(
        "\nNothing to delete. Either already fixed, or the schema/addresses changed.\n"
      );
      return;
    }

    // Confirm the pattern matched ONLY the V6 registry address (no collateral).
    const matchedAddresses = new Set(
      matched
        .map((r) => r.fragment_id.match(/log_\d+_(0x[0-9a-f]+)/)?.[1])
        .filter(Boolean)
    );
    if (
      matchedAddresses.size !== 1 ||
      !matchedAddresses.has(V6_SUCKER_REGISTRY)
    ) {
      throw new Error(
        `Refusing to proceed: pattern matched unexpected addresses ${[
          ...matchedAddresses,
        ].join(", ")}. Expected only ${V6_SUCKER_REGISTRY}.`
      );
    }

    if (matched.length !== EXPECTED_FRAGMENT_COUNT) {
      console.warn(
        `\n⚠️  Warning: expected ${EXPECTED_FRAGMENT_COUNT} fragments ` +
          `(7 × 4 chains) but found ${matched.length}. ` +
          `This may be fine (e.g. chain set changed), but review the list above before applying.`
      );
    }
    const foundChains = new Set(matched.map((r) => r.chain_id));
    const missingChains = EXPECTED_CHAINS.filter((c) => !foundChains.has(c));
    if (missingChains.length) {
      console.warn(
        `\n⚠️  Warning: no fragments found for chain(s) ${missingChains.join(
          ", "
        )}. Those chains will NOT be repaired by this run.`
      );
    }

    // --- 3. Dry run stops here --------------------------------------------
    if (!APPLY) {
      console.log(
        `\nDRY RUN — no changes made. Re-run with --apply to back up and delete these ${matched.length} row(s).\n`
      );
      printNextSteps();
      return;
    }

    // --- 4. Back up the matched rows --------------------------------------
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = `./ponder-intervals-backup-${ts}.sql`;
    const backupSql = buildBackupSql(matched);
    writeFileSync(backupPath, backupSql);
    console.log(`\n📦 Backup of ${matched.length} row(s) written to ${backupPath}`);
    console.log(
      `   To restore: psql "$DATABASE_URL" -f ${backupPath}\n`
    );

    // --- 5. Delete ---------------------------------------------------------
    const { rowCount } = await db.query(
      `DELETE FROM ponder_sync.intervals WHERE fragment_id LIKE $1 ESCAPE '\\'`,
      [FRAGMENT_LIKE_PATTERN]
    );
    console.log(`🗑️  Deleted ${rowCount} interval fragment(s).`);
    console.log(
      `\n✅ Done. Ponder will treat the V6 sucker factory range as un-synced on next start.\n`
    );
    printNextSteps();
  } finally {
    await db.end();
  }
}

/** Emit an idempotent restore file (re-inserts the exact rows we delete). */
function buildBackupSql(
  rows: { fragment_id: string; chain_id: string; blocks: string }[]
): string {
  const header = [
    `-- Backup of ponder_sync.intervals rows for the V6 sucker factory`,
    `-- (registry ${V6_SUCKER_REGISTRY}, selector ${SUCKER_DEPLOYED_FOR_SELECTOR}).`,
    `-- Generated by scripts/fix-v6-sucker-factory-intervals.ts at ${new Date().toISOString()}.`,
    `-- Restore with: psql "$DATABASE_URL" -f <this file>`,
    ``,
    `BEGIN;`,
  ];
  const inserts = rows.map((r) => {
    const fragment = r.fragment_id.replace(/'/g, "''");
    return `INSERT INTO ponder_sync.intervals (fragment_id, chain_id, blocks) VALUES ('${fragment}', ${r.chain_id}, '${r.blocks}'::nummultirange) ON CONFLICT (fragment_id) DO UPDATE SET blocks = EXCLUDED.blocks;`;
  });
  return [...header, ...inserts, `COMMIT;`, ``].join("\n");
}

function printNextSteps() {
  console.log("Next steps:");
  console.log("  1. (apply only) Restart / redeploy the indexer so historical sync re-runs.");
  console.log("     Ideally start against a fresh schema, then cut over (zero downtime).");
  console.log("  2. Verify recovery once the V6 window has re-synced. Tracked-child");
  console.log("     counts should reach 33/25/25/25 (eth/op/base/arb), and v6");
  console.log("     suckerTransaction rows should appear. Verification query:\n");
  console.log(
    [
      "     SELECT f.factory->>'chainId' AS chain, count(*) AS tracked_children",
      "       FROM ponder_sync.factory_addresses fa",
      "       JOIN ponder_sync.factories f ON fa.factory_id = f.id",
      `      WHERE f.factory->>'eventSelector' = '${SUCKER_DEPLOYED_FOR_SELECTOR}'`,
      `        AND f.factory->'address'->>0 = '${V6_SUCKER_REGISTRY}'`,
      "      GROUP BY 1 ORDER BY 1;",
    ].join("\n")
  );
  console.log("");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
