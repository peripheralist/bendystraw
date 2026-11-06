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
import { DEFIFA_DEPLOYMENTS, DEFIFA_V2_DEPLOYMENTS } from "../src/constants/defifa";

type Row = Record<string, any>;
const hook = "0x1111111111111111111111111111111111111111";
const alice = "0x2222222222222222222222222222222222222222";
const bob = "0x3333333333333333333333333333333333333333";
let referee: string = "0x4444444444444444444444444444444444444444";
// Mutable chain state the 2.0 fixtures read.
const chainState = { totalMintCost: 0n, tierSupply: 999999990, rulesetStarts: [5000n, 4000n, 1000n] };
const tier = { id: 1, price: 100n, initialSupply: 999999999, remainingSupply: 999999998, category: 0,
  flags: { allowOwnerMint: false, transfersPausable: false, cantBeRemoved: true, cantIncreaseDiscountPercent: false, cantBuyWithCredits: false },
  reserveBeneficiary: zeroAddress,
  reserveFrequency: 0, encodedIPFSUri: `0x${"00".repeat(32)}`, votingUnits: 0n,
  resolvedUri: "data:application/json;base64," + Buffer.from(JSON.stringify({ name: "resolver name", image: "test" })).toString("base64") };
const tables = ["project", "nftHook", "nftTier", "nft", "wallet", "participant", "mintNftEvent"];
const defifaTables = ["defifaGame", "defifaScorecard", "defifaAttestation", "defifaHolding", "defifaTierDelegate", "defifaEvent"];
const keys: Row = { project: ["projectId", "chainId", "version"], nftHook: ["chainId", "address", "version"],
  nftTier: ["chainId", "hook", "tierId", "version"], nft: ["chainId", "hook", "tokenId", "version"],
  wallet: ["address"], participant: ["address", "chainId", "projectId", "version"], mintNftEvent: ["logIndex"], suckerGroup: ["id"], suckerGroupMoment: ["suckerGroupId", "timestamp"],
  defifaGame: ["chainId", "projectId"], defifaScorecard: ["chainId", "projectId", "scorecardId"],
  defifaAttestation: ["chainId", "projectId", "scorecardId", "account"], defifaHolding: ["chainId", "hook", "owner", "tierId"],
  defifaTierDelegate: ["chainId", "hook", "tierId", "delegate"], defifaEvent: ["logIndex"] };
