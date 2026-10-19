import type { Context } from "ponder:registry";
import { decodeFunctionData, isAddressEqual, parseAbi, type Hex } from "viem";
import { JBMultiTerminalAbi } from "../../abis/JBMultiTerminalAbi";
import { tokenSymbol } from "./tokenSymbol";

// V6 terminal events (Pay, AddToBalance, CashOutTokens, SendPayouts,
// SendPayoutToSplit, UseAllowance) carry no token. A project can accept
// several, so the project's last-set accounting context says nothing about
// which one an event moved. The terminal names the token in its record call to
// its JBTerminalStore; that call is read from the transaction's call trace.

export type TerminalEventKind =
  | "pay"
  | "addToBalance"
  | "cashOut"
  | "payout"
  | "useAllowance";

export type TokenContext = {
  token: `0x${string}`;
  decimals: number;
  currency: bigint;
  // Null when the token does not answer `symbol()`.
  symbol: string | null;
};

export type TraceLog = {
  address: string;
  topics: Hex[];
  data: Hex;
  // Index into the frame's `calls` the log was emitted before (hex or number).
  position?: Hex | number;
};

export type CallFrame = {
  type?: string;
  from: string;
  to?: string;
  input: Hex;
  error?: string;
  calls?: CallFrame[];
  logs?: TraceLog[];
};

// A trace that cannot pair an event with its record call.
export class TerminalEventTokenError extends Error {}

// V6 JBTerminalStore record calls; each names the token.
const storeAbi = parseAbi([
  "struct JBTokenAmount { address token; uint8 decimals; uint32 currency; uint256 value; }",
  "function recordPaymentFrom(address payer, JBTokenAmount amount, uint256 projectId, address beneficiary, bytes metadata)",
  "function recordAddedBalanceFor(uint256 projectId, address token, uint256 amount)",
  "function recordCashOutFor(address holder, uint256 projectId, uint256 cashOutCount, address tokenToReclaim, bool beneficiaryIsFeeless, bytes metadata)",
  "function recordPayoutFor(uint256 projectId, address token, uint256 amount, uint256 currency)",
  "function recordUsedAllowanceOf(uint256 projectId, address token, uint256 amount, uint256 currency)",
]);

const functionForKind = {
  pay: "recordPaymentFrom",
  addToBalance: "recordAddedBalanceFor",
  cashOut: "recordCashOutFor",
  payout: "recordPayoutFor",
  useAllowance: "recordUsedAllowanceOf",
} as const;

// JBMultiTerminal emits AddToBalance and then records the balance in the same
// frame; every other kind records first and emits after.
const emitsBeforeRecord = (kind: TerminalEventKind) => kind === "addToBalance";

type Record_ = { token: `0x${string}`; projectId: bigint };

function decodeRecord(kind: TerminalEventKind, input: Hex): Record_ | null {
  let decoded;
  try {
    decoded = decodeFunctionData({ abi: storeAbi, data: input });
  } catch {
    return null;
  }
  if (decoded.functionName !== functionForKind[kind]) return null;

  const a = decoded.args as readonly any[];
  switch (decoded.functionName) {
    case "recordPaymentFrom":
      return { token: a[1].token, projectId: a[2] };
    case "recordCashOutFor":
      return { token: a[3], projectId: a[1] };
    default:
      return { token: a[1], projectId: a[0] };
  }
}

const sameLog = (a: { address: string; topics: readonly Hex[]; data: Hex }, b: TargetLog) =>
  isAddressEqual(a.address as `0x${string}`, b.address) &&
  a.data.toLowerCase() === b.data.toLowerCase() &&
  a.topics.length === b.topics.length &&
  a.topics.every((t, i) => t.toLowerCase() === b.topics[i]!.toLowerCase());

export type TargetLog = { address: `0x${string}`; topics: readonly Hex[]; data: Hex };

/**
 * For each copy of `log` in a callTracer trace (withLog), in emission order:
 * the token of the `kind` record call for `projectId` that the terminal made
 * for it, or null if there is none. For record-then-emit kinds that is the
 * latest such call before the log on its call path; for AddToBalance it is the
 * next such call after the log in the same frame. Reverted frames are skipped,
 * as their logs are not in the receipt. A delegatecall runs in the caller's
 * context, so its records carry back out.
 */
