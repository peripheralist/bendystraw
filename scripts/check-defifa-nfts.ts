// Replay the real V6 NFT handlers; compare extracted handlers against the ordinary shop baseline.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { JB721TiersHookV6Abi } from "../abis/JB721TiersHookV6Abi";
import { JB721TiersHookStoreV6Abi } from "../abis/JB721TiersHookStoreV6Abi";
import { zeroAddress, getAbiItem, toEventSelector } from "viem";
import { DefifaHookAbi } from "../abis/DefifaHookAbi";
import { DefifaDeployerAbi } from "../abis/DefifaDeployerAbi";
import { DEFIFA_DEPLOYMENTS } from "../src/constants/defifa";

type Row = Record<string, any>;
const hook = "0x1111111111111111111111111111111111111111";
const alice = "0x2222222222222222222222222222222222222222";
const bob = "0x3333333333333333333333333333333333333333";
const tier = { id: 1, price: 100n, initialSupply: 999999999, remainingSupply: 999999998, category: 0,
  allowOwnerMint: false, cannotBeRemoved: true, transfersPausable: false, reserveBeneficiary: zeroAddress,
  reserveFrequency: 0, encodedIPFSUri: `0x${"00".repeat(32)}`, votingUnits: 0n,
  resolvedUri: "data:application/json;base64," + Buffer.from(JSON.stringify({ name: "resolver name", image: "test" })).toString("base64") };
const tables = ["project", "nftHook", "nftTier", "nft", "wallet", "participant", "mintNftEvent"];
const keys: Row = { project: ["projectId", "chainId", "version"], nftHook: ["chainId", "address", "version"],
  nftTier: ["chainId", "hook", "tierId", "version"], nft: ["chainId", "hook", "tokenId", "version"],
  wallet: ["address"], participant: ["address", "chainId", "projectId", "version"], mintNftEvent: ["logIndex"], suckerGroup: ["id"], suckerGroupMoment: ["suckerGroupId", "timestamp"] };
