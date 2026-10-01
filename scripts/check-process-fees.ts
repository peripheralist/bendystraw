// Runs the real JBMultiTerminal ProcessFee handler against an in-memory database with Base Sepolia's
// fees: one paid to the fee project on the same terminal, one swapped before it reached the fee
// project, and Sticky project 37's, which the terminal sent to the router gateway with no pay to the
// fee project. Every fee gets its own row as the paying terminal reports it, a held fee included,
// and the fee project's pay is still marked when there is one. getEventParams and getVersion are the
// real ones. Run: yarn tsx scripts/check-process-fees.ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import ts from "typescript";

type Row = Record<string, any>;
type Table = "project" | "payEvent" | "processFeeEvent";

const keys: Record<Table, string[]> = {
  project: ["version", "chainId", "projectId"],
  payEvent: ["id"],
  processFeeEvent: ["txHash", "logIndex"],
};
const rows: Record<Table, Map<string, Row>> = {
  project: new Map(),
  payEvent: new Map(),
  processFeeEvent: new Map(),
};
const rowKey = (table: Table, row: Row) => JSON.stringify(keys[table].map((key) => row[key]));

const db = {
  async find(table: Table, key: Row) {
    return rows[table].get(rowKey(table, key)) ?? null;
  },
  insert(table: Table) {
    assert.equal(table, "processFeeEvent", `Unexpected insert into ${table}`);
    return {
      async values(value: Row) {
        const key = rowKey(table, value);
        assert.ok(!rows[table].has(key), `Duplicate ${table} key ${key}`);
        rows[table].set(key, { ...value });
      },
    };
  },
  update(table: Table, key: Row) {
    assert.equal(table, "payEvent", `Unexpected update of ${table}`);
    return {
      async set(update: Row) {
        const id = rowKey(table, key);
        const previous = rows[table].get(id);
        assert.ok(previous, `Missing ${table} key ${id}`);
        rows[table].set(id, { ...previous, ...update });
      },
    };
  },
};

