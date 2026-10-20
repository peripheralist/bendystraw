import type { Context } from "ponder:registry";
import { projectTokenBalance, projectTokenBalanceMoment } from "ponder:schema";
import { parseAbi, type Address } from "viem";
import { JBMultiTerminalAbi } from "../../abis/JBMultiTerminalAbi";
import { ADDRESS } from "../constants/address";
import type { Version } from "./getVersion";
import type { TokenContext } from "./terminalEventToken";
import { knownTokenSymbol } from "./tokenSymbol";
import { usdPerAccountingTokenAtBlock, usdRate18ForToken } from "./usdPrice";

const storeAbi = parseAbi([
  "function balanceOf(address terminal, uint256 projectId, address token) view returns (uint256)",
]);

// A project's raw `balance`/`volume` add every event's amount whatever its
// token, so they mix units once the project accepts more than one token. This
// keeps one row per token instead, plus a moment per block that moved it. V6
// only: earlier events name no token.
//
// The balance is the terminal store's own balanceOf at the event's block, not
// a sum of event amounts: events state net amounts (a cash-out's reclaim after
// fees and hooks) and miss movements with no handler (refunded payouts, fee
// reverts, migrations), which a running sum would turn into phantom balances.
// Volume is payments only, so it accrues from Pay amounts.
//
// The change it read is returned so the project's own balance moves by the
// same amount (see projectBalanceDelta): a V6 project's raw balance is then
// always the sum of its token rows, with no extra read.
//
// Reads are pinned to the block, so they see its end state: the block's
// first event for a token carries the whole block's change, later ones 0.
//
// Never throws: a failed read must not cost the calling handler the rest of
// its event, and indexing never halts. The payment volume, known from the
// event, is still recorded; the balance keeps its last value (logged), the
// change is 0, and the next event's read, an absolute balance, repairs both.
export async function updateProjectTokenBalance(
  input: Parameters<typeof writeProjectTokenBalance>[0]
): Promise<BalanceChange | null> {
  if (input.version !== 6) return null;
  try {
    return await writeProjectTokenBalance(input);
  } catch (e) {
    console.error(
      `projectTokenBalance: not updated, kept its last values: chain ${input.context.chain.id} project ${input.projectId} token ${input.tokenContext?.token}`,
      e
    );
    return NO_CHANGE;
  }
}

/**
 * A V6 token balance change: raw, and in USD as the change in the row's
 * `balanceUsd` (the balance at its latest rate), so a project's USD balance is
 * always the sum of its tokens' current values, never a residue of past rates.
 */
export type BalanceChange = { delta: bigint; deltaUsd: bigint };
const NO_CHANGE: BalanceChange = { delta: BigInt(0), deltaUsd: BigInt(0) };

/**
 * How much the project's `balance`/`balanceUsd` move for an event: the store
 * change for V6 (`change`), else the event's own signed amount, as before.
 */
export function projectBalanceDelta(
  change: BalanceChange | null,
  amount: bigint,
  amountUsd: bigint
): BalanceChange {
  return change ?? { delta: amount, deltaUsd: amountUsd };
}

async function writeProjectTokenBalance({
  context,
  version,
  projectId,
  tokenContext,
  volumeDelta = BigInt(0),
  block,
}: {
  context: Context;
  version: Version;
  projectId: number | bigint;
  tokenContext: TokenContext | null;
  volumeDelta?: bigint;
  block: { number: bigint; timestamp: bigint };
}): Promise<BalanceChange> {
  if (!tokenContext) return NO_CHANGE;
  let balance: bigint | undefined;
  try {
    balance = await context.client.readContract({
      abi: storeAbi,
      address: ADDRESS.jbTerminalStore6,
      functionName: "balanceOf",
      args: [ADDRESS.jbMultiTerminal6, BigInt(projectId), tokenContext.token],
    });
  } catch (e) {
    console.error(
      `projectTokenBalance: balance not read, kept its last value: chain ${context.chain.id} project ${projectId} token ${tokenContext.token}`,
      e
    );
  }
  const key = {
    chainId: context.chain.id,
    version,
    projectId: Number(projectId),
    token: tokenContext.token,
  };
  const before = await context.db.find(projectTokenBalance, key);
  // The balance valued at this block's rate, the same one the event was valued
  // at (memoized, so no second lookup), or the token's last known rate.
  let usdRate = before?.usdRate ?? null;
  let balanceUsd = before?.balanceUsd ?? BigInt(0);
  if (balance !== undefined) {
    const rate = await usdRate18ForToken({
      context,
      version,
      projectId: BigInt(projectId),
      currency: tokenContext.currency,
      token: tokenContext.token,
      timestamp: block.timestamp,
    });
    if (rate > BigInt(0)) usdRate = rate;
    balanceUsd = (balance * (usdRate ?? BigInt(0))) / BigInt(10) ** BigInt(tokenContext.decimals);
  }
  const row = await context.db
    .insert(projectTokenBalance)
    .values({
      ...key,
      decimals: tokenContext.decimals,
      tokenSymbol: tokenContext.symbol,
      // ponytail: a first row whose read failed starts at 0 until the next read.
      balance: balance ?? BigInt(0),
      balanceUsd,
      usdRate,
      volume: volumeDelta,
    })
    .onConflictDoUpdate((r) => ({
      balance: balance ?? r.balance,
      balanceUsd,
      usdRate,
      volume: r.volume + volumeDelta,
    }));
  // No moment without a read: the next one carries this volume.
  if (balance === undefined) return NO_CHANGE;

  const tokenUsdRate = await usdPerAccountingTokenAtBlock({
    context,
    version,
    projectId,
    currency: tokenContext.currency,
  });
  const moment = { balance: row.balance, volume: row.volume };
  await context.db
    .insert(projectTokenBalanceMoment)
    .values({
      ...key,
      ...moment,
      decimals: tokenContext.decimals,
      block: Number(block.number),
      timestamp: Number(block.timestamp),
      tokenUsdRate,
    })
    // Several events in one block keep the block's last balance.
    .onConflictDoUpdate(moment);

  return {
    delta: balance - (before?.balance ?? BigInt(0)),
    deltaUsd: balanceUsd - (before?.balanceUsd ?? BigInt(0)),
  };
}

/** Refresh one token's row for an event that names a token but no amount we track. Never throws. */
export async function refreshProjectTokenBalance(input: {
  context: Context;
  version: Version;
  projectId: bigint;
  token: Address;
  block: { number: bigint; timestamp: bigint };
}): Promise<BalanceChange> {
  try {
    return await refreshTokenRow(input);
  } catch (e) {
    console.error(
      `projectTokenBalance: not refreshed: chain ${input.context.chain.id} project ${input.projectId} token ${input.token}`,
      e
    );
    return NO_CHANGE;
  }
}

async function refreshTokenRow({
  context,
  version,
  projectId,
  token,
  block,
}: {
  context: Context;
  version: Version;
  projectId: bigint;
  token: Address;
  block: { number: bigint; timestamp: bigint };
}) {
  if (version !== 6) return NO_CHANGE;
  const accounting = await context.client.readContract({
    abi: JBMultiTerminalAbi,
    address: ADDRESS.jbMultiTerminal6,
    functionName: "accountingContextForTokenOf",
    args: [projectId, token],
  });
  return writeProjectTokenBalance({
    context,
    version,
    projectId,
    block,
    tokenContext: {
      token,
      decimals: accounting.decimals,
      currency: BigInt(accounting.currency),
      symbol: await knownTokenSymbol(context, projectId, token),
    },
  });
}
