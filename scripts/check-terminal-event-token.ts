// V6 terminal events must be priced in the token they moved, not the project's
// last-set accounting context. Mainnet V6 project 12 accepts ETH then USDC; its
// 0.0001 ETH payment was indexed as 100,000,000 USDC.
// Run: node --import tsx --import ./scripts/ponder-schema-loader.mjs scripts/check-terminal-event-token.ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ADDRESS } from "../src/constants/address";
import { acceptedTokenCurrency } from "../src/util/usdPrice";
import { abandonBuybackMint, parkBuybackMint, priceBuybackMint } from "../src/util/buybackMintAmount";
import { pendingBuybackMint, projectTokenBalance as tokenBalanceTable, swapEvent } from "ponder:schema";
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
  receiptLogs: { address: string; topics: Hex[]; data: Hex; logIndex: number }[] = [],
  storedSymbols: Record<string, string> = {}
) => {
  const calls: string[] = [];
  return {
    calls,
    context: {
      chain: { id: 1 },
      db: {
        find: async (table: unknown, key: { token: string }) => {
          assert.equal(table, tokenBalanceTable);
          return key.token in storedSymbols ? { tokenSymbol: storedSymbols[key.token] } : undefined;
        },
      },
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
  // A symbol already on the project's token row is reused: one read per
  // project token, not per event, and the same on every re-index.
  const { context, calls } = fakeContext([contexts12[1]!], trace12, [], { [USDC]: "USDC" });
  const again = await terminalEventToken({ event: event(payLog12), context, kind: "pay", projectId: 12n });
  assert.equal(again?.symbol, "USDC");
  assert.deepEqual(calls, ["readContract"]);
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
const tokenBalanceModule: Record<string, (...input: any[]) => any> = {};
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
      if (name === "./tokenSymbol") return { knownTokenSymbol: async () => "USDC" };
      // Stand-in rates: the context's currency in whole dollars, so the test sees
      // which currency was used, times a price the test can move.
      if (name === "./usdPrice") {
        // price 0 stands for a missing feed; `indexRate` is the external index.
        return {
          usdPerAccountingTokenAtBlock: async ({ currency }: { currency: bigint }) =>
            price ? currency * 10n ** 18n * price : null,
          indexUsdRate: async () => indexRate,
        };
      }
      throw new Error(`Unexpected import ${name}`);
    },
  }
);
let price = 1n;
let indexRate: bigint | null = null;
const updateProjectTokenBalance = tokenBalanceModule.updateProjectTokenBalance!;
const refreshProjectTokenBalance = tokenBalanceModule.refreshProjectTokenBalance!;
// Results built in the vm realm compare by value once copied into this one.
const plain = (x: any) => (x && typeof x === "object" ? { ...x } : x);
const projectBalanceDelta = (...a: any[]) => plain(tokenBalanceModule.projectBalanceDelta!(...a));

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
    find: async (table: string, k: any) => {
      assert.equal(table, "projectTokenBalance");
      return rows.get(`${k.chainId}:${k.projectId}:${k.version}:${k.token}`);
    },
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
  const move = (version: number, tokenContext: any, at: number, volumeDelta?: bigint) => {
    block = at;
    return updateProjectTokenBalance({
      context: ctx, version, projectId: 12, tokenContext, volumeDelta,
      block: { number: BigInt(at), timestamp: BigInt(at * 12) },
    }).then(plain);
  };
  const change = (delta: bigint, deltaUsd: bigint) => ({ delta, deltaUsd });
  // USD at the stand-in rates: ETH (currency 61166, 18 decimals), USDC as USD (2, 6 decimals).
  const usdEth = (wei: bigint) => wei * 61166n * price;
  const usdUsdc = (units: bigint) => (units * 2n * 10n ** 18n * price) / 10n ** 6n;
  // Block 1: pays of 100 ETH-wei and 5 USDC-units.
  store[`${ETH}@1`] = 100n;
  store[`${USDC}@1`] = 5n;
  assert.deepEqual(await move(6, eth, 1, 100n), change(100n, usdEth(100n)));
  assert.deepEqual(await move(6, usdc, 1, 5n), change(5n, usdUsdc(5n)));
  // Block 2: a cash-out whose event reclaims 39 net, while fees and a hook took
  // the store's balance down by 50 — the row and the project's change follow
  // the store, not the event.
  store[`${ETH}@2`] = 50n;
  assert.deepEqual(await move(6, eth, 2), change(-50n, usdEth(50n) - usdEth(100n)));
  // Block 3: a payout of 50 whose transfer reverted and was refunded leaves the store at 50.
  store[`${ETH}@3`] = 50n;
  assert.deepEqual(await move(6, eth, 3), change(0n, 0n));
  // Block 4: a fee revert credits USDC with no amount event; the refresh reads it.
  store[`${USDC}@4`] = 7n;
  block = 4;
  assert.deepEqual(
    plain(await refreshProjectTokenBalance({
      context: ctx, version: 6, projectId: 12n, token: USDC, block: { number: 4n, timestamp: 48n },
    })),
    change(2n, usdUsdc(7n) - usdUsdc(5n))
  );
  const readsBefore = reads.length;
  // Pre-V6 keeps event arithmetic (null); an unresolved V6 token moves nothing.
  assert.equal(await move(5, eth, 5), null);
  assert.deepEqual(await move(6, null, 5), change(0n, 0n));
  assert.equal(reads.length, readsBefore, "pre-V6 and unresolved events read nothing");
  assert.deepEqual(projectBalanceDelta(null, -39n, -78n), change(-39n, -78n));
  assert.deepEqual(projectBalanceDelta(change(-50n, -100n), -39n, -78n), change(-50n, -100n));

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
    // The project moves by nothing, so it stays the sum of its token rows.
    assert.deepEqual(await move(6, eth, 6, 1n), change(0n, 0n));
    assert.deepEqual(
      plain(await refreshProjectTokenBalance({
        context: ctx, version: 6, projectId: 12n, token: USDC, block: { number: 6n, timestamp: 72n },
      })),
      change(0n, 0n)
    );
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
  // The repairing read's change covers the missed movement too.
  assert.equal((await move(6, eth, 7, 2n)).delta, 3n);
  assert.deepEqual(pick(rows)[`1:12:6:${ETH}`], [53n, 103n]);
  assert.deepEqual(pick(moments)[`1:12:6:${ETH}@7`], [53n, 103n]);

  // USD tracks the balance at its latest rate, never a residue of past rates:
  // the token's USD changes always sum to its current value, and an emptied
  // balance is worth exactly 0 even after the price moved.
  const ethRow = () => rows.get(`1:12:6:${ETH}`);
  assert.equal(ethRow().balanceUsd, usdEth(53n));
  price = 3n;
  store[`${ETH}@8`] = 53n;
  assert.deepEqual(await move(6, eth, 8), change(0n, usdEth(53n) - 53n * 61166n));
  store[`${ETH}@9`] = 0n;
  assert.deepEqual(await move(6, eth, 9), change(-53n, -usdEth(53n)));
  assert.equal(ethRow().balanceUsd, 0n);
  // With no rate at a block, the token keeps its last known one.
  price = 0n;
  store[`${ETH}@10`] = 10n;
  assert.deepEqual(await move(6, eth, 10), change(10n, 10n * 61166n * 3n));

  // With no on-chain feed, an amount event's update uses the external index
  // (the same memoized request as the event's own valuation); a refresh (fee
  // revert, migration) does not ask it and keeps the last known rate.
  price = 0n;
  indexRate = 4n * 10n ** 18n;
  store[`${USDC}@11`] = 7n;
  block = 11;
  assert.deepEqual(
    plain(await refreshProjectTokenBalance({
      context: ctx, version: 6, projectId: 12n, token: USDC, block: { number: 11n, timestamp: 132n },
    })),
    change(0n, 0n)
  );
  // A price-only change moves USD with no raw change, so callers apply the
  // change unless both parts are 0.
  store[`${USDC}@12`] = 7n;
  assert.deepEqual(
    await move(6, usdc, 12),
    change(0n, (7n * 4n * 10n ** 18n) / 10n ** 6n - (7n * 2n * 10n ** 18n) / 10n ** 6n)
  );
  indexRate = null;
  price = 1n;
}

