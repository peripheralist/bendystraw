// Runs the real StickyHook SetToken and StickyDistributor Fund handlers against an in-memory
// database, replaying Base Sepolia's Sticky funding: projects 37 and 42 get their tokens, then the
// distributor is funded for each, once for a stake-age group. Funding of an address that is not a
// Sticky token, and of a token whose project Bendystraw never saw, writes nothing.
// Run: yarn tsx scripts/check-sticky-funding.ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";

type Row = Record<string, any>;
type Table = "project" | "stickyToken" | "stickyFundEvent";

const keys: Record<Table, string[]> = {
  project: ["version", "chainId", "projectId"],
  stickyToken: ["version", "chainId", "token"],
  stickyFundEvent: ["txHash", "logIndex"],
};
const rows: Record<Table, Map<string, Row>> = {
  project: new Map(),
  stickyToken: new Map(),
  stickyFundEvent: new Map(),
};
// Ponder stores hex columns in lowercase and compares keys the same way, so a checksummed address
// finds a row written with another casing.
const normalize = (value: unknown) =>
  typeof value === "string" && value.startsWith("0x") ? value.toLowerCase() : value;
const rowKey = (table: Table, row: Row) => JSON.stringify(keys[table].map((key) => normalize(row[key])));

const db = {
  async find(table: Table, key: Row) {
    return rows[table].get(rowKey(table, key)) ?? null;
  },
  insert(table: Table) {
    assert.ok(table === "stickyToken" || table === "stickyFundEvent", `Unexpected write to ${table}`);
    return {
      async values(value: Row) {
        const key = rowKey(table, value);
        assert.ok(!rows[table].has(key), `Duplicate ${table} key ${key}`);
        rows[table].set(key, Object.fromEntries(Object.entries(value).map(([k, v]) => [k, normalize(v)])));
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
  runInNewContext(compiled, { exports, console: { error: (...args: unknown[]) => errors.push(args) }, require });
  return exports;
}

const errors: unknown[][] = [];
const schema = {
  project: "project",
  stickyEvent: "stickyEvent",
  stickyPosition: "stickyPosition",
  stickySettingEvent: "stickySettingEvent",
  stickyToken: "stickyToken",
  stickyFundEvent: "stickyFundEvent",
};
const { getEventParams } = load("../src/util/getEventParams.ts", (name) => {
  throw new Error(`Unexpected import ${name}`);
});
const sticky = load("../src/util/sticky.ts", (name) => {
  if (name === "ponder:schema") return schema;
  throw new Error(`Unexpected import ${name}`);
});
const handlers = new Map<string, (input: Row) => Promise<void>>();
for (const file of ["../src/StickyHook.ts", "../src/StickyDistributor.ts"]) {
  load(file, (name) => {
    if (name === "ponder:registry") {
      return { ponder: { on: (event: string, handler: (input: Row) => Promise<void>) => handlers.set(event, handler) } };
    }
    if (name === "ponder:schema") return schema;
    if (name === "./util/getEventParams") return { getEventParams };
    if (name === "./util/sticky") return sticky;
    throw new Error(`Unexpected import ${name}`);
  });
}
for (const name of ["StickyHook:SetToken", "StickyDistributor:Fund"]) {
  assert.ok(handlers.has(name), `${name} handler is registered`);
}

const chainId = 84532;
const deployer = "0xdA38Ec48B5b1d186B02BA99F297e95153BEE33a9";
const funder = "0x042F619EED558723252593DB0375fC34306f203A";
const otherFunder = "0xB4dcA01B57993fF71e60D30B88eA1B9f8d346670";
const token37 = "0xee528a64F4AFe524bA220c7CF0ea0c0278D0F232";
const token42 = "0xB4591BfC2cf3507228Af5E34763C2F379179529c";
const reward37 = "0x8b122b7dd707F83B639A578BC0c81e75C55d34bD";
const reward42 = "0x1d9FBFEdCf7B644eDBaF6dcFa72A365ecaD3A42e";
const stranger = "0x1111111111111111111111111111111111111111";
const unseenToken = "0x2222222222222222222222222222222222222222";
for (const projectId of [37, 42]) {
  rows.project.set(rowKey("project", { version: 6, chainId, projectId }), { suckerGroupId: `group-${projectId}` });
}

let tx = 0;
async function emit(name: string, block: bigint, logIndex: number, args: Row, from: string) {
  const hash = `0x${(++tx).toString(16).padStart(64, "0")}`;
  await handlers.get(name)!({
    context: { chain: { id: chainId }, db },
    event: {
      args,
      log: { logIndex },
      block: { number: block, timestamp: 1790370000n + block - 47301559n },
      transaction: { hash, from },
    },
  });
  return hash;
}
const fund = (block: bigint, logIndex: number, args: Row) =>
  emit("StickyDistributor:Fund", block, logIndex, { round: 0n, caller: funder, ...args }, args.caller ?? funder);

// The tokens, as the deployer registers them at launch. Project 99 is one Bendystraw never saw.
await emit("StickyHook:SetToken", 47305674n, 21, { projectId: 37n, token: token37, caller: deployer }, funder);
await emit("StickyHook:SetToken", 47390508n, 52, { projectId: 42n, token: token42, caller: deployer }, funder);
await emit("StickyHook:SetToken", 47390600n, 3, { projectId: 99n, token: unseenToken, caller: deployer }, funder);
assert.deepEqual(
  errors.map(([label, error]) => [label, (error as Error).message]),
  [["StickyHook:SetToken", "Missing project"]]
);
errors.length = 0;
assert.deepEqual([...rows.stickyToken.values()], [
  { chainId, projectId: 37, suckerGroupId: "group-37", version: 6, token: token37.toLowerCase(), createdAt: 1790374115 },
  { chainId, projectId: 42, suckerGroupId: "group-42", version: 6, token: token42.toLowerCase(), createdAt: 1790458949 },
]);

// Project 42 joins a sucker group after its launch: its funding carries the group it has then.
rows.project.set(rowKey("project", { version: 6, chainId, projectId: 42 }), { suckerGroupId: "group-42-later" });

// The funding, with each event's own values. The hook arrives checksummed, as viem decodes it.
const fund1 = await fund(47306068n, 159, { hook: token37, groupId: 0n, token: reward37, amount: 10n ** 18n });
const fund2 = await fund(47306083n, 1, { hook: token37, groupId: 1000n, token: reward37, amount: 5n * 10n ** 17n });
const fund3 = await fund(47390706n, 44, { hook: token42, groupId: 0n, token: reward42, amount: 100n * 10n ** 18n });
const fund4 = await fund(47390712n, 81, {
  hook: token42, groupId: 0n, token: reward42, amount: 10n * 10n ** 18n, caller: otherFunder,
});
// Anyone can fund the default group of any address, and of a token whose project was never seen.
await fund(47390800n, 7, { hook: stranger, groupId: 0n, token: reward42, amount: 1n });
await fund(47390801n, 8, { hook: unseenToken, groupId: 0n, token: reward42, amount: 1n });
assert.equal(errors.length, 0, `Handlers reported ${errors.length} errors: ${errors.map((args) => args.join(" "))}`);

const columns = [
  "chainId", "version", "projectId", "suckerGroupId", "txHash", "logIndex", "timestamp", "from", "caller",
  "hook", "groupId", "token", "round", "amount", "blockNumber",
];
const shape = (row: Row) => Object.fromEntries(columns.map((column) => [column, row[column] ?? null]));
const at = (hash: string, block: bigint, logIndex: number, projectId: number, caller = funder) => ({
  chainId,
  version: 6,
  projectId,
  suckerGroupId: projectId === 42 ? "group-42-later" : `group-${projectId}`,
  txHash: hash,
  logIndex,
  timestamp: Number(1790370000n + block - 47301559n),
  from: caller.toLowerCase(),
  caller: caller.toLowerCase(),
  blockNumber: block,
  round: 0n,
});
assert.deepEqual([...rows.stickyFundEvent.values()].map(shape), [
  { ...at(fund1, 47306068n, 159, 37), hook: token37.toLowerCase(), groupId: 0n, token: reward37.toLowerCase(), amount: 10n ** 18n },
  { ...at(fund2, 47306083n, 1, 37), hook: token37.toLowerCase(), groupId: 1000n, token: reward37.toLowerCase(), amount: 5n * 10n ** 17n },
  { ...at(fund3, 47390706n, 44, 42), hook: token42.toLowerCase(), groupId: 0n, token: reward42.toLowerCase(), amount: 100n * 10n ** 18n },
  {
    ...at(fund4, 47390712n, 81, 42, otherFunder),
    hook: token42.toLowerCase(), groupId: 0n, token: reward42.toLowerCase(), amount: 10n * 10n ** 18n,
  },
].map(shape));

// A Sticky token whose project row is gone is reported, not recorded.
rows.project.delete(rowKey("project", { version: 6, chainId, projectId: 42 }));
const before = rows.stickyFundEvent.size;
await fund(47390900n, 9, { hook: token42, groupId: 0n, token: reward42, amount: 1n });
assert.equal(rows.stickyFundEvent.size, before);
assert.deepEqual(
  errors.map(([label, error]) => [label, (error as Error).message]),
  [["StickyDistributor:Fund", "Missing project"]]
);

console.log("StickyDistributor funding and Sticky tokens verified.");