function fixture(source: string, metadataAvailable = true, tierCount = 1) {
  const handlers = new Map<string, (input: Row) => Promise<void>>();
  const rows: Row = Object.fromEntries([...tables, ...defifaTables, "suckerGroup", "suckerGroupMoment"].map((name) => [name, new Map<string, Row>()]));
  const errors: unknown[] = [];
  const failedReads = new Set<string>();
  const snapshots: Row[] = [];
  const activities: Row[] = [];
  const tierCalls: Row[] = [];
  const reads: Row[] = [];
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
        if (name === "ponder:schema") return Object.fromEntries([...tables, ...defifaTables, "suckerGroup", "suckerGroupMoment"].map((name) => [name, name]));
        if (name.endsWith("/util/defifa") || name === "./defifa") return load(readFileSync("src/util/defifa.ts", "utf8"));
        if (name.endsWith("/tierOf")) return { tierOf: async ({ tierId }: Row) => ({ ...tier, id: Number(tierId), remainingSupply: chainState.tierSupply }) };
        if (name.endsWith("/getVersion")) return { addressForVersion: () => zeroAddress };
        if (name.endsWith("/defifaHookEvents")) return load(readFileSync("src/util/defifaHookEvents.ts", "utf8"));
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
        if (name.endsWith("/constants/defifa")) return { DEFIFA_V2_DEPLOYMENTS };
        if (name.endsWith("/getAllTiers")) return { getAllTiers: async ({ includeResolvedUri, store }: Row) => tierCalls.push({ store }) && Array.from({ length: tierCount }, (_, index) => ({ ...tier, id: index + 1, remainingSupply: tier.initialSupply, resolvedUri: includeResolvedUri === false ? "" : tier.resolvedUri })) };
        if (name.endsWith("/tokenUri")) return { parseTokenUri: (uri: string) => JSON.parse(Buffer.from(uri.split(",")[1]!, "base64").toString()), parseTierMetadata: async ({ resolvedUri }: Row) => metadataAvailable && resolvedUri ? ({ name: "resolver name", image: "test" }) : undefined };
        if (name === "viem") return { isAddressEqual: (a: string, b: string) => a.toLowerCase() === b.toLowerCase(), zeroAddress };
        return {};
      },
    });
    return exports;
  };
  load(source);
  const context = { db, chain: { id: 8453 }, client: { readContract: async ({ functionName, args, address }: Row) => {
    reads.push({ functionName, address });
    if (failedReads.has(functionName)) throw new Error("fixture RPC unavailable");
    if (functionName === "projectId") return 27n;
    if (functionName === "tierOfTokenId") return tier;
    if (functionName === "tokenURI") return tier.resolvedUri;
    if (functionName === "name") return "Market";
    if (functionName === "symbol") return "METALOG";
    if (functionName === "tierNameOf") return args[0] === 1n ? "Rekt" : `Range ${args[0]}`;
    if (functionName === "timesFor") return [1000n, 86400, chainState.rulesetStarts.length === 3 ? 3600 : 0];
    if (functionName === "safetyParamsOf") return [2n, 604800];
    if (functionName === "refereeOf") return referee;
    if (functionName === "timelockDurationOf") return 3600n;
    if (functionName === "attestationStartTimeOf") return 2000n;
    if (functionName === "attestationGracePeriodOf") return 86400n;
    if (functionName === "quorumOf") return 5_000_000_000n;
    if (functionName === "totalMintCost") return chainState.totalMintCost;
    if (functionName === "allOf") return chainState.rulesetStarts.map((start) => ({ start }));
    throw new Error(`Unexpected read ${functionName}`);
  } } };
  let logIndex = 0;
  async function emit(name: string, args: Row, address: string = hook) {
    const handler = handlers.get(name); assert.ok(handler, `registered ${name}`);
    await handler({ context, event: { args, log: { address, logIndex: logIndex++ }, block: { number: 10n, timestamp: 100n }, transaction: { hash: hook, from: alice } } });
  }
  return { emit, rows, errors, snapshots, activities, load, failedReads, tierCalls, reads };
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
  assert.deepEqual([...f.rows.nftTier.values()].map(({ allowOwnerMint, cannotBeRemoved, transfersPausable }) => [allowOwnerMint, cannotBeRemoved, transfersPausable])[0], [false, true, false]);
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
if (existsSync("src/DefifaDeployer.ts")) {
  const launchArgs = { gameId: 27n, hook, governor: DEFIFA_V2_DEPLOYMENTS.mainnet.governor, tokenUriResolver: bob, caller: alice };
  // 1.0.2 games read tiers from the canonical store; 2.0 games from their DefifaTiersHookStore.
  const v1 = fixture(readFileSync("src/DefifaDeployer.ts", "utf8"), true, 2);
  v1.rows.nftTier.clear();
  await v1.emit("DefifaDeployer:LaunchGame", { gameId: 27n, hook });
  assert.deepEqual(v1.tierCalls, [{ store: undefined }]);
  const v2 = fixture(readFileSync("src/DefifaDeployer.ts", "utf8"), true, 3);
  v2.rows.nftTier.clear();
  await v2.emit("DefifaDeployerV2:LaunchGame", launchArgs, DEFIFA_V2_DEPLOYMENTS.mainnet.deployer);
  assert.equal(v2.errors.length, 0);
  assert.equal(v2.rows.nftTier.size, 3);
  assert.deepEqual(v2.tierCalls, [{ store: DEFIFA_V2_DEPLOYMENTS.mainnet.store }]);
  v2.load(readFileSync("src/DefifaHook.ts", "utf8"));
  await v2.emit("DefifaHookV2:Transfer", { from: zeroAddress, to: alice, tokenId: 1n });
  await v2.emit("DefifaHookV2:Mint", { beneficiary: alice, tierId: 1n, tokenId: 1n, totalAmountPaid: 100n });
  await v2.emit("DefifaHookV2:MintReservedToken", { beneficiary: alice, tierId: 1n, tokenId: 2n, caller: alice });
  assert.equal(v2.errors.length, 0);
  assert.equal([...v2.rows.nft.values()][0].owner, alice);
  assert.equal([...v2.rows.project.values()][0].nftsMintedCount, 2);
  assert.deepEqual(v2.reads.filter(({ functionName }) => functionName === "tierOfTokenId").map(({ address }) => address), [DEFIFA_V2_DEPLOYMENTS.mainnet.store]);
  v1.load(readFileSync("src/DefifaHook.ts", "utf8"));
  await v1.emit("DefifaHook:Transfer", { from: zeroAddress, to: alice, tokenId: 1n });
  assert.deepEqual(v1.reads.filter(({ functionName }) => functionName === "tierOfTokenId").map(({ address }) => address), [zeroAddress]);
}
if (existsSync("src/DefifaGovernor.ts")) {
  const d = DEFIFA_V2_DEPLOYMENTS.mainnet;
  referee = d.votingReferee;
  const carol = "0x5555555555555555555555555555555555555555";
  const one = (f: Row, table: string) => [...f.rows[table].values()];
  const holding = (f: Row, owner: string, tierId: number) => f.rows.defifaHolding.get(JSON.stringify([8453, hook, owner, tierId]));
  const game = (f: Row) => one(f, "defifaGame")[0];
  const card = (f: Row, id: bigint) => f.rows.defifaScorecard.get(JSON.stringify([8453, 27, String(id)]));
  const launch = { gameId: 27n, hook, governor: d.governor, tokenUriResolver: bob, caller: alice };

  // A 2.0 721 game through its whole lifecycle.
  const g = fixture(readFileSync("src/DefifaDeployer.ts", "utf8"), true, 3);
  g.rows.nftTier.clear();
  g.load(readFileSync("src/DefifaHook.ts", "utf8"));
  g.load(readFileSync("src/DefifaGovernor.ts", "utf8"));
  Object.assign(one(g, "project")[0], { id: "project-27", paymentsCount: 0, redeemCount: 0, volume: 0n, volumeUsd: 0n,
    redeemVolume: 0n, redeemVolumeUsd: 0n, balance: 0n, balanceUsd: 0n, tokenSupply: 0n, reservedTokenSupply: 0n,
    trendingScore: 0n, trendingVolume: 0n, trendingPaymentsCount: 0, contributorsCount: 0 });
  await g.emit("DefifaDeployerV2:LaunchGame", launch, d.deployer);
  const settings = game(g);
  assert.deepEqual(normalize({ gameType: settings.gameType, referee: settings.referee, governor: settings.governor,
    tiersCount: settings.tiersCount, mintStartsAt: settings.mintStartsAt, refundStartsAt: settings.refundStartsAt,
    scoringStartsAt: settings.scoringStartsAt, mintPeriodDuration: settings.mintPeriodDuration,
    refundPeriodDuration: settings.refundPeriodDuration, minParticipation: settings.minParticipation,
    scorecardTimeout: settings.scorecardTimeout, timelockDuration: settings.timelockDuration,
    attestationStartTime: settings.attestationStartTime, attestationGracePeriod: settings.attestationGracePeriod,
    totalMintCost: settings.totalMintCost, scorecardsCount: settings.scorecardsCount }),
  normalize({ gameType: "erc721", referee: d.votingReferee, governor: d.governor, tiersCount: 3, mintStartsAt: 1000n,
    refundStartsAt: 4000n, scoringStartsAt: 5000n, mintPeriodDuration: 86400, refundPeriodDuration: 3600,
    minParticipation: 2n, scorecardTimeout: 604800n, timelockDuration: 3600n, attestationStartTime: 2000n,
    attestationGracePeriod: 86400n, totalMintCost: 0n, scorecardsCount: 0 }));
  chainState.totalMintCost = 777n;
  const tokenId = 1_000_000_001n;
  await g.emit("DefifaHookV2:Transfer", { from: zeroAddress, to: alice, tokenId });
  await g.emit("DefifaHookV2:Mint", { beneficiary: alice, tierId: 1n, tokenId, totalAmountPaid: 100n, caller: alice });
  await g.emit("DefifaHookV2:Transfer", { from: alice, to: bob, tokenId });
  assert.equal(holding(g, alice, 1).count, 0);
  assert.equal(holding(g, bob, 1).count, 1);
  assert.equal(holding(g, bob, 1).reserveCount, undefined);
  assert.equal(game(g).totalMintCost, 777n);
  await assert.rejects(g.emit("DefifaHookV2:Transfer", { from: carol, to: bob, tokenId: 1_000_000_002n }), /underflow/);
  // Voting referee: propose, attest, revoke, re-attest, forward.
  const weights = [{ id: 1n, cashOutWeight: 10n ** 18n }];
  await g.emit("DefifaVotingReferee:ScorecardSubmitted", { gameId: 27n, scorecardId: 7n, tierWeights: weights, caller: alice }, d.votingReferee);
  assert.equal(card(g, 7n).quorum, 5_000_000_000n);
  assert.deepEqual([card(g, 7n).attestationsBegin, card(g, 7n).gracePeriodEnds], [2000n, 2000n + 86400n]);
  assert.deepEqual(normalize(card(g, 7n).tierWeights), [{ tierId: 1, cashOutWeight: String(10n ** 18n) }]);
  await g.emit("DefifaVotingReferee:ScorecardAttested", { gameId: 27n, scorecardId: 7n, weight: 3_000_000_000n, caller: bob }, d.votingReferee);
  await g.emit("DefifaVotingReferee:ScorecardAttested", { gameId: 27n, scorecardId: 7n, weight: 2_000_000_000n, caller: alice }, d.votingReferee);
  await g.emit("DefifaVotingReferee:AttestationRevoked", { gameId: 27n, scorecardId: 7n, account: alice, weight: 2_000_000_000n, caller: alice }, d.votingReferee);
  assert.equal(card(g, 7n).attestationWeight, 3_000_000_000n);
  assert.equal(card(g, 7n).attestationsCount, 1);
  assert.equal(g.rows.defifaAttestation.get(JSON.stringify([8453, 27, "7", alice])).weight, 0n);
  await g.emit("DefifaVotingReferee:ScorecardAttested", { gameId: 27n, scorecardId: 7n, weight: 2_000_000_000n, caller: alice }, d.votingReferee);
  assert.equal(card(g, 7n).attestationWeight, 5_000_000_000n);
  assert.equal(card(g, 7n).attestationsCount, 2);
  assert.equal(g.rows.defifaAttestation.get(JSON.stringify([8453, 27, "7", alice])).revokedAt, null);
  await g.emit("DefifaVotingReferee:ScorecardForwarded", { gameId: 27n, scorecardId: 7n, caller: carol }, d.votingReferee);
  await g.emit("DefifaGovernorV2:ScorecardSubmitted", { gameId: 27n, scorecardId: 7n, tierWeights: weights, caller: d.votingReferee }, d.governor);
  assert.equal(card(g, 7n).forwardedAt, 100);
  assert.equal(card(g, 7n).submittedAt, 100);
  assert.equal(card(g, 7n).proposer, alice);
  assert.equal(game(g).scorecardsCount, 1);
  assert.equal(game(g).pendingScorecardId, 7n);
  await g.emit("DefifaGovernorV2:ScorecardRatified", { gameId: 27n, scorecardId: 7n, caller: carol }, d.governor);
  await g.emit("DefifaHookV2:TierCashOutWeightsSet", { tierWeights: weights, caller: d.governor });
  await g.emit("DefifaDeployerV2:FulfilledCommitments", { gameId: 27n, pot: 1000n, caller: carol }, d.deployer);
  assert.equal(game(g).ratifiedScorecardId, 7n);
  assert.equal(card(g, 7n).ratifiedAt, 100);
  assert.deepEqual(normalize(game(g).cashOutWeights), [{ tierId: 1, cashOutWeight: String(10n ** 18n) }]);
  assert.equal(game(g).pot, 1000n);
  // Games the 2.0 deployers did not launch can still use the shared voting referee; they are ignored.
  for (const [name, args] of [
    ["ScorecardSubmitted", { gameId: 99n, scorecardId: 1n, tierWeights: weights, caller: carol }],
    ["ScorecardAttested", { gameId: 99n, scorecardId: 1n, weight: 1n, caller: carol }],
    ["AttestationRevoked", { gameId: 99n, scorecardId: 1n, account: carol, weight: 1n, caller: carol }],
    ["ScorecardForwarded", { gameId: 99n, scorecardId: 1n, caller: carol }],
  ] as const) await g.emit(`DefifaVotingReferee:${name}`, args, d.votingReferee);
  assert.equal(g.rows.defifaScorecard.size, 1);
  // A custom referee's submission creates its scorecard without a quorum.
  await g.emit("DefifaGovernorV2:ScorecardSubmitted", { gameId: 27n, scorecardId: 9n, tierWeights: weights, caller: carol }, d.governor);
  assert.equal(card(g, 9n).quorum, undefined);
  assert.equal(game(g).scorecardsCount, 2);
  assert.equal(game(g).pendingScorecardId, 9n);
  await g.emit("DefifaHookV2:TierDelegateAttestationsChanged", { delegate: bob, tierId: 1n, previousBalance: 0n, newBalance: 4n, caller: bob });
  await g.emit("DefifaHookV2:ClaimedTokens", { beneficiary: bob, defifaTokenAmount: 5n, baseProtocolTokenAmount: 6n, caller: bob });
  await g.emit("DefifaDeployerV2:QueuedNoContest", { gameId: 27n, caller: carol }, d.deployer);
  assert.equal(g.rows.defifaTierDelegate.get(JSON.stringify([8453, hook, 1, bob])).attestationUnits, 4n);
  assert.equal(game(g).noContestQueuedAt, 100);
  assert.deepEqual(one(g, "defifaEvent").map(({ type }) => type), ["launched", "minted", "scorecardProposed", "scorecardAttested",
    "scorecardAttested", "attestationRevoked", "scorecardAttested", "scorecardForwarded", "scorecardSubmitted", "scorecardRatified",
    "cashOutWeightsSet", "commitmentsFulfilled", "scorecardSubmitted", "feeTokensClaimed", "noContestQueued"]);
  assert.equal(g.errors.length, 0);

  // A 2.0 ERC-1155 game: count-based mints, paid and reserve token IDs, single and batch transfers.
  const m = fixture(readFileSync("src/DefifaDeployer.ts", "utf8"), true, 3);
  m.rows.nftTier.clear();
  m.load(readFileSync("src/Defifa1155Hook.ts", "utf8"));
  Object.assign(one(m, "project")[0], { id: "project-27", paymentsCount: 0, redeemCount: 0, volume: 0n, volumeUsd: 0n,
    redeemVolume: 0n, redeemVolumeUsd: 0n, balance: 0n, balanceUsd: 0n, tokenSupply: 0n, reservedTokenSupply: 0n,
    trendingScore: 0n, trendingVolume: 0n, trendingPaymentsCount: 0, contributorsCount: 0 });
  m.rows.suckerGroup.set(JSON.stringify(["group"]), { id: "group", projects: ["project-27"], nftsMintedCount: 0 });
  await m.emit("DefifaDeployerV2:LaunchGame", { ...launch, governor: d.governor1155 }, d.deployer1155);
  assert.equal(game(m).gameType, "erc1155");
  const tier2 = () => m.rows.nftTier.get(JSON.stringify([8453, hook, 2, 6]));
  chainState.totalMintCost = 400n;
  await m.emit("Defifa1155Hook:Mint", { tierId: 2n, beneficiary: alice, count: 3n, totalAmountContributed: 300n, caller: alice });
  await m.emit("Defifa1155Hook:TransferSingle", { operator: alice, from: zeroAddress, to: alice, id: 2n, value: 3n });
  await m.emit("Defifa1155Hook:MintReservedToken", { tierId: 2n, beneficiary: bob, count: 1n, caller: carol });
  await m.emit("Defifa1155Hook:TransferSingle", { operator: carol, from: zeroAddress, to: bob, id: 65538n, value: 1n });
  // Supply is the store's value at the block, so a launch-block mint is not subtracted twice.
  assert.equal(tier2().remainingSupply, chainState.tierSupply);
  // ERC-1155 positions stay out of the project's int NFT counter.
  assert.equal(one(m, "project")[0].nftsMintedCount, 0);
  assert.equal(game(m).totalMintCost, 400n);
  assert.deepEqual([holding(m, alice, 2).count, holding(m, alice, 2).reserveCount], [3, 0]);
  assert.deepEqual([holding(m, bob, 2).count, holding(m, bob, 2).reserveCount], [1, 1]);
  await m.emit("Defifa1155Hook:TransferBatch", { operator: alice, from: alice, to: bob, ids: [2n], values: [2n] });
  await m.emit("Defifa1155Hook:TransferSingle", { operator: alice, from: alice, to: zeroAddress, id: 2n, value: 1n });
  assert.deepEqual([holding(m, alice, 2).count, holding(m, bob, 2).count, holding(m, bob, 2).reserveCount], [0, 3, 1]);
  assert.ok(m.rows.participant.size >= 2);
  assert.deepEqual(one(m, "defifaEvent").filter(({ type }) => type !== "launched").map(({ type, count, amount }) => [type, count, amount]),
    [["minted", 3, 300n], ["reserveMinted", 1, undefined]]);
  assert.equal(m.errors.length, 0);

  // A referee's initializeGameFor callback runs before LaunchGame, so hook events can precede the seed: they
  // resolve the game from the hook, skip rows the seed will write, and leave counters to the launch's reads.
  const early = fixture(readFileSync("src/DefifaDeployer.ts", "utf8"), true, 3);
  early.rows.nftTier.clear();
  early.load(readFileSync("src/Defifa1155Hook.ts", "utf8"));
  chainState.totalMintCost = 300n;
  await early.emit("Defifa1155Hook:DelegateChanged", { delegator: alice, fromDelegate: zeroAddress, toDelegate: bob, caller: alice });
  await early.emit("Defifa1155Hook:TierDelegateAttestationsChanged", { delegate: bob, tierId: 1n, previousBalance: 0n, newBalance: 2n, caller: alice });
  await early.emit("Defifa1155Hook:Mint", { tierId: 1n, beneficiary: alice, count: 3n, totalAmountContributed: 300n, caller: alice });
  await early.emit("Defifa1155Hook:TransferSingle", { operator: alice, from: zeroAddress, to: alice, id: 1n, value: 3n });
  // No refund period: two rulesets.
  chainState.rulesetStarts = [5000n, 1000n];
  await early.emit("DefifaDeployerV2:LaunchGame", { ...launch, governor: d.governor1155 }, d.deployer1155);
  assert.equal(early.errors.length, 0);
  assert.equal(early.rows.defifaTierDelegate.get(JSON.stringify([8453, hook, 1, bob])).projectId, 27);
  assert.equal(holding(early, alice, 1).count, 3);
  assert.deepEqual(normalize([game(early).totalMintCost, game(early).refundStartsAt, game(early).scoringStartsAt]), normalize([300n, undefined, 5000n]));
  assert.equal(early.rows.nftTier.size, 3);
  chainState.rulesetStarts = [5000n];
  const broken = fixture(readFileSync("src/DefifaDeployer.ts", "utf8"), true, 3);
  broken.rows.nftTier.clear();
  await assert.rejects(broken.emit("DefifaDeployerV2:LaunchGame", launch, d.deployer), /rulesets/);
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
for (const network of ["mainnet", "testnet"] as const) {
  const d = DEFIFA_V2_DEPLOYMENTS[network];
  assert.deepEqual([d.deployer, d.deployer1155, d.governor, d.governor1155, d.votingReferee, d.store], [
    "0x32cd7d0c378a45a27cd7e361bce0ba882efe87a9", "0x7a62383b50aaa8b212bd965c426490625068ba80",
    "0xd8debb4e66c11cd72643e450b3beaced73ff7b78", "0x53eede0488861cb6c7c643cd77d7f92f4ede2879",
    "0xf6552cc178042e9ed13c768929983e7d93254640", "0xf65dd3adbac3d776cfa025458cac730aa52adb7d",
  ]);
  // Each 2.0 source is wired to this network's deployments: both deployers, the 721 and 1155 hook factories,
  // both governors and the voting referee.
  for (const fragment of [
    `address: [DEFIFA_V2_DEPLOYMENTS.${network}.deployer, DEFIFA_V2_DEPLOYMENTS.${network}.deployer1155]`,
    `address: DEFIFA_V2_DEPLOYMENTS.${network}.deployer1155,\n        event`,
    `address: DEFIFA_V2_DEPLOYMENTS.${network}.address,\n        event`,
    `address: [DEFIFA_V2_DEPLOYMENTS.${network}.governor, DEFIFA_V2_DEPLOYMENTS.${network}.governor1155]`,
    `address: DEFIFA_V2_DEPLOYMENTS.${network}.votingReferee`,
  ]) assert.ok(config.includes(fragment), fragment);
  assert.equal(config.split(`chain: DEFIFA_V2_DEPLOYMENTS.${network}.chain`).length - 1, 5);
}
// Receipt-backed: the earliest 2.0 contract's creation block per mainnet (deploy-all-v6 deployments/<chain>/).
assert.deepEqual(Object.values(DEFIFA_V2_DEPLOYMENTS.mainnet.chain).map(({ startBlock }) => startBlock), [26280781, 518605659, 53137696, 158732986]);
assert.deepEqual(Object.values(DEFIFA_V2_DEPLOYMENTS.testnet.chain).map(({ startBlock }) => startBlock), [12015043, 323803586, 51506348, 50710273]);
