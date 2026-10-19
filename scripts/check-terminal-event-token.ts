// Terminal events must be priced in the token they moved, not the project's
// last-set accounting context. Mainnet V6 project 12 accepts ETH then USDC; its
// 0.0001 ETH payment was indexed as 100,000,000 USDC.
// Run: node --import tsx scripts/check-terminal-event-token.ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { encodeFunctionData, parseAbi } from "viem";
import {
  terminalEventToken,
  tokenFromTrace,
  type CallFrame,
} from "../src/util/terminalEventToken";

const terminal = "0x130f5dd2bd8805443cf41755253d778a75a67f53" as const;
const store = "0x7497ae014a60561925b51c0a3b4ade7460b9927c";
const ETH = "0x000000000000000000000000000000000000EEEe" as const;
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as const;
const holder = "0x00000000000000000000000000000000000000aa" as const;

const abi = parseAbi([
  "struct JBTokenAmount { address token; uint8 decimals; uint32 currency; uint256 value; }",
  "struct JBAccountingContext { address token; uint8 decimals; uint32 currency; }",
  "function recordPaymentFrom(address payer, JBTokenAmount amount, uint256 projectId, address beneficiary, bytes metadata)",
  "function recordCashOutFor(address holder, uint256 projectId, uint256 cashOutCount, address tokenToReclaim, bool beneficiaryIsFeeless, bytes metadata)",
  "function recordPayoutFor(uint256 projectId, JBAccountingContext accountingContext, uint256 amount, uint256 currency)",
]);

const pay = (token: `0x${string}`, value: bigint, projectId = 12n): CallFrame => ({
  from: terminal,
  to: store,
  input: encodeFunctionData({
    abi,
    functionName: "recordPaymentFrom",
    args: [holder, { token, decimals: 18, currency: 1, value }, projectId, holder, "0x"],
  }),
});
const root = (...calls: CallFrame[]): CallFrame => ({
  from: holder,
  to: terminal,
  input: "0x",
  calls,
});

const trace12 = JSON.parse(
  readFileSync(new URL("./fixtures/eth-12-pay-trace.json", import.meta.url), "utf8")
) as CallFrame;

// The real project 12 payment records ETH.
assert.equal(
  tokenFromTrace({ trace: trace12, terminal, kind: "pay", match: { projectId: 12n, amount: 10n ** 14n } }),
  ETH
);
// Another project in the same trace has no record call.
assert.equal(
  tokenFromTrace({ trace: trace12, terminal, kind: "pay", match: { projectId: 13n, amount: 10n ** 14n } }),
  null
);

// Two payments to one project in one tx resolve by amount.
const mixed = root(pay(ETH, 5n), pay(USDC, 7n));
assert.equal(tokenFromTrace({ trace: mixed, terminal, kind: "pay", match: { projectId: 12n, amount: 5n } }), ETH);
assert.equal(tokenFromTrace({ trace: mixed, terminal, kind: "pay", match: { projectId: 12n, amount: 7n } }), USDC);
// Same amount, different tokens: unknown, never a guess.
assert.equal(
  tokenFromTrace({ trace: root(pay(ETH, 5n), pay(USDC, 5n)), terminal, kind: "pay", match: { projectId: 12n, amount: 5n } }),
  null
);
// Reverted frames and other callers do not count.
assert.equal(
  tokenFromTrace({
    trace: root({ ...pay(USDC, 5n), error: "execution reverted" }, { ...pay(USDC, 5n), from: holder }, pay(ETH, 5n)),
    terminal,
    kind: "pay",
    match: { projectId: 12n, amount: 5n },
  }),
  ETH
);
// No amount match falls back to the project's record calls, if they agree.
assert.equal(tokenFromTrace({ trace: root(pay(USDC, 9n)), terminal, kind: "pay", match: { projectId: 12n, amount: 1n } }), USDC);

// Cash outs match holder and count; V4/V5 payouts carry an accounting context.
const cashOut = root({
  from: terminal,
  input: encodeFunctionData({
    abi,
    functionName: "recordCashOutFor",
    args: [holder, 12n, 3n, USDC, false, "0x"],
  }),
});
assert.equal(
  tokenFromTrace({ trace: cashOut, terminal, kind: "cashOut", match: { projectId: 12n, holder, cashOutCount: 3n } }),
  USDC
);
assert.equal(tokenFromTrace({ trace: cashOut, terminal, kind: "pay", match: { projectId: 12n } }), null);
const payoutV4 = root({
  from: terminal,
  input: encodeFunctionData({
    abi,
    functionName: "recordPayoutFor",
    args: [12n, { token: ETH, decimals: 18, currency: 1 }, 4n, 1n],
  }),
});
assert.equal(tokenFromTrace({ trace: payoutV4, terminal, kind: "payout", match: { projectId: 12n, amount: 4n } }), ETH);

// terminalEventToken: one context needs no trace; several use it.
const contexts12 = [
  { token: ETH, decimals: 18, currency: 61166 },
  { token: USDC, decimals: 6, currency: 906423112 },
];
const fakeContext = (contexts: typeof contexts12, trace: CallFrame) => {
  const calls: string[] = [];
  return {
    calls,
    context: {
      chain: { id: 1 },
      client: {
        readContract: async () => (calls.push("readContract"), contexts),
        request: async () => (calls.push("request"), trace),
      },
    } as any,
  };
};
const event = {
  log: { address: terminal },
  transaction: { hash: "0x213463399972bb54d08c2bce5c1c8e0d710d09fac3fc0640971a2fcf0e9da0cc" as const },
};

{
  const { context, calls } = fakeContext(contexts12, trace12);
  assert.deepEqual(
    await terminalEventToken({ event, context, kind: "pay", match: { projectId: 12n, amount: 10n ** 14n } }),
    { token: ETH, decimals: 18, currency: 61166n }
  );
  assert.deepEqual(calls, ["readContract", "request"]);
}
{
  const { context, calls } = fakeContext([contexts12[1]!], trace12);
  assert.deepEqual(
    await terminalEventToken({ event, context, kind: "pay", match: { projectId: 12n, amount: 1n } }),
    { token: USDC, decimals: 6, currency: 906423112n }
  );
  assert.deepEqual(calls, ["readContract"]);
}
{
  const { context } = fakeContext(contexts12, root());
  const warn = console.warn;
  console.warn = () => {};
  try {
    assert.equal(await terminalEventToken({ event, context, kind: "pay", match: { projectId: 12n } }), null);
    // An RPC without the debug namespace leaves the token unknown.
    const error = console.error;
    console.error = () => {};
    try {
      const noTrace = fakeContext(contexts12, trace12).context;
      noTrace.client.request = async () => {
        throw new Error("method not found");
      };
      assert.equal(await terminalEventToken({ event, context: noTrace, kind: "pay", match: { projectId: 12n } }), null);
    } finally {
      console.error = error;
    }
  } finally {
    console.warn = warn;
  }
}

console.log("terminal event token checks passed");