{
  // A buyback Mint is priced by its own hook call's HookAfterRecordPay, which
  // names the currency, with no trace. Payments nested in the hook call before
  // its Mint finish (Mint, HookAfterRecordPay) before the outer Mint parks.
  const pending = new Map<string, any>();
  const rates = new Map<string, bigint | null>();
  const pk = (k: any) => `${k.chainId}:${k.txHash}:${k.terminal}:${k.projectId}`;
  const ctx = {
    chain: { id: 1 },
    db: {
      find: async (table: unknown, k: any) => (assert.equal(table, pendingBuybackMint), pending.get(pk(k))),
      delete: async (table: unknown, k: any) => (assert.equal(table, pendingBuybackMint), pending.delete(pk(k))),
      insert: (table: unknown) => ({
        values: (v: any) => ({
          onConflictDoUpdate: async (u: any) => {
            assert.equal(table, pendingBuybackMint);
            pending.set(pk(v), { ...(pending.get(pk(v)) ?? v), ...u });
          },
        }),
      }),
      update: (table: unknown, k: { id: string }) => ({
        set: async (v: any) => (assert.equal(table, swapEvent), rates.set(k.id, v.accountingTokenUsdRate)),
      }),
    },
    // Stand-in feed: the currency in whole dollars, so the test sees which currency priced it.
    client: {
      readContract: async ({ args }: any) => BigInt(args[2]) * 10n ** 18n,
    },
  } as any;
  const hook = "0x00000000000000000000000000000000000000cc" as const;
  const call = { txHash: "0x01" as Hex, terminal, projectId: 12 };
  const mintOf = (swapEventId: string) => parkBuybackMint(ctx, { ...call, hook, swapEventId });
  const after = (currency: bigint, by: `0x${string}` = hook) => priceBuybackMint(ctx, { ...call, hook: by, currency });
  // Outer ETH call: a nested USDC pay (Mint, HookAfterRecordPay) runs first, then the outer Mint.
  await mintOf("nested");
  await after(2n);
  await mintOf("outer");
  // Another hook's HookAfterRecordPay in between does not take it.
  await after(2n, holder);
  await after(61166n);
  // Currency 2 is USD, so the nested USDC Mint is $1 with no read.
  assert.deepEqual(Object.fromEntries(rates), { nested: 10n ** 18n, outer: 61166n * 10n ** 18n });
  // Every Mint was claimed; a HookAfterRecordPay with no Mint (all swapped) prices nothing.
  assert.equal(pending.size, 0);
  await after(61166n);
  assert.equal(rates.size, 2);

  // A payment nested AFTER the outer Mint (a project token calling back) emits
  // its Pay while the Mint is parked: the Mint is abandoned, never mispriced,
  // whether the nested call mints or not.
  const quietMint = console.error;
  console.error = () => {};
  try {
    await mintOf("outer2");
    await abandonBuybackMint(ctx, call);
    await after(2n); // nested call, no Mint of its own
    await after(61166n); // outer call
    assert.equal(rates.has("outer2"), false);
    await mintOf("outer3");
    await abandonBuybackMint(ctx, call);
    await mintOf("nested3");
    await after(2n);
    await after(61166n);
    assert.equal(rates.has("outer3"), false);
    assert.equal(rates.get("nested3"), 10n ** 18n);
    assert.equal(pending.size, 0);
  } finally {
    console.error = quietMint;
  }
}

{
  // A pool's terminal token not yet accepted reads as currency 0: null, so the
  // pool caches nothing and a later swap reads it again.
  const at = (currency: number) =>
    acceptedTokenCurrency({
      context: { client: { readContract: async () => ({ token: ETH, decimals: 18, currency }) } } as any,
      projectId: 12,
      token: ETH,
    });
  assert.equal(await at(0), null);
  assert.equal(await at(61166), 61166n);
}

console.log("terminal event token checks passed");
