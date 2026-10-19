import type { Context } from "ponder:registry";
import { erc20Abi, isAddressEqual, zeroAddress } from "viem";

const NATIVE_TOKEN = "0x000000000000000000000000000000000000EEEe";

// A token's symbol never changes, so one successful read per chain and token
// serves every later event.
const symbols = new Map<string, string>();

/** The token's display symbol: "ETH" for the native token, else ERC-20 `symbol()`, or null if unreadable. */
export async function tokenSymbol(context: Context, token: `0x${string}`): Promise<string | null> {
  if (isAddressEqual(token, zeroAddress) || isAddressEqual(token, NATIVE_TOKEN)) return "ETH";
  const key = `${context.chain.id}:${token.toLowerCase()}`;
  const cached = symbols.get(key);
  if (cached !== undefined) return cached;
  try {
    const symbol = await context.client.readContract({ abi: erc20Abi, address: token, functionName: "symbol" });
    symbols.set(key, symbol);
    return symbol;
  } catch {
    return null;
  }
}
