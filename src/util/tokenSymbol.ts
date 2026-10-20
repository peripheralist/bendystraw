import type { Context } from "ponder:registry";
import { projectTokenBalance } from "ponder:schema";
import { erc20Abi, isAddressEqual, zeroAddress } from "viem";

const NATIVE_TOKEN = "0x000000000000000000000000000000000000EEEe";

/** The token's display symbol: "ETH" for the native token, else ERC-20 `symbol()`, or null if unreadable or unstorable. */
export async function tokenSymbol(context: Context, token: `0x${string}`): Promise<string | null> {
  if (isAddressEqual(token, zeroAddress) || isAddressEqual(token, NATIVE_TOKEN)) return "ETH";
  // Read at the event's block (Ponder caches it), so a re-index stores the same symbol.
  let symbol: unknown;
  try {
    symbol = await context.client.readContract({ abi: erc20Abi, address: token, functionName: "symbol" });
  } catch {
    return null;
  }
  // PostgreSQL text rejects NUL, and that write fails after the handler, where
  // nothing catches it and indexing stalls. A token controls its own symbol.
  if (typeof symbol !== "string" || symbol.includes("\u0000")) {
    console.error(`tokenSymbol: unusable symbol from ${token}, stored as null`, JSON.stringify(symbol));
    return null;
  }
  return symbol;
}

/**
 * The symbol already stored on the project's row for this token, else a read.
 * Deterministic across re-indexes (the row is written in event order), and one
 * RPC call per project token instead of one per event.
 */
export async function knownTokenSymbol(
  context: Context,
  projectId: number | bigint,
  token: `0x${string}`
): Promise<string | null> {
  const row = await context.db.find(projectTokenBalance, {
    chainId: context.chain.id,
    projectId: Number(projectId),
    version: 6,
    token,
  });
  return row?.tokenSymbol ?? tokenSymbol(context, token);
}
