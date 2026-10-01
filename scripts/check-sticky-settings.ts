// Runs the real StickyHook settings handlers against an in-memory database: a granter, a trusted
// sender (whose event has no caller) and an orphaned-balance exclusion, then events for a project
// Bendystraw never saw. getEventParams is the real one. Run: yarn tsx scripts/check-sticky-settings.ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";

type Row = Record<string, any>;
type Table = "project" | "stickySettingEvent";

const keys: Record<Table, string[]> = {
  project: ["version", "chainId", "projectId"],
  stickySettingEvent: ["txHash", "logIndex"],
};
const rows: Record<Table, Map<string, Row>> = {
  project: new Map(),
  stickySettingEvent: new Map(),
};
const rowKey = (table: Table, row: Row) => JSON.stringify(keys[table].map((key) => row[key]));

const db = {
  async find(table: Table, key: Row) {
    return rows[table].get(rowKey(table, key)) ?? null;
  },
  insert(table: Table) {
    assert.equal(table, "stickySettingEvent", `Unexpected write to ${table}`);
    return {
      async values(value: Row) {
        const key = rowKey(table, value);
        assert.ok(!rows[table].has(key), `Duplicate ${table} key ${key}`);
        rows[table].set(key, { ...value });
      },
    };
  },
};

function load(path: string, require: (name: string) => unknown) {
  const source = readFileSync(new URL(path, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports: Row = {};
  const errors: unknown[][] = [];
  runInNewContext(compiled, { exports, console: { error: (...args: unknown[]) => errors.push(args) }, require });
  return { exports, errors };
}

const { getEventParams } = load("../src/util/getEventParams.ts", (name) => {
  throw new Error(`Unexpected import ${name}`);
}).exports;
const sticky = load("../src/util/sticky.ts", (name) => {
  if (name === "ponder:schema") return { project: "project" };
  throw new Error(`Unexpected import ${name}`);
}).exports;

const handlers = new Map<string, (input: Row) => Promise<void>>();
const { errors } = load("../src/StickyHook.ts", (name) => {
  if (name === "ponder:registry") {
    return { ponder: { on: (event: string, handler: (input: Row) => Promise<void>) => handlers.set(event, handler) } };
  }
  if (name === "ponder:schema") {
    return {
      project: "project",
      stickyPosition: "stickyPosition",
      stickyEvent: "stickyEvent",
      stickySettingEvent: "stickySettingEvent",
    };
  }
  if (name === "./util/getEventParams") return { getEventParams };
  if (name === "./util/sticky") return sticky;
  throw new Error(`Unexpected import ${name}`);
});
for (const name of ["SetGranter", "SetTrustedSender", "ExcludeOrphanedBalance"]) {
  assert.ok(handlers.has(`StickyHook:${name}`), `StickyHook:${name} handler is registered`);
}

const chainId = 84532;
const projectId = 23;
const granter = "0x1111111111111111111111111111111111111111";
const holder = "0x2222222222222222222222222222222222222222";
const sender = "0x3333333333333333333333333333333333333333";
const caller = "0x4444444444444444444444444444444444444444";
const from = "0x5555555555555555555555555555555555555555";
rows.project.set(rowKey("project", { version: 6, chainId, projectId }), { suckerGroupId: "group-23" });

let logIndex = 0;
const txHash = (index: number) => `0x${index.toString(16).padStart(64, "0")}`;
async function emit(name: string, args: Row, project = projectId) {
  const index = logIndex++;
  await handlers.get(`StickyHook:${name}`)!({
    context: { chain: { id: chainId }, db },
    event: {
      args: { projectId: BigInt(project), ...args },
      log: { logIndex: index },
      block: { timestamp: BigInt(1000 + index) },
      transaction: { hash: txHash(index), from },
    },
  });
}

// The args are what StickyHook emits: SetTrustedSender has no caller.
await emit("SetGranter", { granter, caller });
await emit("SetTrustedSender", { holder, sender, trusted: true });
await emit("SetTrustedSender", { holder, sender, trusted: false });
await emit("ExcludeOrphanedBalance", { amount: 5n * 10n ** 18n, caller });
assert.equal(errors.length, 0, `Handlers reported ${errors.length} errors: ${errors.map((args) => args.join(" "))}`);

// Ponder stores a column a handler leaves out as NULL, so a null and a missing value are the same.
const columns = [
  "chainId", "version", "projectId", "suckerGroupId", "txHash", "logIndex", "timestamp", "from",
  "type", "account", "holder", "trusted", "amount", "caller",
];
const shape = (row: Row) => Object.fromEntries(columns.map((column) => [column, row[column] ?? null]));
const at = (index: number) => ({
  chainId,
  version: 6,
  projectId,
  suckerGroupId: "group-23",
  txHash: txHash(index),
  logIndex: index,
  timestamp: 1000 + index,
  from,
});
assert.deepEqual([...rows.stickySettingEvent.values()].map(shape), [
  { ...at(0), type: "granterSet", account: granter, holder: null, trusted: null, amount: null, caller },
  { ...at(1), type: "trustedSenderSet", account: sender, holder, trusted: true, amount: null, caller: null },
  { ...at(2), type: "trustedSenderSet", account: sender, holder, trusted: false, amount: null, caller: null },
  { ...at(3), type: "orphanedBalanceExcluded", account: null, holder: null, trusted: null, amount: 5n * 10n ** 18n, caller },
]);

// Events for a project Bendystraw never saw are reported, not recorded, by each handler.
const before = rows.stickySettingEvent.size;
await emit("SetGranter", { granter, caller }, 99);
await emit("SetTrustedSender", { holder, sender, trusted: true }, 99);
await emit("ExcludeOrphanedBalance", { amount: 1n, caller }, 99);
assert.equal(rows.stickySettingEvent.size, before);
assert.deepEqual(
  errors.map(([label, error]) => [label, (error as Error).message]),
  [
    ["StickyHook:SetGranter", "Missing project"],
    ["StickyHook:SetTrustedSender", "Missing project"],
    ["StickyHook:ExcludeOrphanedBalance", "Missing project"],
  ]
);

console.log("StickyHook granters, trusted senders and orphaned-balance exclusions verified.");
