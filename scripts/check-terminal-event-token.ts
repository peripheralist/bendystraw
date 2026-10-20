// V6 terminal events must be priced in the token they moved, not the project's
// last-set accounting context. Mainnet V6 project 12 accepts ETH then USDC; its
// 0.0001 ETH payment was indexed as 100,000,000 USDC.
// Run: node --import tsx scripts/check-terminal-event-token.ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JBBuybackHookV6Abi } from "../abis/JBBuybackHookV6Abi";
import { ADDRESS } from "../src/constants/address";
import { buybackMintForwardedAmount } from "../src/util/buybackMintAmount";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { encodeFunctionData, parseAbi, toEventSelector, type Hex } from "viem";
import {
  TerminalEventTokenError,
  terminalEventToken,
  tokensForLog,
  type CallFrame,
  type TraceLog,
} from "../src/util/terminalEventToken";

const terminal = "0x130f5dd2bd8805443cf41755253d778a75a67f53" as const;
const store = "0x7497ae014a60561925b51c0a3b4ade7460b9927c";
const ETH = "0x000000000000000000000000000000000000EEEe" as const;
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as const;
const holder = "0x00000000000000000000000000000000000000aa" as const;

const abi = parseAbi([
  "struct JBTokenAmount { address token; uint8 decimals; uint32 currency; uint256 value; }",
  "function recordPaymentFrom(address payer, JBTokenAmount amount, uint256 projectId, address beneficiary, bytes metadata)",
  "function recordAddedBalanceFor(uint256 projectId, address token, uint256 amount)",
]);

const payRecord = (token: `0x${string}`, projectId = 12n): CallFrame => ({
  from: terminal,
  to: store,
  input: encodeFunctionData({
    abi,
    functionName: "recordPaymentFrom",
    args: [holder, { token, decimals: 18, currency: 1, value: 5n }, projectId, holder, "0x"],
  }),
});
const addRecord = (token: `0x${string}`): CallFrame => ({
  from: terminal,
  to: store,
  input: encodeFunctionData({ abi, functionName: "recordAddedBalanceFor", args: [12n, token, 5n] }),
});
const log = (data: Hex, position: number): TraceLog => ({
  address: terminal,
  topics: ["0x01"],
  data,
  position: `0x${position.toString(16)}`,
});
const target = (data: Hex) => ({ address: terminal, topics: ["0x01"] as Hex[], data });
const frame = (calls: CallFrame[], logs: TraceLog[], extra: Partial<CallFrame> = {}): CallFrame => ({
  from: holder,
  to: terminal,
  input: "0x",
  calls,
  logs,
  ...extra,
});
const pays = (trace: CallFrame, data: Hex = "0xaa") =>
  tokensForLog({ trace, kind: "pay", projectId: 12n, log: target(data) });

// The real project 12 payment (callTracer withLog) records ETH.
const trace12 = JSON.parse(
  readFileSync(new URL("./fixtures/eth-12-pay-trace.json", import.meta.url), "utf8")
) as CallFrame;
const paySelector = toEventSelector(
  "Pay(uint256,uint256,uint256,address,address,uint256,uint256,string,bytes,address)"
);
const payLog12 = trace12.logs!.find((l) => l.topics[0] === paySelector)!;
assert.ok(payLog12);
const payTarget12 = { address: terminal, topics: payLog12.topics, data: payLog12.data };
assert.deepEqual(tokensForLog({ trace: trace12, kind: "pay", projectId: 12n, log: payTarget12 }), [ETH]);
// Another project has no record call for that log.
assert.deepEqual(tokensForLog({ trace: trace12, kind: "pay", projectId: 13n, log: payTarget12 }), [null]);