export function tokensForLog({
  trace,
  kind,
  projectId,
  log,
}: {
  trace: CallFrame;
  kind: TerminalEventKind;
  projectId: bigint;
  log: TargetLog;
}): (`0x${string}` | null)[] {
  const found: { token: `0x${string}` | null }[] = [];
  const walk = (frame: CallFrame, recorded: `0x${string}` | null) => {
    const calls = frame.calls ?? [];
    const logs = frame.logs ?? [];
    const waiting: { token: `0x${string}` | null }[] = [];
    for (let i = 0; i <= calls.length; i++) {
      for (const l of logs) {
        if (l.position === undefined) {
          throw new TerminalEventTokenError("trace logs carry no position");
        }
        if (Number(l.position) !== i || !sameLog(l, log)) continue;
        const entry = { token: emitsBeforeRecord(kind) ? null : recorded };
        found.push(entry);
        if (emitsBeforeRecord(kind)) waiting.push(entry);
      }
      const call = calls[i];
      if (!call || call.error) continue;
      const record = isAddressEqual(call.from as `0x${string}`, log.address)
        ? decodeRecord(kind, call.input)
        : null;
      if (record) {
        if (record.projectId !== projectId) continue;
        recorded = record.token;
        for (const entry of waiting.splice(0)) entry.token = record.token;
      } else {
        const inner = walk(call, recorded);
        if (call.type === "DELEGATECALL") recorded = inner;
      }
    }
    return recorded;
  };
  if (!trace.error) walk(trace, null);
  return found.map((f) => f.token);
}

/**
 * The accounting context of the token a V6 terminal event moved, or null when
 * it cannot be determined. Null must never fall back to the project's context:
 * callers store no token and value the event at 0 USD, which this logs as an
 * error. Ponder's RPC client retries the trace first.
 *
 * A project with one accounting context on the terminal can only have moved
 * that token. Otherwise the transaction is traced (debug_traceTransaction with
 * callTracer withLog, which Ponder caches) and the event's log is paired with
 * the record call before it.
 */
export async function terminalEventToken({
  event,
  context,
  kind,
  projectId,
}: {
  event: {
    log: { address: `0x${string}`; topics: readonly Hex[]; data: Hex; logIndex: number };
    transaction: { hash: Hex };
  };
  context: Context;
  kind: TerminalEventKind;
  projectId: bigint;
}): Promise<TokenContext | null> {
  const terminal = event.log.address;
  const where = `chain ${context.chain.id} tx ${event.transaction.hash} log ${event.log.logIndex} (${kind}, project ${projectId})`;
  try {
    const contexts = await context.client.readContract({
      abi: JBMultiTerminalAbi,
      address: terminal,
      functionName: "accountingContextsOf",
      args: [projectId],
    });
    const toContext = async (c: (typeof contexts)[number]): Promise<TokenContext> => ({
      token: c.token,
      decimals: c.decimals,
      currency: BigInt(c.currency),
      symbol: await tokenSymbol(context, c.token),
    });

    if (contexts.length === 1) return toContext(contexts[0]!);

    const trace = (await context.client.request({
      method: "debug_traceTransaction",
      params: [event.transaction.hash, { tracer: "callTracer", tracerConfig: { withLog: true } }],
    } as any)) as CallFrame;
    const tokens = tokensForLog({ trace, kind, projectId, log: event.log });

    let token = tokens[0];
    if (tokens.length > 1) {
      // Identical logs: pick this one by its order among them in the receipt.
      const receipt = await context.client.getTransactionReceipt({ hash: event.transaction.hash });
      const same = receipt.logs.filter((l) => sameLog(l, event.log));
      if (same.length !== tokens.length) {
        throw new TerminalEventTokenError(`trace has ${tokens.length} copies of the log, receipt ${same.length}`);
      }
      token = tokens[same.findIndex((l) => l.logIndex === event.log.logIndex)];
    }

    const found = token && contexts.find((c) => isAddressEqual(c.token, token));
    if (!found) {
      throw new TerminalEventTokenError(`no accounting context for recorded token ${token ?? "none"}`);
    }
    return toContext(found);
  } catch (e) {
    console.error(`terminalEventToken: unresolved, stored without a token at 0 USD: ${where}`, e);
    return null;
  }
}
