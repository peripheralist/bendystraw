import assert from "node:assert/strict";
import { decodeEventLog, encodeAbiParameters, encodeEventTopics, getAbiItem } from "viem";
import { CTPublisherV6Abi } from "../abis/CTPublisherV6Abi";
import type { Context, Event } from "ponder:registry";
import { configurePostingCriteriaEvent, nftHook, postingAllowance } from "../ponder.schema";
import { recordPostingAllowance } from "../src/util/postingAllowance";
import { ROLLOUT_DEPLOYMENTS } from "../src/constants/rolloutDeployments";
import { rolloutChains } from "../src/constants/rollout";

const address = (digit: string) => `0x${digit.repeat(40)}` as `0x${string}`;
const hook = address("1"), publisher = address("2"), caller = address("3");
const hooks = new Map<string, any>(), current = new Map<string, any>(), history: any[] = [];
let rpcCalls = 0, rpcFailure = false;
const key = (row: any) => `${row.chainId}:${row.publisher}:${row.hook}:${row.category}:${row.version}`;
const context = {
  chain: { id: 1 },
  client: { readContract: async (request: any) => {
    rpcCalls++;
    assert.equal(request.functionName, "projectId");
    assert.equal(request.blockNumber, 100n);
    if (rpcFailure) throw new Error("RPC unavailable");
    return 2n;
  } },
  db: {
    find: async (_table: unknown, row: any) => hooks.get(`${row.chainId}:${row.address}:${row.version}`),
    insert: (table: unknown) => ({ values: (row: any) => {
      if (table === nftHook) { hooks.set(`${row.chainId}:${row.address}:${row.version}`, row); return Promise.resolve(row); }
      if (table === configurePostingCriteriaEvent) { history.push(row); return Promise.resolve(row); }
      assert.equal(table, postingAllowance);
      return { onConflictDoUpdate: async (replacement: any) => {
        assert.deepEqual(row, replacement);
        current.set(key(row), replacement);
      } };
    } }),
  },
} as unknown as Context<"CTPublisher6:ConfigurePostingCriteria">;
const event = (overrides: any = {}) => ({
  args: { hook, caller, allowedPost: {
    hook, category: 111, minimumPrice: (1n << 104n) - 1n,
    minimumTotalSupply: 999999999, maximumTotalSupply: 4294967295,
    maximumSplitPercent: 4294967295, allowedAddresses: [address("4")],
    ...overrides.criteria,
  } },
  block: { number: 100n, timestamp: 1700000000n },
  log: { address: publisher, logIndex: overrides.logIndex ?? 0 },
  transaction: { hash: `0x${"a".repeat(64)}`, from: caller },
  ...overrides.event,
} as Event<"CTPublisher6:ConfigurePostingCriteria">);
const abiEvent = getAbiItem({ abi: CTPublisherV6Abi, name: "ConfigurePostingCriteria" });
const topics = encodeEventTopics({ abi: CTPublisherV6Abi, eventName: "ConfigurePostingCriteria", args: { hook } });
const data = encodeAbiParameters([abiEvent.inputs[1], abiEvent.inputs[2]], [event().args.allowedPost, caller]);
const decoded = decodeEventLog({ abi: CTPublisherV6Abi, eventName: "ConfigurePostingCriteria", topics: topics as [`0x${string}`, ...`0x${string}`[]], data });
assert.equal(decoded.args.allowedPost.minimumPrice, (1n << 104n) - 1n, "Canonical event decoding preserves uint104 values");
await recordPostingAllowance(event(), context);
assert.equal(rpcCalls, 1);
assert.equal(hooks.size, 1, "A missing hook must acquire its project relation");
assert.equal(current.size, 1);
const first = [...current.values()][0];
assert.equal(first.minimumPrice, (1n << 104n) - 1n, "uint104 must retain exact precision");
assert.equal(first.maximumTotalSupply, 4294967295n, "uint32 must not overflow signed integers");
assert.equal(first.projectId, 2);
await recordPostingAllowance(event({ logIndex: 1, criteria: {
  minimumPrice: 7n, minimumTotalSupply: 1, maximumTotalSupply: 9,
  maximumSplitPercent: 0, allowedAddresses: [],
} }), context);
assert.equal(rpcCalls, 1, "Already-indexed hooks avoid additional RPC calls");
assert.equal(current.size, 1);
assert.deepEqual([...current.values()][0].allowedAddresses, [], "An empty allowlist replaces the previous list");
assert.equal([...current.values()][0].minimumPrice, 7n);
assert.equal([...current.values()][0].logIndex, 1, "Same-transaction updates follow log ordering");
assert.equal(history.length, 2, "Both configuration events remain available");
assert.notEqual(history[0].id, history[1].id);
for (const variant of [
  { event: { log: { address: address("5"), logIndex: 2 } } },
  { criteria: { hook: address("6") }, event: { args: { ...event().args, hook: address("6"), allowedPost: { ...event().args.allowedPost, hook: address("6") } } } },
]) await recordPostingAllowance(event(variant), context);
(context.chain as any).id = 10;
await recordPostingAllowance(event(), context);
assert.equal(current.size, 4, "Chain, publisher, and hook identities must never collide");
const before = history.length;
rpcFailure = true;
(context.chain as any).id = 8453;
await assert.rejects(recordPostingAllowance(event(), context), /RPC unavailable/);
assert.equal(history.length, before, "Unresolved projects cannot silently create partial rows");
await assert.rejects(recordPostingAllowance(event({ criteria: { hook: address("7") } }), context), /does not match/);
const deployments = ROLLOUT_DEPLOYMENTS.deployments.filter((row) => row.contract === "CTPublisher");
assert.deepEqual(deployments.map((row) => row.chainId).sort((a,b) => a-b), [1,10,8453,42161,84532,421614,11155111,11155420].sort((a,b) => a-b));
for (const row of deployments) {
  assert.ok(row.startBlock > 0);
  const source = { ...rolloutChains("CTPublisher", false), ...rolloutChains("CTPublisher", true) }[row.chain];
  assert.ok(source.address.includes(row.address));
  assert.ok(source.startBlock <= row.startBlock, "Include publisher deployment-block events");
}
console.log("Posting allowance replacement, precision, identity, hook resolution, and eight-chain receipt sources pass.");