// Two pays in one frame, identical logs: each pairs with its own record.
assert.deepEqual(
  pays(frame([payRecord(ETH), payRecord(USDC)], [log("0xaa", 1), log("0xaa", 2)])),
  [ETH, USDC]
);
// A reentrant pay inside a hook does not leak into the outer pay's log.
assert.deepEqual(
  pays(frame([payRecord(ETH), frame([payRecord(USDC)], [log("0xbb", 1)])], [log("0xaa", 2)]), "0xaa"),
  [ETH]
);
assert.deepEqual(
  pays(frame([payRecord(ETH), frame([payRecord(USDC)], [log("0xbb", 1)])], [log("0xaa", 2)]), "0xbb"),
  [USDC]
);
// Reverted frames are skipped; records made in a delegatecall carry out.
assert.deepEqual(
  pays(frame([payRecord(ETH), { ...payRecord(USDC), error: "execution reverted" }], [log("0xaa", 2)])),
  [ETH]
);
assert.deepEqual(
  pays(frame([frame([payRecord(USDC)], [], { type: "DELEGATECALL", from: terminal })], [log("0xaa", 1)])),
  [USDC]
);
// AddToBalance is emitted before its record: it pairs with the next one.
assert.deepEqual(
  tokensForLog({
    trace: frame([addRecord(ETH), addRecord(USDC)], [log("0xaa", 1)]),
    kind: "addToBalance",
    projectId: 12n,
    log: target("0xaa"),
  }),
  [USDC]
);
assert.deepEqual(
  tokensForLog({ trace: frame([addRecord(ETH)], [log("0xaa", 1)]), kind: "addToBalance", projectId: 12n, log: target("0xaa") }),
  [null]
);
// A trace without log positions cannot be paired.
assert.throws(
  () => pays(frame([payRecord(ETH)], [{ ...log("0xaa", 1), position: undefined }])),
  TerminalEventTokenError
);

// terminalEventToken: one context needs no trace; several use it.
const contexts12 = [
  { token: ETH, decimals: 18, currency: 61166 },
  { token: USDC, decimals: 6, currency: 906423112 },
];
const NUL_SYMBOL_TOKEN = "0x00000000000000000000000000000000000000ee";
const fakeContext = (
  contexts: { token: `0x${string}`; decimals: number; currency: number }[],
  trace: CallFrame | Error,
  receiptLogs: { address: string; topics: Hex[]; data: Hex; logIndex: number }[] = []
) => {
  const calls: string[] = [];
  return {
    calls,
    context: {
      chain: { id: 1 },
      client: {
        readContract: async ({ functionName, address }: { functionName: string; address: string }) => {
          if (functionName !== "symbol") return calls.push("readContract"), contexts;
          calls.push(`symbol ${address}`);
          if (address === USDC) return "USDC";
          if (address === NUL_SYMBOL_TOKEN) return "USD\u0000C";
          throw new Error("execution reverted");
        },
        request: async () => {
          calls.push("request");
          if (trace instanceof Error) throw trace;
          return trace;
        },
        getTransactionReceipt: async () => (calls.push("receipt"), { logs: receiptLogs }),
      },
    } as any,
  };
};
const event = (l: { topics: Hex[]; data: Hex }, logIndex = 132) => ({
  log: { address: terminal, topics: l.topics, data: l.data, logIndex },
  transaction: { hash: "0x213463399972bb54d08c2bce5c1c8e0d710d09fac3fc0640971a2fcf0e9da0cc" as const },
});