const errors: unknown[][] = [];
const nodeRequire = createRequire(import.meta.url);
function load(path: string, require: (name: string) => unknown) {
  const source = readFileSync(new URL(path, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports: Row = {};
  runInNewContext(compiled, { exports, console: { error: (...args: unknown[]) => errors.push(args) }, require });
  return exports;
}
const unused = (name: string) =>
  new Proxy({}, { get: (_target, member) => () => { throw new Error(`ProcessFee called ${name}.${String(member)}`); } });

const address = load("../src/constants/address.ts", (name) => {
  throw new Error(`Unexpected import ${name}`);
});
const getVersion = load("../src/util/getVersion.ts", (name) => {
  if (name === "viem") return nodeRequire("viem");
  if (name === "../constants/address") return address;
  throw new Error(`Unexpected import ${name}`);
});
const { getEventParams } = load("../src/util/getEventParams.ts", (name) => {
  throw new Error(`Unexpected import ${name}`);
});
// The query src/util/getLatestPayEvent.ts makes: the chain's pay with the latest timestamp, then log index.
const getLatestPayEvent = async ({ context }: Row) =>
  [...rows.payEvent.values()]
    .filter((row) => row.chainId === context.chain.id)
    .sort((a, b) => b.timestamp - a.timestamp || b.logIndex - a.logIndex)[0];

const handlers = new Map<string, (input: Row) => Promise<void>>();
load("../src/JBMultiTerminal.ts", (name) => {
  if (name === "ponder:registry") {
    return { ponder: { on: (event: string, handler: (input: Row) => Promise<void>) => handlers.set(event, handler) } };
  }
  if (name === "ponder:schema") {
    return new Proxy({}, { get: (_target, table) => String(table) });
  }
  if (name === "./util/getEventParams") return { getEventParams };
  if (name === "./util/getVersion") return getVersion;
  if (name === "./util/getLatestPayEvent") return { getLatestPayEvent };
  if (name === "viem") return nodeRequire("viem");
  if (name.startsWith("./util/")) return unused(name);
  throw new Error(`Unexpected import ${name}`);
});
assert.ok(handlers.has("JBMultiTerminal:ProcessFee"), "JBMultiTerminal:ProcessFee handler is registered");

const chainId = 84532;
const terminal = "0x130f5dd2bd8805443cf41755253d778a75a67f53";
const native = "0x000000000000000000000000000000000000EEEe";
const usdc = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const stakedToken = "0x8b122b7dd707F83B639A578BC0c81e75C55d34bD";
const payer = "0x59733c7Cd78d08dAb90368aD2cc09c8c81f097C0";
const holder = "0x042F619EED558723252593DB0375fC34306f203A";
const loans = "0x056265c31157748818F0910d1859aCD2f7d427dE";
for (const projectId of [1, 8, 10, 37]) {
  rows.project.set(rowKey("project", { version: 6, chainId, projectId }), { suckerGroupId: `group-${projectId}` });
}

// A pay as JBMultiTerminal:Pay recorded it, only what the marking reads and writes.
function pay(txHash: string, logIndex: number, timestamp: number, projectId: number, amount: bigint) {
  const id = `${txHash}:${logIndex}`;
  rows.payEvent.set(rowKey("payEvent", { id }), { id, chainId, txHash, logIndex, timestamp, projectId, amount, feeFromProject: null });
  return id;
}
async function processFee(txHash: string, logIndex: number, timestamp: number, args: Row) {
  await handlers.get("JBMultiTerminal:ProcessFee")!({
    context: { chain: { id: chainId }, db },
    event: {
      args: { caller: payer, beneficiary: payer, wasHeld: false, ...args },
      log: { address: terminal, logIndex },
      block: { timestamp: BigInt(timestamp) },
      transaction: { hash: txHash, from: payer },
    },
  });
}
const marks = () => [...rows.payEvent.values()].map((row) => [row.id, row.feeFromProject]);

// Project 8's USDC fee, swapped to ETH before it reached the fee project: its pay is in another token.
const tx1 = "0x93f4b114981e3d44794433fe380bba441d189cc384bc1af40e24ae3395abf8e3";
const pay1 = pay(tx1, 291, 1783638352, 1, 2747137606389n);
await processFee(tx1, 295, 1783638352, { projectId: 8n, token: usdc, amount: 5469n, caller: loans });

// Project 10's ETH fee, paid to the fee project on this terminal just before it.
const tx2 = "0xbcbe1b50e29b3ab651726251947d39f2bd62476680d34769f194048ab38e8778";
const pay2 = pay(tx2, 160, 1783879908, 1, 687746557140n);
await processFee(tx2, 163, 1783879908, { projectId: 10n, token: native, amount: 687746557140n });

// Project 10's held fee, processed after its holding period.
const tx3 = `0x${"3".repeat(64)}`;
const pay3 = pay(tx3, 4, 1784000000, 1, 25n * 10n ** 13n);
await processFee(tx3, 6, 1784000000, { projectId: 10n, token: native, amount: 25n * 10n ** 13n, wasHeld: true });
assert.equal(errors.length, 0, `Handlers reported ${errors.length} errors: ${errors.map((args) => args.join(" "))}`);

// Sticky project 37's fee went to the router gateway: the chain's latest pay is the project's own stick.
const tx4 = "0x2c325784f64b792a73db5abdaa4d4b49f9fa76729da9f4b4dae158e72626f670";
const stick = pay(`0x${"4".repeat(64)}`, 9, 1790380400, 37, 7n * 10n ** 18n);
await processFee(tx4, 108, 1790380526, {
  projectId: 37n, token: stakedToken, amount: 22855000000000000n, beneficiary: holder, caller: holder,
});
assert.deepEqual(
  errors.map(([label, error]) => [label, (error as Error).message.split(" (")[0]]),
  [["JBMultiTerminal:ProcessFee", "Latest PayEvent projectId != 1"]]
);
errors.length = 0;

const columns = [
  "chainId", "version", "projectId", "suckerGroupId", "txHash", "logIndex", "timestamp", "from", "caller",
  "token", "amount", "wasHeld", "beneficiary",
];
const shape = (row: Row) => Object.fromEntries(columns.map((column) => [column, row[column] ?? null]));
const at = (txHash: string, logIndex: number, timestamp: number, projectId: number, caller = payer) => ({
  chainId, version: 6, projectId, suckerGroupId: `group-${projectId}`, txHash, logIndex, timestamp, from: payer, caller,
});
assert.deepEqual([...rows.processFeeEvent.values()].map(shape), [
  { ...at(tx1, 295, 1783638352, 8, loans), token: usdc, amount: 5469n, wasHeld: false, beneficiary: payer },
  { ...at(tx2, 163, 1783879908, 10), token: native, amount: 687746557140n, wasHeld: false, beneficiary: payer },
  { ...at(tx3, 6, 1784000000, 10), token: native, amount: 25n * 10n ** 13n, wasHeld: true, beneficiary: payer },
  { ...at(tx4, 108, 1790380526, 37, holder), token: stakedToken, amount: 22855000000000000n, wasHeld: false, beneficiary: holder },
].map(shape));
// The fee project's pays are marked as before, and the stick is not.
assert.deepEqual(marks(), [[pay1, 8], [pay2, 10], [pay3, 10], [stick, null]]);

// A fee for a project Bendystraw never saw is reported, not recorded, and its pay is still marked.
const tx5 = `0x${"5".repeat(64)}`;
const pay5 = pay(tx5, 1, 1790390000, 1, 1n);
await processFee(tx5, 3, 1790390000, { projectId: 99n, token: native, amount: 1n });
assert.equal(rows.processFeeEvent.size, 4);
assert.deepEqual(
  errors.map(([label, error]) => [label, (error as Error).message]),
  [["JBMultiTerminal:ProcessFee", "Missing project"]]
);
assert.deepEqual(marks().at(-1), [pay5, 99]);

console.log("JBMultiTerminal fees recorded as each paying terminal reports them.");
