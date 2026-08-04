/**
 * fix-nft-hook-factory-intervals.ts
 * ----------------------------------------------------------------------------
 * PURPOSE
 *
 * Repairs the same Ponder sync-state bug documented in
 * `fix-v6-sucker-factory-intervals.ts`, but for the NFT hook factories
 * (JB721TiersHookDeployer v4/v5/v6) instead of the sucker registry.
 *
 *
 * THE BUG
 *
 * `JB721TiersHookDeployer` is a Ponder `factory`: Ponder watches its
 * `HookDeployed` events to discover child hook contracts, then subscribes to
 * each child's events (Mint / Transfer / AddTier / RemoveTier), which is what
 * writes `mintNftEvent`, `nft`, and `addNftTierEvent` rows.
 *
 * When a hook is deployed AFTER the child-event log filters have already
 * recorded their completed block range in `ponder_sync.intervals` covering
 * past that block, the new child address never enters the factory's address
 * set. Ponder never re-fetches a range a filter has marked complete, so that
 * hook's events are never fetched or indexed — permanently.
 *
 * Signature (confirmed on Base Sepolia project 19, hook 0xd32f93eb…):
 *   - `nftHook` row              : PRESENT (deployer is a fixed address, so its
 *                                  own HookDeployed event indexed fine)
 *   - `nftTier` row              : PRESENT (written by the deployer handler via
 *                                  readContract, not from an AddTier event)
 *   - `factory_addresses`        : MISSING the hook address
 *   - `mintNftEvent` / `nft` /
 *     `addNftTierEvent` rows     : ZERO, while the hook demonstrably emits
 *                                  Mint(0x598baf7b…) and Transfer(0xddf252ad…)
 *                                  logs on chain
 *
 * This is NOT a config bug — addresses, start blocks, ABIs and handlers are
 * correct. The defect is in Ponder's cached sync state, which lives in the
 * `ponder_sync` schema and is SHARED across every app schema. Wiping the app
 * database and reindexing does NOT fix it; the same interval rows are re-read
 * and the same hooks stay invisible.
 *
 *
 * THE FIX
 *
 * Deletes the `ponder_sync.intervals` rows for the affected hook factories —
 * both the factory-discovery fragment (`factory_log_…`) and the per-child-event
 * log fragments (`log_…offset0_<childTopic>…`) — for ONLY those deployer
 * versions that actually have untracked hooks.
 *
 * On the next indexer start Ponder sees those fragments as un-synced and:
 *   1. re-runs factory discovery over the full window, re-deriving ALL child
 *      hooks and re-inserting them into `factory_addresses` (idempotent upsert
 *      keyed on factoryId+address, so existing children are harmless), then
 *   2. re-runs the child-event filters over that window WITH the now-complete
 *      address set, fetching the previously-skipped Mint / Transfer / AddTier /
 *      RemoveTier logs.
 *
 * Scope: only the hook deployer's own logs plus its children's events. All
 * other contracts and the currently-served schema are untouched, so the
 * service stays online while the next deploy backfills.
 *
 *
 * SAFETY
 *
 *   - DRY RUN BY DEFAULT. Prints the untracked hooks and exactly which interval
 *     rows it would delete, then stops. Pass `--apply` to actually delete.
 *   - Self-scoping: only targets deployer versions with untracked hooks. If a
 *     version is clean it is left alone (no needless refetch).
 *   - Writes a timestamped backup of the matched rows before deleting.
 *   - The delete is scoped by a LIKE pattern containing BOTH the deployer
 *     address AND the HookDeployed selector, and the script asserts that the
 *     matched fragments reference only the expected deployer addresses.
 *
 *
 * USAGE
 *
 *   # Dry run against mainnet (DATABASE_URL):
 *   npx tsx scripts/fix-nft-hook-factory-intervals.ts
 *
 *   # Dry run against testnet (DATABASE_URL_TESTNET):
 *   npx tsx scripts/fix-nft-hook-factory-intervals.ts --testnet
 *
 *   # Apply:
 *   npx tsx scripts/fix-nft-hook-factory-intervals.ts --apply
 *   npx tsx scripts/fix-nft-hook-factory-intervals.ts --testnet --apply
 *
 *   # Then restart / redeploy the indexer so historical sync re-runs, and
 *   # re-run the dry run to confirm the untracked count has dropped to 0.
 * ----------------------------------------------------------------------------
 */

import * as dotenv from "dotenv";
import pg from "pg";
import { writeFileSync } from "node:fs";
import { ADDRESS } from "../src/constants/address";

