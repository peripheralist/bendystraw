// V6 terminal events must be priced in the token they moved, not the project's
// last-set accounting context. Mainnet V6 project 12 accepts ETH then USDC; its
// 0.0001 ETH payment was indexed as 100,000,000 USDC.
// Run: node --import tsx scripts/check-terminal-event-token.ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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
  // A symbol is read once per chain and token, then cached.
  const { context, calls } = fakeContext([contexts12[1]!], trace12);
  const again = await terminalEventToken({ event: event(payLog12), context, kind: "pay", projectId: 12n });
  assert.equal(again?.symbol, "USDC");
  assert.deepEqual(calls, ["readContract"]);
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
  assert.deepEqual(calls, ["readContract", "request", "receipt"]);
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

console.log("terminal event token checks passed");
