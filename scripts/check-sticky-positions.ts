// Runs the real StickyHook handlers against an in-memory database through a stake, a full exit and a
// restake, in StickyHook's emit order. Run: yarn tsx scripts/check-sticky-positions.ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";

type Row = Record<string, any>;
type Table = "project" | "stickyPosition" | "stickyEvent";

const keys: Record<Table, string[]> = {
  project: ["version", "chainId", "projectId"],
  stickyPosition: ["version", "chainId", "projectId", "holder"],
  stickyEvent: ["txHash", "logIndex"],
};
const rows: Record<Table, Map<string, Row>> = {
  project: new Map(),
  stickyPosition: new Map(),
  stickyEvent: new Map(),
};
const rowKey = (table: Table, row: Row) => JSON.stringify(keys[table].map((key) => row[key]));

const db = {
  async find(table: Table, key: Row) {
    return rows[table].get(rowKey(table, key)) ?? null;
  },
  insert(table: Table) {
    return {
      values(value: Row) {
        const key = rowKey(table, value);
        const insert = () => {
          assert.ok(!rows[table].has(key), `Duplicate ${table} key ${key}`);
          rows[table].set(key, { ...value });
        };
        return {
          then(resolve: (value: unknown) => unknown, reject: (error: unknown) => unknown) {
            return Promise.resolve().then(insert).then(resolve, reject);
          },
          async onConflictDoUpdate(update: (row: Row) => Row) {
            const previous = rows[table].get(key);
            if (previous) rows[table].set(key, { ...previous, ...update(previous) });
            else insert();
          },
        };
      },
    };
  },
};

const handlers = new Map<string, (input: Row) => Promise<void>>();
const source = readFileSync(new URL("../src/StickyHook.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const errors: unknown[] = [];
runInNewContext(compiled, {
  exports: {},
  console: { error: (...args: unknown[]) => errors.push(args) },
  require(name: string) {
    if (name === "ponder:registry") {
      return { ponder: { on: (event: string, handler: (input: Row) => Promise<void>) => handlers.set(event, handler) } };
    }
    if (name === "ponder:schema") return { project: "project", stickyPosition: "stickyPosition", stickyEvent: "stickyEvent" };
    if (name === "./util/getEventParams") {
      return {
        getEventParams: ({ event, context }: Row) => ({
          chainId: context.chain.id,
          txHash: event.transaction.hash,
          logIndex: event.log.logIndex,
          timestamp: Number(event.block.timestamp),
          from: event.transaction.from,
          caller: event.args.caller,
        }),
      };
    }
    throw new Error(`Unexpected import ${name}`);
  },
});
assert.equal(handlers.size, 4);

const chainId = 8453;
const holder = "0x1111111111111111111111111111111111111111";
const payer = "0x2222222222222222222222222222222222222222";
rows.project.set(rowKey("project", { version: 6, chainId, projectId: 7 }), { suckerGroupId: "group-7" });

let logIndex = 0;
async function emit(name: string, timestamp: bigint, args: Row) {
  await handlers.get(`StickyHook:${name}`)!({
    context: { chain: { id: chainId }, db },
    event: {
      args: { projectId: 7n, holder, caller: payer, ...args },
      log: { logIndex: logIndex++ },
      block: { timestamp },
      transaction: { hash: `0x${timestamp.toString(16)}`, from: payer },
    },
  });
}
const position = () => rows.stickyPosition.get(rowKey("stickyPosition", { version: 6, chainId, projectId: 7, holder }))!;

// First stake: StreakStarted is emitted before Staked.
await emit("StreakStarted", 1000n, {});
await emit("Staked", 1000n, { payer, count: 100n, stakedBalance: 100n });
assert.deepEqual(
  [position().stakedBalance, position().streakStartedAt, position().longestCompletedStreak],
  [100n, 1000, 0]
);

// Partial exit keeps the streak.
await emit("Unstaked", 1200n, { count: 40n, stakedBalance: 60n });
assert.deepEqual([position().stakedBalance, position().streakStartedAt], [60n, 1000]);

// Full exit: StreakEnded is emitted before Unstaked.
await emit("StreakEnded", 1500n, { duration: 500n });
await emit("Unstaked", 1500n, { count: 60n, stakedBalance: 0n });
assert.deepEqual(
  [position().stakedBalance, position().streakStartedAt, position().longestCompletedStreak],
  [0n, null, 500]
);

// A shorter later streak keeps the longest one.
await emit("StreakStarted", 2000n, {});
await emit("Staked", 2000n, { payer, count: 5n, stakedBalance: 5n });
await emit("StreakEnded", 2100n, { duration: 100n });
await emit("Unstaked", 2100n, { count: 5n, stakedBalance: 0n });
assert.deepEqual(
  [position().stakedBalance, position().streakStartedAt, position().longestCompletedStreak, position().updatedAt],
  [0n, null, 500, 2100]
);
assert.equal(position().createdAt, 1000);
assert.equal(position().suckerGroupId, "group-7");

const history = [...rows.stickyEvent.values()].map((row) => [row.type, row.stakedBalance ?? null, row.duration ?? null]);
assert.deepEqual(history, [
  ["streakStarted", null, null],
  ["staked", 100n, null],
  ["unstaked", 60n, null],
  ["streakEnded", null, 500],
  ["unstaked", 0n, null],
  ["streakStarted", null, null],
  ["staked", 5n, null],
  ["streakEnded", null, 100],
  ["unstaked", 0n, null],
]);

// Events for a project Bendystraw never saw are reported, not recorded.
const before = rows.stickyEvent.size;
await handlers.get("StickyHook:Staked")!({
  context: { chain: { id: chainId }, db },
  event: {
    args: { projectId: 99n, holder, payer, count: 1n, stakedBalance: 1n, caller: payer },
    log: { logIndex: logIndex++ },
    block: { timestamp: 3000n },
    transaction: { hash: "0xdead", from: payer },
  },
});
assert.equal(rows.stickyEvent.size, before);
assert.equal(errors.length, 1);

console.log("StickyHook positions, streaks and history verified.");