function fixture(source: string, metadataAvailable = true, tierCount = 1) {
  const handlers = new Map<string, (input: Row) => Promise<void>>();
  const rows: Row = Object.fromEntries([...tables, "suckerGroup", "suckerGroupMoment"].map((name) => [name, new Map<string, Row>()]));
  const errors: unknown[] = [];
  const failedReads = new Set<string>();
  const snapshots: Row[] = [];
  const activities: Row[] = [];
  const rowKey = (table: string, row: Row) => JSON.stringify(keys[table].map((key: string) => typeof row[key] === "bigint" ? String(row[key]) : row[key]));
  const db = {
    async find(table: string, key: Row) { return rows[table].get(rowKey(table, key)) ?? null; },
    insert(table: string) { return { values(value: Row) {
      const key = rowKey(table, value);
      const insert = () => { assert.ok(!rows[table].has(key), `duplicate ${table}`); const row = { id: `${table}-${key}`, ...value }; rows[table].set(key, row); return row; };
      return {
        then(resolve: (v: Row) => unknown, reject: (error: unknown) => unknown) { return Promise.resolve().then(insert).then(resolve, reject); },
        async onConflictDoNothing() { return rows[table].get(key) ?? insert(); },
        async onConflictDoUpdate(update: Row | ((row: Row) => Row)) { const previous = rows[table].get(key); if (!previous) return insert(); const row = { ...previous, ...(typeof update === "function" ? update(previous) : update) }; rows[table].set(key, row); return row; },
      };
    } }; },
    update(table: string, key: Row) { return { async set(update: Row | ((row: Row) => Row)) {
      const previous = rows[table].get(rowKey(table, key)); assert.ok(previous, `missing ${table}`);
      const row = { ...previous, ...(typeof update === "function" ? update(previous) : update) }; rows[table].set(rowKey(table, key), row); return row;
    } }; },
  };
  rows.project.set(rowKey("project", { projectId: 27, chainId: 8453, version: 6 }), { projectId: 27, chainId: 8453, version: 6, suckerGroupId: "group", nftsMintedCount: 0, isRevnet: false, isHomerun: false, isSticky: false });
  rows.nftTier.set(rowKey("nftTier", { hook, tierId: 1, chainId: 8453, version: 6 }), { hook, tierId: 1, chainId: 8453, version: 6, remainingSupply: 999999999 });
  const load = (text: string): Row => {
    const exports: Row = {};
    runInNewContext(ts.transpileModule(text, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, {
      exports, console: { error: (...args: unknown[]) => errors.push(args) },
      require(name: string) {
        if (name === "ponder:registry") return { ponder: { on: (event: string, handler: (input: Row) => Promise<void>) => handlers.set(event, handler) } };
        if (name === "ponder:schema") return Object.fromEntries([...tables, "suckerGroup", "suckerGroupMoment"].map((name) => [name, name]));
        if (name.endsWith("/onProjectStatsUpdated")) return load(readFileSync("src/util/onProjectStatsUpdated.ts", "utf8"));
        if (name.endsWith("/usdPrice")) return { usdPerAccountingTokenAtBlock: async () => 1000000000000000000n };
        if (name.endsWith("/v6Nft")) return load(readFileSync("src/util/v6Nft.ts", "utf8"));
        if (name.endsWith("/address")) return { ADDRESS: { jb721TiersHookDeployer6: hook } };
        if (name.endsWith("/getVersion")) return { addressForVersion: () => zeroAddress };
        if (name.endsWith("/JB721TiersHookV6Abi")) return { JB721TiersHookV6Abi };
        if (name.endsWith("/JB721TiersHookStoreV6Abi")) return { JB721TiersHookStoreV6Abi };
        if (name.endsWith("/activityEvent")) return { insertActivityEvent: async (kind: string, args: Row) => activities.push({ kind, ...args }) };
        if (name.endsWith("/participantSnapshot")) return { setParticipantSnapshot: async (args: Row) => snapshots.push(args.participant) };
        if (name.endsWith("/getEventParams")) return { getEventParams: ({ event }: Row) => ({ logIndex: event.log.logIndex }) };
        if (name.endsWith("/getAllTiers")) return { getAllTiers: async ({ includeResolvedUri }: Row) => Array.from({ length: tierCount }, (_, index) => ({ ...tier, id: index + 1, remainingSupply: tier.initialSupply, resolvedUri: includeResolvedUri === false ? "" : tier.resolvedUri })) };
        if (name.endsWith("/tokenUri")) return { parseTokenUri: (uri: string) => JSON.parse(Buffer.from(uri.split(",")[1]!, "base64").toString()), parseTierMetadata: async ({ resolvedUri }: Row) => metadataAvailable && resolvedUri ? ({ name: "resolver name", image: "test" }) : undefined };
        if (name === "viem") return { isAddressEqual: (a: string, b: string) => a === b, zeroAddress };
        return {};
      },
    });
    return exports;
  };
  load(source);
  const context = { db, chain: { id: 8453 }, client: { readContract: async ({ functionName, args }: Row) => {
    if (failedReads.has(functionName)) throw new Error("fixture RPC unavailable");
    if (functionName === "projectId") return 27n;
    if (functionName === "tierOfTokenId") return tier;
    if (functionName === "tokenURI") return tier.resolvedUri;
    if (functionName === "name") return "Market";
    if (functionName === "symbol") return "METALOG";
    if (functionName === "tierNameOf") return args[0] === 1n ? "Rekt" : `Range ${args[0]}`;
    throw new Error(`Unexpected read ${functionName}`);
  } } };
  let logIndex = 0;
  async function emit(name: string, args: Row) {
    const handler = handlers.get(name); assert.ok(handler, `registered ${name}`);
    await handler({ context, event: { args, log: { address: hook, logIndex: logIndex++ }, block: { number: 10n, timestamp: 100n }, transaction: { hash: hook, from: alice } } });
  }
  return { emit, rows, errors, snapshots, activities, load, failedReads };
}
async function replay(source: string) {
  const f = fixture(source);
  await f.emit("JB721TiersHook6:Transfer", { from: zeroAddress, to: alice, tokenId: 1n });
  await f.emit("JB721TiersHook6:Mint", { beneficiary: alice, tierId: 1n, tokenId: 1n, totalAmountPaid: 100n });
  await f.emit("JB721TiersHook6:Transfer", { from: alice, to: bob, tokenId: 1n });
  await f.emit("JB721TiersHook6:Transfer", { from: bob, to: zeroAddress, tokenId: 1n });
  assert.equal(f.errors.length, 0);
  assert.equal([...f.rows.project.values()][0].nftsMintedCount, 1);
  assert.equal([...f.rows.nft.values()][0].owner, zeroAddress);
  assert.equal(f.activities.length, 1);
  return { rows: Object.fromEntries(tables.map((name) => [name, [...f.rows[name].values()]])), snapshots: f.snapshots };
}
// Golden rows captured from c7d20ef ordinary handlers before the extraction.
// This fixture works in a shallow checkout and detects changes to ordinary indexing.
const normalize = (value: unknown) => JSON.parse(JSON.stringify(value, (_, item) => typeof item === "bigint" ? `${item}n` : item));
assert.deepEqual(normalize(await replay(readFileSync("src/JB721TiersHook6.ts", "utf8"))), JSON.parse(readFileSync("scripts/fixtures/v6-nft-replay.json", "utf8")));
if (existsSync("src/DefifaDeployer.ts")) {
  const f = fixture(readFileSync("src/DefifaDeployer.ts", "utf8"), true, 7);
  f.rows.nftTier.clear();
  await f.emit("DefifaDeployer:LaunchGame", { gameId: 27n, hook });
  assert.equal(f.errors.length, 0);
  assert.equal([...f.rows.nftHook.values()][0].projectId, 27);
  assert.equal(f.rows.nftTier.size, 7);
  assert.equal([...f.rows.nftTier.values()][6].metadata.name, "Range 7");
  assert.equal([...f.rows.nftTier.values()][0].metadata.name, "Rekt");
  assert.equal([...f.rows.nftTier.values()][0].metadata.image, undefined);
  assert.equal([...f.rows.nftTier.values()][0].resolvedUri, "");
  f.load(readFileSync("src/DefifaHook.ts", "utf8"));
  Object.assign([...f.rows.project.values()][0], {
    id: "project-27", paymentsCount: 0, redeemCount: 0, volume: 0n, volumeUsd: 0n,
    redeemVolume: 0n, redeemVolumeUsd: 0n, balance: 0n, balanceUsd: 0n,
    tokenSupply: 0n, reservedTokenSupply: 0n, trendingScore: 0n, trendingVolume: 0n,
    trendingPaymentsCount: 0, contributorsCount: 0,
  });
  f.rows.suckerGroup.set(JSON.stringify(["group"]), { id: "group", projects: ["project-27"], nftsMintedCount: 0 });
  await f.emit("DefifaHook:Transfer", { from: zeroAddress, to: alice, tokenId: 1n });
  await f.emit("DefifaHook:Mint", { beneficiary: alice, tierId: 1n, tokenId: 1n, totalAmountPaid: 100n });
  await f.emit("DefifaHook:Transfer", { from: alice, to: bob, tokenId: 1n });
  assert.equal(f.errors.length, 0);
  assert.equal([...f.rows.nft.values()][0].owner, bob);
  assert.equal([...f.rows.project.values()][0].nftsMintedCount, 1);
  assert.equal(f.activities.length, 1);
  await f.emit("DefifaHook:Transfer", { from: zeroAddress, to: alice, tokenId: 2n });
  await f.emit("DefifaHook:MintReservedToken", { beneficiary: alice, tierId: 1n, tokenId: 2n, caller: alice });
  await f.emit("DefifaHook:Transfer", { from: alice, to: zeroAddress, tokenId: 2n });
  assert.equal(f.errors.length, 0);
  assert.equal([...f.rows.project.values()][0].nftsMintedCount, 2);
  assert.equal([...f.rows.nft.values()][1].owner, zeroAddress);
  assert.equal([...f.rows.mintNftEvent.values()][1].totalAmountPaid, 0n);
  assert.equal([...f.rows.suckerGroup.values()][0].nftsMintedCount, 2);
  assert.equal([...f.rows.suckerGroupMoment.values()][0].nftsMintedCount, 2);
  // A not-yet-established group must not prevent indexing the native mint itself.
  f.rows.suckerGroup.clear();
  await f.emit("DefifaHook:MintReservedToken", { beneficiary: alice, tierId: 1n, tokenId: 4n, caller: alice });
  assert.equal([...f.rows.project.values()][0].nftsMintedCount, 3);
  f.failedReads.add("tierOfTokenId");
  await assert.rejects(f.emit("DefifaHook:Transfer", { from: alice, to: bob, tokenId: 3n }), /RPC unavailable/);
  f.failedReads.clear();
  f.failedReads.add("projectId");
  await assert.rejects(f.emit("DefifaHook:Mint", { beneficiary: alice, tierId: 1n, tokenId: 3n, totalAmountPaid: 100n }), /RPC unavailable/);
  const noMetadata = fixture(readFileSync("src/DefifaDeployer.ts", "utf8"), false, 21);
  noMetadata.rows.nftTier.clear();
  await noMetadata.emit("DefifaDeployer:LaunchGame", { gameId: 27n, hook });
  assert.equal(noMetadata.errors.length, 0);
  assert.equal(noMetadata.rows.nftTier.size, 21);
  assert.equal([...noMetadata.rows.nftTier.values()][0].metadata.name, "Rekt");
}
console.log("V6 NFT handler parity and Defifa replay passed");

assert.equal(toEventSelector(getAbiItem({ abi: DefifaHookAbi, name: "Mint" })), toEventSelector("Mint(uint256,uint256,address,uint256,address)"));
assert.equal(toEventSelector(getAbiItem({ abi: DefifaDeployerAbi, name: "LaunchGame" })), toEventSelector("LaunchGame(uint256,address,address,address,address)"));
assert.equal(DEFIFA_DEPLOYMENTS.mainnet.address, "0x375afb2a4b1cadae99f8863f96fc1aebcbaf8bde");
assert.equal(DEFIFA_DEPLOYMENTS.testnet.address, "0xbfa54a97099485c134f06c9a08a4909c26fd7318");
assert.deepEqual(Object.values(DEFIFA_DEPLOYMENTS.mainnet.chain).map(({ startBlock }) => startBlock), [25330110, 474174861, 47399313, 152994569]);
assert.deepEqual(Object.values(DEFIFA_DEPLOYMENTS.testnet.chain).map(({ startBlock }) => startBlock), [11070755, 277728251, 42909692, 44892523]);
const config = readFileSync("ponder.config.ts", "utf8");
for (const network of ["mainnet", "testnet"]) {
  assert.ok(config.includes(`DefifaDeployer: { abi: DefifaDeployerAbi, ...DEFIFA_DEPLOYMENTS.${network} }`));
  assert.ok(config.includes(`address: DEFIFA_DEPLOYMENTS.${network}.address`));
  assert.ok(config.includes(`chain: DEFIFA_DEPLOYMENTS.${network}.chain`));
}