{
  const { context, calls } = fakeContext(contexts12, trace12);
  assert.deepEqual(
    await terminalEventToken({ event: event(payLog12), context, kind: "pay", projectId: 12n }),
    { token: ETH, decimals: 18, currency: 61166n, symbol: "ETH" }
  );
  // The native token's symbol needs no read.
  assert.deepEqual(calls, ["readContract", "request"]);
}
{
  const { context, calls } = fakeContext([contexts12[1]!], trace12);
  assert.deepEqual(
    await terminalEventToken({ event: event(payLog12), context, kind: "pay", projectId: 12n }),
    { token: USDC, decimals: 6, currency: 906423112n, symbol: "USDC" }
  );
  assert.deepEqual(calls, ["readContract", `symbol ${USDC}`]);
}
{
  // No process-wide cache: every event reads its symbol at its own block, so a
  // re-index stores the same values.
  const { context, calls } = fakeContext([contexts12[1]!], trace12);
  const again = await terminalEventToken({ event: event(payLog12), context, kind: "pay", projectId: 12n });
  assert.equal(again?.symbol, "USDC");
  assert.deepEqual(calls, ["readContract", `symbol ${USDC}`]);
}
{
  // A symbol PostgreSQL text cannot store (NUL) is logged and stored as null; the event keeps its token.
  const { context } = fakeContext([{ token: NUL_SYMBOL_TOKEN, decimals: 6, currency: 2 }], trace12);
  const quiet = console.error;
  console.error = () => {};
  try {
    assert.deepEqual(
      await terminalEventToken({ event: event(payLog12), context, kind: "pay", projectId: 12n }),
      { token: NUL_SYMBOL_TOKEN, decimals: 6, currency: 2n, symbol: null }
    );
  } finally {
    console.error = quiet;
  }
}
{
  // A token that does not answer symbol() keeps its token, with a null symbol.
  const odd = "0x00000000000000000000000000000000000000bb" as const;
  const { context } = fakeContext([{ token: odd, decimals: 18, currency: 1 }], trace12);
  assert.deepEqual(
    await terminalEventToken({ event: event(payLog12), context, kind: "pay", projectId: 12n }),
    { token: odd, decimals: 18, currency: 1n, symbol: null }
  );
}
{
  // Identical logs: the receipt order picks this one.
  const twin = frame([payRecord(ETH), payRecord(USDC)], [log("0xaa", 1), log("0xaa", 2)]);
  const receipt = [
    { address: terminal, topics: ["0x01" as Hex], data: "0xaa" as Hex, logIndex: 7 },
    { address: terminal, topics: ["0x01" as Hex], data: "0xaa" as Hex, logIndex: 9 },
  ];
  const { context, calls } = fakeContext(contexts12, twin, receipt);
  const second = await terminalEventToken({
    event: event({ topics: ["0x01"], data: "0xaa" }, 9),
    context,
    kind: "pay",
    projectId: 12n,
  });
  assert.equal(second?.token, USDC);
  assert.deepEqual(calls, ["readContract", "request", "receipt", `symbol ${USDC}`]);
}
// No record for the log, or an RPC without the debug namespace: null, which
// handlers store as no token at 0 USD.
const quiet = console.error;
console.error = () => {};
try {
  assert.equal(
    await terminalEventToken({ event: event(payLog12), context: fakeContext(contexts12, frame([], [])).context, kind: "pay", projectId: 12n }),
    null
  );
  assert.equal(
    await terminalEventToken({
      event: event(payLog12),
      context: fakeContext(contexts12, new Error("method not found")).context,
      kind: "pay",
      projectId: 12n,
    }),
    null
  );
} finally {
  console.error = quiet;
}

