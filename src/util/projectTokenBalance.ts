import type { Context } from "ponder:registry";
import { projectTokenBalance, projectTokenBalanceMoment } from "ponder:schema";
import type { Version } from "./getVersion";
import type { TokenContext } from "./terminalEventToken";
import { usdPerAccountingTokenAtBlock } from "./usdPrice";

// A project's raw `balance`/`volume` add every event's amount whatever its
// token, so they mix units once the project accepts more than one token. This
// keeps one balance and volume per token instead, plus a moment per block that
// moved it. V6 only: earlier events name no token.
export async function updateProjectTokenBalance({
  context,
  version,
  projectId,
  tokenContext,
  balanceDelta,
  volumeDelta = BigInt(0),
  block,
}: {
  context: Context;
  version: Version;
  projectId: number | bigint;
  tokenContext: TokenContext | null;
  balanceDelta: bigint;
  volumeDelta?: bigint;
  block: { number: bigint; timestamp: bigint };
}) {
  if (version !== 6 || !tokenContext) return;
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
      balance: balanceDelta,
      volume: volumeDelta,
    })
    .onConflictDoUpdate((r) => ({
      balance: r.balance + balanceDelta,
      volume: r.volume + volumeDelta,
    }));

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
