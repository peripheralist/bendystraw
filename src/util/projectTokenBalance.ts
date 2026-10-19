import type { Context } from "ponder:registry";
import { projectTokenBalance, projectTokenBalanceMoment } from "ponder:schema";
import { parseAbi, type Address } from "viem";
import { JBMultiTerminalAbi } from "../../abis/JBMultiTerminalAbi";
import { ADDRESS } from "../constants/address";
import type { Version } from "./getVersion";
import type { TokenContext } from "./terminalEventToken";
import { tokenSymbol } from "./tokenSymbol";
import { usdPerAccountingTokenAtBlock } from "./usdPrice";

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
// Never throws: a failed read must not cost the calling handler the rest of
// its event, and indexing never halts. The row keeps its last values (logged),
// and the next event's read, an absolute balance, repairs it.
export async function updateProjectTokenBalance(input: Parameters<typeof writeProjectTokenBalance>[0]) {
  try {
    await writeProjectTokenBalance(input);
  } catch (e) {
    console.error(
      `projectTokenBalance: not updated, kept its last values: chain ${input.context.chain.id} project ${input.projectId} token ${input.tokenContext?.token}`,
      e
    );
  }
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
}) {
  if (version !== 6 || !tokenContext) return;
  const balance = await context.client.readContract({
    abi: storeAbi,
    address: ADDRESS.jbTerminalStore6,
    functionName: "balanceOf",
    args: [ADDRESS.jbMultiTerminal6, BigInt(projectId), tokenContext.token],
  });
  const key = {
    chainId: context.chain.id,
    version,
    projectId: Number(projectId),
    token: tokenContext.token,
  };
  const row = await context.db
    .insert(projectTokenBalance)
    .values({
      ...key,
      decimals: tokenContext.decimals,
      tokenSymbol: tokenContext.symbol,
      balance,
      volume: volumeDelta,
    })
    .onConflictDoUpdate((r) => ({ balance, volume: r.volume + volumeDelta }));

  const moment = { balance: row.balance, volume: row.volume };
  await context.db
    .insert(projectTokenBalanceMoment)
    .values({
      ...key,
      ...moment,
      decimals: tokenContext.decimals,
      block: Number(block.number),
      timestamp: Number(block.timestamp),
      tokenUsdRate: await usdPerAccountingTokenAtBlock({
        context,
        version,
        projectId,
        currency: tokenContext.currency,
      }),
    })
    // Several events in one block keep the block's last balance.
    .onConflictDoUpdate(moment);
}

/** Refresh one token's row for an event that names a token but no amount we track. Never throws. */
export async function refreshProjectTokenBalance(input: {
  context: Context;
  version: Version;
  projectId: bigint;
  token: Address;
  block: { number: bigint; timestamp: bigint };
}) {
  try {
    await refreshTokenRow(input);
  } catch (e) {
    console.error(
      `projectTokenBalance: not refreshed: chain ${input.context.chain.id} project ${input.projectId} token ${input.token}`,
      e
    );
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
  if (version !== 6) return;
  const accounting = await context.client.readContract({
    abi: JBMultiTerminalAbi,
    address: ADDRESS.jbMultiTerminal6,
    functionName: "accountingContextForTokenOf",
    args: [projectId, token],
  });
  await writeProjectTokenBalance({
    context,
    version,
    projectId,
    block,
    tokenContext: {
      token,
      decimals: accounting.decimals,
      currency: BigInt(accounting.currency),
      symbol: await tokenSymbol(context, token),
    },
  });
}