const { Client } = pg;

dotenv.config({ path: ".env.local" });

/** topic0 of `HookDeployed(uint256,address,address)`, shared by all versions. */
const HOOK_DEPLOYED_SELECTOR =
  "0xd76d022c77a474d529a79581eb88a726ad929fd23efbcb6a1f852d2d936299a5";

/** `nftHook.version` -> the deployer that emitted its HookDeployed event. */
const DEPLOYER_BY_VERSION: Record<number, string> = {
  4: ADDRESS.jb721TiersHookDeployer,
  5: ADDRESS.jb721TiersHookDeployer5,
  6: ADDRESS.jb721TiersHookDeployer6,
};

const APPLY = process.argv.includes("--apply");
const TESTNET = process.argv.includes("--testnet");

/**
 * Matches every interval fragment tied to one deployer: the discovery fragment
 * (`factory_log_<chain>_<deployer>_<selector>_…`) and each child-event log
 * fragment (`log_<chain>_<deployer>_<selector>_offset0_<childTopic>_…`).
 * Underscores are escaped because `_` is a LIKE wildcard.
 */
const fragmentPattern = (deployer: string) =>
  `%\\_${deployer}\\_${HOOK_DEPLOYED_SELECTOR}%`;

type Hook = {
  chain_id: string;
  address: string;
  version: number;
  project_id: number;
  created_at: number;
};

type Interval = { fragment_id: string; chain_id: string; blocks: string };

/**
 * The app schema is named after the deploying git SHA, so find the live one by
 * most recent heartbeat rather than hardcoding it.
 */
async function findLiveSchema(db: pg.Client): Promise<string> {
  const { rows } = await db.query<{ table_schema: string }>(
    `SELECT DISTINCT table_schema FROM information_schema.tables
      WHERE table_name = '_ponder_meta'`
  );

  let live: { schema: string; heartbeat: number } | undefined;
  for (const { table_schema } of rows) {
    try {
      const { rows: meta } = await db.query<{ value: any }>(
        `SELECT value FROM "${table_schema}"._ponder_meta WHERE key = 'app'`
      );
      const heartbeat = Number(meta[0]?.value?.heartbeat_at ?? 0);
      if (!live || heartbeat > live.heartbeat) {
        live = { schema: table_schema, heartbeat };
      }
    } catch {
      // Schema exists but isn't readable in the expected shape — skip it.
    }
  }

  if (!live) throw new Error("Could not locate a Ponder app schema");
  return live.schema;
}

