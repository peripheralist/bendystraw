import type { Context } from "ponder:registry";
import { decodeFunctionData, isAddressEqual, parseAbi, type Hex } from "viem";
import { JBMultiTerminalAbi } from "../../abis/JBMultiTerminalAbi";

// Terminal events (Pay, AddToBalance, CashOutTokens, SendPayouts,
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
};

// What the event says about its record call. Omitted fields are not matched.
export type RecordMatch = {
  projectId: bigint;
  amount?: bigint;
  holder?: `0x${string}`;
  cashOutCount?: bigint;
};

export type CallFrame = {
  from: string;
  to?: string;
  input: Hex;
  error?: string;
  calls?: CallFrame[];
};

// V4/V5 stores take an accounting context where V6 takes a token. Each
// selector here is checked against the deployed stores' bytecode.
const storeAbi = parseAbi([
  "struct JBTokenAmount { address token; uint8 decimals; uint32 currency; uint256 value; }",
  "struct JBAccountingContext { address token; uint8 decimals; uint32 currency; }",
  "function recordPaymentFrom(address payer, JBTokenAmount amount, uint256 projectId, address beneficiary, bytes metadata)",
  "function recordAddedBalanceFor(uint256 projectId, address token, uint256 amount)",
  "function recordCashOutFor(address holder, uint256 projectId, uint256 cashOutCount, address tokenToReclaim, bool beneficiaryIsFeeless, bytes metadata)",
  "function recordCashOutFor(address holder, uint256 projectId, uint256 cashOutCount, JBAccountingContext accountingContext, JBAccountingContext[] balanceAccountingContexts, bytes metadata)",
  "function recordPayoutFor(uint256 projectId, address token, uint256 amount, uint256 currency)",
  "function recordPayoutFor(uint256 projectId, JBAccountingContext accountingContext, uint256 amount, uint256 currency)",
  "function recordUsedAllowanceOf(uint256 projectId, address token, uint256 amount, uint256 currency)",
  "function recordUsedAllowanceOf(uint256 projectId, JBAccountingContext accountingContext, uint256 amount, uint256 currency)",
]);

const functionForKind = {
  pay: "recordPaymentFrom",
  addToBalance: "recordAddedBalanceFor",
  cashOut: "recordCashOutFor",
  payout: "recordPayoutFor",
  useAllowance: "recordUsedAllowanceOf",
} as const;

type Record_ = {
  token: `0x${string}`;
  projectId: bigint;
  amount?: bigint;
  holder?: `0x${string}`;
  cashOutCount?: bigint;
};

const tokenOf = (x: `0x${string}` | { token: `0x${string}` }) =>
  typeof x === "string" ? x : x.token;

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
      return { token: a[1].token, amount: a[1].value, projectId: a[2] };
    case "recordAddedBalanceFor":
      return { projectId: a[0], token: a[1], amount: a[2] };
    case "recordCashOutFor":
      return { holder: a[0], projectId: a[1], cashOutCount: a[2], token: tokenOf(a[3]) };
    default:
      return { projectId: a[0], token: tokenOf(a[1]), amount: a[2] };
  }
}

function matches(record: Record_, match: RecordMatch) {
  if (record.projectId !== match.projectId) return false;
  if (match.amount !== undefined && record.amount !== match.amount) return false;
  if (match.cashOutCount !== undefined && record.cashOutCount !== match.cashOutCount) return false;
  if (match.holder && (!record.holder || !isAddressEqual(record.holder, match.holder))) return false;
  return true;
}

/**
 * The token the terminal recorded for an event, from the transaction's
 * callTracer trace. Only successful calls from `terminal` count. Calls must
 * match every field in `match`; when none do, calls matching the project alone
 * are used. Null unless every candidate names the same token.
 */
export function tokenFromTrace({
  trace,
  terminal,
  kind,
  match,
}: {
  trace: CallFrame;
  terminal: `0x${string}`;
  kind: TerminalEventKind;
  match: RecordMatch;
}): `0x${string}` | null {
  const records: Record_[] = [];
  const walk = (frame: CallFrame) => {
    if (frame.error) return; // reverted along with everything below it
    if (isAddressEqual(frame.from as `0x${string}`, terminal)) {
      const record = decodeRecord(kind, frame.input);
      if (record) records.push(record);
    }
    frame.calls?.forEach(walk);
  };
  walk(trace);

  const exact = records.filter((r) => matches(r, match));
  const candidates = exact.length
    ? exact
    : records.filter((r) => r.projectId === match.projectId);

  const tokens = new Set(candidates.map((r) => r.token.toLowerCase()));
  return tokens.size === 1 ? candidates[0]!.token : null;
}

/**
 * The accounting context of the token a terminal event moved, or null when it
 * cannot be determined. Null must never be priced: callers value it at 0 USD.
 *
 * A project with one accounting context on the terminal can only have moved
 * that token. Otherwise the transaction is traced (debug_traceTransaction,
 * which Ponder caches), so the RPC must support the debug namespace.
 */
export async function terminalEventToken({
  event,
  context,
  kind,
  match,
}: {
  event: { log: { address: `0x${string}` }; transaction: { hash: Hex } };
  context: Context;
  kind: TerminalEventKind;
  match: RecordMatch;
}): Promise<TokenContext | null> {
  const terminal = event.log.address;
  const contexts = await context.client.readContract({
    abi: JBMultiTerminalAbi,
    address: terminal,
    functionName: "accountingContextsOf",
    args: [match.projectId],
  });

  const toContext = (c: (typeof contexts)[number]): TokenContext => ({
    token: c.token,
    decimals: c.decimals,
    currency: BigInt(c.currency),
  });

  if (contexts.length === 1) return toContext(contexts[0]!);

  // A failed trace leaves the token unknown rather than failing the handler,
  // which would drop the event itself.
  let token: `0x${string}` | null = null;
  try {
    const trace = (await context.client.request({
      method: "debug_traceTransaction",
      params: [event.transaction.hash, { tracer: "callTracer" }],
    } as any)) as CallFrame;
    token = tokenFromTrace({ trace, terminal, kind, match });
  } catch (e) {
    console.error("terminalEventToken: debug_traceTransaction failed", e);
  }

  const found = token && contexts.find((c) => isAddressEqual(c.token, token));

  if (!found) {
    console.warn("terminalEventToken: unresolved token", {
      chain: context.chain.id,
      tx: event.transaction.hash,
      kind,
      projectId: match.projectId,
      token,
    });
    return null;
  }

  return toContext(found);
}