// projectTokenBalance imports ponder's virtual schema module, so it runs with a stand-in.
const tokenBalanceModule: Record<string, (input: any) => Promise<void>> = {};
runInNewContext(
  ts.transpileModule(readFileSync(new URL("../src/util/projectTokenBalance.ts", import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText,
  {
    exports: tokenBalanceModule,
    BigInt,
    Number,
    console: { error: (...args: unknown[]) => console.error(...args) },
    require(name: string) {
      if (name === "ponder:schema") {
        return { projectTokenBalance: "projectTokenBalance", projectTokenBalanceMoment: "projectTokenBalanceMoment" };
      }
      if (name === "viem") return { parseAbi };
      if (name === "../../abis/JBMultiTerminalAbi") return { JBMultiTerminalAbi: [] };
      if (name === "../constants/address") return { ADDRESS };
      if (name === "./tokenSymbol") return { tokenSymbol: async () => "USDC" };
      // Stand-in rate: the context's currency in whole dollars, so the test sees which currency was used.
      if (name === "./usdPrice") {
        return { usdPerAccountingTokenAtBlock: async ({ currency }: { currency: bigint }) => currency * 10n ** 18n };
      }
      throw new Error(`Unexpected import ${name}`);
    },
  }
);
const updateProjectTokenBalance = tokenBalanceModule.updateProjectTokenBalance!;
const refreshProjectTokenBalance = tokenBalanceModule.refreshProjectTokenBalance!;

{
  // Per-token balances are the store's own balanceOf at each event's block,
  // never a running sum of event amounts; volume accrues from payments. Each
  // block keeps its last balance as a moment. Pre-V6 and unresolved events
  // write nothing.
  const rows = new Map<string, any>();
  const moments = new Map<string, any>();
  // The store's balance per token and block.
  const store: Record<string, bigint> = {};
  const reads: string[] = [];
  let block = 0;
  const db = {
    insert: (table: string) => ({
      values: (v: any) => ({
        onConflictDoUpdate: async (update: any) => {
          const target = table === "projectTokenBalance" ? rows : moments;
          const key = `${v.chainId}:${v.projectId}:${v.version}:${v.token}${v.block === undefined ? "" : `@${v.block}`}`;
          const row = target.get(key);
          const next = row ? { ...row, ...(typeof update === "function" ? update(row) : update) } : v;
          target.set(key, next);
          return next;
        },
      }),
    }),
  };
  const client = {
    readContract: async ({ functionName, address, args }: any) => {
      reads.push(functionName);
      if (functionName === "accountingContextForTokenOf") return { token: args[1], decimals: 6, currency: 2 };
      assert.equal(address, ADDRESS.jbTerminalStore6);
      assert.equal(args[0], ADDRESS.jbMultiTerminal6);
      return store[`${args[2]}@${block}`] ?? 0n;
    },
  };
  const ctx = { chain: { id: 1 }, db, client } as any;
  const eth = { token: ETH, decimals: 18, currency: 61166n, symbol: "ETH" };
  // USDC accounted as USD (currency 2), not its address-derived currency.
  const usdc = { token: USDC, decimals: 6, currency: 2n, symbol: "USDC" };
  const move = async (version: number, tokenContext: any, at: number, volumeDelta?: bigint) => {
    block = at;
    await updateProjectTokenBalance({
      context: ctx, version, projectId: 12, tokenContext, volumeDelta,
      block: { number: BigInt(at), timestamp: BigInt(at * 12) },
    });
  };
  // Block 1: pays of 100 ETH-wei and 5 USDC-units.
  store[`${ETH}@1`] = 100n;
  store[`${USDC}@1`] = 5n;
  await move(6, eth, 1, 100n);
  await move(6, usdc, 1, 5n);
  // Block 2: a cash-out whose event reclaims 39 net, while fees and a hook took
  // the store's balance down by 50 — the row follows the store, not the event.
  store[`${ETH}@2`] = 50n;
  await move(6, eth, 2);
  // Block 3: a payout of 50 whose transfer reverted and was refunded leaves the store at 50.
  store[`${ETH}@3`] = 50n;
  await move(6, eth, 3);
  // Block 4: a fee revert credits USDC with no amount event; the refresh reads it.
  store[`${USDC}@4`] = 7n;
  block = 4;
  await refreshProjectTokenBalance({
    context: ctx, version: 6, projectId: 12n, token: USDC, block: { number: 4n, timestamp: 48n },
  });
  const readsBefore = reads.length;
  await move(5, eth, 5);
  await move(6, null, 5);
  assert.equal(reads.length, readsBefore, "pre-V6 and unresolved events read nothing");

  const pick = (m: Map<string, any>) =>
    Object.fromEntries([...m].map(([k, v]) => [k, [v.balance, v.volume]]));
  assert.deepEqual(pick(rows), { [`1:12:6:${ETH}`]: [50n, 100n], [`1:12:6:${USDC}`]: [7n, 5n] });
  assert.deepEqual(pick(moments), {
    [`1:12:6:${ETH}@1`]: [100n, 100n],
    [`1:12:6:${USDC}@1`]: [5n, 5n],
    [`1:12:6:${ETH}@2`]: [50n, 100n],
    [`1:12:6:${ETH}@3`]: [50n, 100n],
    [`1:12:6:${USDC}@4`]: [7n, 5n],
  });
  // The moment's rate uses the event's accounting currency.
  assert.equal(moments.get(`1:12:6:${USDC}@1`).tokenUsdRate, 2n * 10n ** 18n);

  // A failed read never throws into the handler: the row keeps its last values.
  const quietError = console.error;
  const logged: unknown[] = [];
  console.error = (...args: unknown[]) => void logged.push(args);
  const readStore = client.readContract;
  try {
    ctx.client.readContract = async () => {
      throw new Error("RPC timeout");
    };
    await move(6, eth, 6, 1n);
    await refreshProjectTokenBalance({
      context: ctx, version: 6, projectId: 12n, token: USDC, block: { number: 6n, timestamp: 72n },
    });
  } finally {
    console.error = quietError;
  }
  assert.equal(logged.length, 2);
  // The failed pay's volume (1) is kept; the balance keeps its last value.
  assert.deepEqual(pick(rows), { [`1:12:6:${ETH}`]: [50n, 101n], [`1:12:6:${USDC}`]: [7n, 5n] });
  assert.equal(moments.has(`1:12:6:${ETH}@6`), false);
  // The next successful read repairs the balance; volume stays complete.
  ctx.client.readContract = readStore;
  store[`${ETH}@7`] = 53n;
  await move(6, eth, 7, 2n);
  assert.deepEqual(pick(rows)[`1:12:6:${ETH}`], [53n, 103n]);
  assert.deepEqual(pick(moments)[`1:12:6:${ETH}@7`], [53n, 103n]);
}

{
  // A buyback Mint takes the forwarded amount from the afterPayRecordedWith
  // call that emitted it. Nested payments, before or after the Mint (a custom
  // token's mint callback paying the project again), cannot stand in.
  const hook = "0x00000000000000000000000000000000000000cc" as const;
  const amount = (token: `0x${string}`, currency: number) => ({ token, decimals: 18, currency, value: 1n });
  const hookCall = (token: `0x${string}`, currency: number, calls: CallFrame[], logs: TraceLog[], extra: Partial<CallFrame> = {}): CallFrame => ({
    from: terminal,
    to: hook,
    type: "CALL",
    input: encodeFunctionData({
      abi: JBBuybackHookV6Abi,
      functionName: "afterPayRecordedWith",
      args: [{
        payer: holder, projectId: 12n, rulesetId: 1n,
        amount: amount(token, currency), forwardedAmount: amount(token, currency),
        weight: 1n, newlyIssuedTokenCount: 0n, beneficiary: holder, hookMetadata: "0x", payerMetadata: "0x",
      }] as any,
    }),
    calls,
    logs,
    ...extra,
  });
  const mintLog = (data: Hex): TraceLog => ({ address: hook, topics: ["0x02"], data, position: "0x0" });
  const mint = { address: hook, topics: ["0x02"] as Hex[], data: "0xaa" as Hex };
  const nested = (token: `0x${string}`, currency: number, data: Hex) =>
    ({ from: hook, to: terminal, type: "CALL", input: "0x", calls: [hookCall(token, currency, [], [mintLog(data)])] }) as CallFrame;
  // ETH call: a nested USDC pay before its Mint, its Mint, then a nested USDC pay after it.
  const outer = frame([hookCall(ETH, 61166, [nested(USDC, 2, "0xbb"), nested(USDC, 2, "0xcc")], [mintLog("0xaa")])], []);
  assert.equal(buybackMintForwardedAmount({ trace: outer, hook, mint })?.currency, 61166);
  // The Mint emitted through a delegatecall (a proxied hook) still belongs to its call.
  const proxied = frame([hookCall(ETH, 61166, [{ from: hook, to: holder, type: "DELEGATECALL", input: "0x", logs: [mintLog("0xaa")] }], [])], []);
  assert.equal(buybackMintForwardedAmount({ trace: proxied, hook, mint })?.currency, 61166);
  // A reverted call does not count; two calls holding an identical Mint are ambiguous.
  assert.equal(buybackMintForwardedAmount({ trace: frame([hookCall(ETH, 61166, [], [mintLog("0xaa")], { error: "reverted" })], []), hook, mint }), null);
  const twice = frame([hookCall(ETH, 61166, [], [mintLog("0xaa")]), hookCall(USDC, 2, [], [mintLog("0xaa")])], []);
  assert.equal(buybackMintForwardedAmount({ trace: twice, hook, mint }), null);
}

console.log("terminal event token checks passed");