async function main() {
  const envVar = TESTNET ? "DATABASE_URL_TESTNET" : "DATABASE_URL";
  const connectionString = process.env[envVar];
  if (!connectionString) {
    throw new Error(`Missing ${envVar} in .env.local`);
  }

  const db = new Client({ connectionString });
  await db.connect();

  try {
    const schema = await findLiveSchema(db);
    console.log(
      `\nNetwork: ${TESTNET ? "TESTNET" : "MAINNET"} (${envVar})\nLive app schema: ${schema}\n`
    );

    // --- 1. Which hooks does the app know about that Ponder isn't tracking? --
    const { rows: hooks } = await db.query<Hook>(
      `SELECT chain_id::text, address, version, project_id, created_at
         FROM "${schema}".nft_hook ORDER BY version, chain_id, created_at`
    );

    const { rows: tracked } = await db.query<{
      chain_id: string;
      address: string;
    }>(
      `SELECT fa.chain_id::text, fa.address
         FROM ponder_sync.factory_addresses fa
         JOIN ponder_sync.factories f ON f.id = fa.factory_id
        WHERE f.factory->>'eventSelector' = $1`,
      [HOOK_DEPLOYED_SELECTOR]
    );
    const trackedSet = new Set(
      tracked.map((r) => `${r.chain_id}:${r.address.toLowerCase()}`)
    );

    const untracked = hooks.filter(
      (h) => !trackedSet.has(`${h.chain_id}:${h.address.toLowerCase()}`)
    );

    console.log(
      `${hooks.length} nftHook row(s); ${trackedSet.size} child address(es) tracked by Ponder.`
    );
    console.log(
      `${untracked.length} hook(s) UNTRACKED — their events can never be indexed.\n`
    );

    if (untracked.length === 0) {
      console.log("Nothing to repair.\n");
      return;
    }

    const affectedVersions = [...new Set(untracked.map((h) => h.version))].sort();
    for (const version of affectedVersions) {
      const list = untracked.filter((h) => h.version === version);
      console.log(`  version ${version}: ${list.length} untracked`);
      for (const h of list) {
        console.log(
          `    chain ${h.chain_id.padEnd(9)} project ${String(h.project_id).padEnd(6)} ${h.address}`
        );
      }
    }

    // --- 2. Find the interval rows for exactly those versions ---------------
    const deployers = affectedVersions.map((v) => {
      const deployer = DEPLOYER_BY_VERSION[v];
      if (!deployer) {
        throw new Error(`No known deployer address for nftHook version ${v}`);
      }
      return { version: v, deployer };
    });

    const matched: Interval[] = [];
    console.log("\nInterval fragments that would be deleted:\n");
    for (const { version, deployer } of deployers) {
      const { rows } = await db.query<Interval>(
        `SELECT fragment_id, chain_id::text, blocks::text AS blocks
           FROM ponder_sync.intervals
          WHERE fragment_id LIKE $1 ESCAPE '\\'
          ORDER BY chain_id, fragment_id`,
        [fragmentPattern(deployer)]
      );
      console.log(`  v${version} (${deployer}): ${rows.length} fragment(s)`);
      for (const r of rows) {
        const kind = r.fragment_id.startsWith("factory_log_")
          ? "discovery"
          : "child-log";
        console.log(`    [${kind}] chain ${r.chain_id.padEnd(9)} ${r.blocks}`);
      }
      matched.push(...rows);
    }

    if (matched.length === 0) {
      throw new Error(
        "Found untracked hooks but no matching interval fragments — " +
          "the fragment naming scheme may have changed. Investigate before proceeding."
      );
    }

    // --- 3. Safety assertion: only the expected deployers were matched ------
    const expected = new Set(deployers.map((d) => d.deployer));
    const matchedAddresses = new Set(
      matched
        .map((r) => r.fragment_id.match(/log_\d+_(0x[0-9a-f]+)/)?.[1])
        .filter((a): a is string => Boolean(a))
    );
    for (const address of matchedAddresses) {
      if (!expected.has(address)) {
        throw new Error(
          `Refusing to proceed: pattern matched unexpected address ${address}. ` +
            `Expected only ${[...expected].join(", ")}.`
        );
      }
    }

    // --- 4. Dry run stops here ---------------------------------------------
    if (!APPLY) {
      console.log(
        `\nDRY RUN — no changes made. Re-run with --apply${TESTNET ? " --testnet" : ""} ` +
          `to back up and delete these ${matched.length} row(s).\n`
      );
      printNextSteps();
      return;
    }

    // --- 5. Back up, then delete -------------------------------------------
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = `./ponder-nft-hook-intervals-backup-${TESTNET ? "testnet" : "mainnet"}-${ts}.sql`;
    writeFileSync(backupPath, buildBackupSql(matched, deployers));
    console.log(`\n📦 Backup of ${matched.length} row(s) written to ${backupPath}`);
    console.log(`   To restore: psql "$${envVar}" -f ${backupPath}\n`);

    let deleted = 0;
    for (const { deployer } of deployers) {
      const { rowCount } = await db.query(
        `DELETE FROM ponder_sync.intervals WHERE fragment_id LIKE $1 ESCAPE '\\'`,
        [fragmentPattern(deployer)]
      );
      deleted += rowCount ?? 0;
    }
    console.log(`🗑️  Deleted ${deleted} interval fragment(s).`);
    console.log(
      `\n✅ Done. Ponder will treat these hook factory ranges as un-synced on next start.\n`
    );
    printNextSteps();
  } finally {
    await db.end();
  }
}

/** Emit an idempotent restore file (re-inserts the exact rows we delete). */
function buildBackupSql(
  rows: Interval[],
  deployers: { version: number; deployer: string }[]
): string {
  const header = [
    `-- Backup of ponder_sync.intervals rows for the NFT hook factories`,
    `-- (${deployers.map((d) => `v${d.version} ${d.deployer}`).join(", ")},`,
    `--  selector ${HOOK_DEPLOYED_SELECTOR}).`,
    `-- Generated by scripts/fix-nft-hook-factory-intervals.ts at ${new Date().toISOString()}.`,
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
  console.log("  2. Re-run this script's dry run once the window has re-synced —");
  console.log("     the untracked count should be 0, and mintNftEvent / nft rows");
  console.log("     should appear for the previously-missing hooks.");
  console.log("");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
