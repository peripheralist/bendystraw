import type { Context } from "ponder:registry";
import { projectTokenBalance } from "ponder:schema";
import type { Version } from "./getVersion";
import type { TokenContext } from "./terminalEventToken";

// A project's raw `balance`/`volume` add every event's amount whatever its
// token, so they mix units once the project accepts more than one token. This
// keeps one balance and volume per token instead. V6 only: earlier events name
// no token.
export async function updateProjectTokenBalance({
  context,
  version,
  projectId,
  tokenContext,
  balanceDelta,
  volumeDelta = BigInt(0),
}: {
  context: Context;
  version: Version;
  projectId: number | bigint;
  tokenContext: Pick<TokenContext, "token" | "decimals" | "symbol"> | null;
  balanceDelta: bigint;
  volumeDelta?: bigint;
}) {
  if (version !== 6 || !tokenContext) return;
  await context.db
    .insert(projectTokenBalance)
    .values({
      chainId: context.chain.id,
      version,
      projectId: Number(projectId),
      token: tokenContext.token,
      decimals: tokenContext.decimals,
      tokenSymbol: tokenContext.symbol,
      balance: balanceDelta,
      volume: volumeDelta,
    })
    .onConflictDoUpdate((row) => ({
      balance: row.balance + balanceDelta,
      volume: row.volume + volumeDelta,
    }));
}
