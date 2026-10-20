import axios from "axios";
import { Context } from "ponder:registry";
import { Address, zeroAddress } from "viem";
import { JBMultiTerminalAbi } from "../../abis/JBMultiTerminalAbi";
import { JBPricesAbi } from "../../abis/JBPricesAbi";
import { addressForVersion, Version } from "./getVersion";

const priceIndexUrl = process.env.PRICES_API_URL;

const CURRENCY_NATIVE = BigInt(61166);
// const CURRENCY_ETH = BigInt(1);
const CURRENCY_USD = BigInt(2);
const NATIVE_TOKEN = "0x000000000000000000000000000000000000EEEe";

/**
 * The JB currency a V6 project's terminal accounts `token` in, from its
 * accounting context: usually the token address's low 32 bits, but a project
 * may set another (USDC as USD, 2). Null when the terminal does not accept the
 * token. A buyback pool stores the native token as the zero address.
 */
export async function acceptedTokenCurrency({
  context,
  projectId,
  token,
}: {
  context: Context;
  projectId: bigint | number;
  token: Address;
}): Promise<bigint | null> {
  try {
    const accounting = await context.client.readContract({
      abi: JBMultiTerminalAbi,
      address: addressForVersion("jbMultiTerminal", 6),
      functionName: "accountingContextForTokenOf",
      args: [BigInt(projectId), token === zeroAddress ? NATIVE_TOKEN : token],
    });
    return BigInt(accounting.currency);
  } catch {
    return null;
  }
}

// const STABLES = new Set(
//   [
//     "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC ETH
//     "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // USDC ARB
//     "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", // USDC OP
//     "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC BASE
//   ].map((c) => c.toLowerCase()) as Address[]
// );

const indexPrices = new Map<string, Promise<number>>();

/**
 * USD per ONE WHOLE accounting token as an 18-decimal fixed point, for valuing
 * an amount. 0n when the token cannot be valued (never null: amount valuation
 * treats "unpriceable" as a zero contribution, matching the *Usd counters).
 *
 * Resolution order:
 * 1. USD-denominated contexts need no feed: the rate IS 1.
 * 2. The project's on-chain JBPrices feed at THIS block — works for the native
 *    token and any registered pair (this is the same read that produces
 *    suckerGroupMoment.accountingTokenUsdRate).
 * 3. The external price index by token address, when configured.
 */
export async function usdRate18ForToken({
  context,
  version,
  projectId,
  currency,
  token,
  timestamp,
}: {
  context: Context;
  version: Version;
  projectId: bigint;
  currency: bigint | null;
  token: Address | null;
  timestamp: number | bigint;
}): Promise<bigint> {
  if (!currency) return BigInt(0);

  const onchain = await usdPerAccountingTokenAtBlock({
    context,
    version,
    projectId,
    currency,
  });
  if (onchain !== null) return onchain;

  if (priceIndexUrl && token && token !== zeroAddress) {
    try {
      const url = `${priceIndexUrl}?token=${token}&timestamp=${timestamp}&chainId=${context.chain.id}`;
      // An event and its balance update value the same token at the same
      // block: one request between them.
      let pending = indexPrices.get(url);
      if (!pending) {
        // ponytail: forget everything once it grows; only same-block reuse matters.
        if (indexPrices.size > 1000) indexPrices.clear();
        // A failure is kept too: the next block (a new URL) retries.
        pending = axios.get<{ priceUsd: number }>(url).then((res) => res.data.priceUsd);
        indexPrices.set(url, pending);
      }
      const _price = await pending;

      if (!isNaN(_price) && _price > 0) {
        // Keep 8 decimals of price precision. The previous integer math
        // (round(p * 1e10) / 1e10 in bigint) floored every sub-$1 price to
        // ZERO, which silently un-valued stablecoin contexts.
        return BigInt(Math.round(_price * 1e8)) * BigInt(1e10);
      }
    } catch (e) {
      console.error(
        `Error: usdRate18ForToken index lookup failed for projectId: ${projectId}, chainId: ${
          context.chain.id
        }, version: ${version} - ${(e as Error).message}`
      );
    }
  }

  return BigInt(0);
}

/**
 * Values a token amount in USD as an 18-decimal fixed point, REGARDLESS of the
 * token's own decimals.
 *
 * The previous implementation returned `amount * price`, which was only
 * 18-decimal USD for 18-decimal tokens: a 6-decimal USDC amount came back
 * scaled by 1e6 — indistinguishable from zero — so USDC-denominated volume,
 * payouts, and cash outs accrued no USD at all.
 *
 * @param amount Amount of token to convert, in the token's own decimals
 * @param decimals The accounting context's decimals (null falls back to 18)
 */
export async function usdPriceForToken({
  context,
  version,
  projectId,
  amount,
  currency,
  token,
  decimals,
  timestamp,
}: {
  context: Context;
  version: Version;
  projectId: bigint;
  amount: bigint;
  currency: bigint | null;
  token: Address | null;
  decimals: number | null;
  timestamp: number | bigint;
}) {
  if (!currency || !token || token === zeroAddress) return BigInt(0);

  try {
    const rate = await usdRate18ForToken({
      context,
      version,
      projectId,
      currency,
      token,
      timestamp,
    });
    if (rate <= BigInt(0)) return BigInt(0);

    return (amount * rate) / BigInt(10) ** BigInt(decimals ?? 18);
  } catch (e) {
    console.error(
      `Error: usdPriceForToken failed for projectId: ${projectId}, chainId: ${
        context.chain.id
      }, version: ${version}, currency: ${currency.toString()} - ${
        (e as Error).message
      }`
    );

    return BigInt(0);
  }
}

/**
 * USD per ONE WHOLE accounting token, as an 18-decimal fixed point, read from the on-chain
 * feed AT THE CURRENT EVENT'S BLOCK.
 *
 * This is the historical exchange rate that no live read can recover after the fact. Ponder
 * pins `context.client` to the block being indexed, so `JBPrices` answers with the rate that
 * was in force when the swap settled or the balance moved — the same rate `JBTerminalStore`
 * itself used, not a present-day stand-in.
 *
 * Recorded alongside price-bearing rows so a chart can put accounting-token values (pool
 * price, cash-out floor) on a USD axis WITHOUT restating history. Clients previously had to
 * derive this from `payEvent.amount / payEvent.amountUsd`, which fails outright for projects
 * whose payments route through the buyback pool: those rows carry `amount: 0`.
 *
 * Distinct from `usdPriceForToken` above, which values an AMOUNT and returns the token's own
 * decimals. This returns a RATE and is always 18-decimal.
 *
 * Null when no feed bridges the pair — never a zero, which a caller would read as free.
 */
export async function usdPerAccountingTokenAtBlock({
  context,
  version,
  projectId,
  currency,
}: {
  context: Context;
  version: Version;
  projectId: bigint | number;
  currency: bigint | null;
}) {
  if (!currency) return null;

  // USD IS the unit here, so the pair needs no feed and no RPC call.
  if (currency === CURRENCY_USD) return BigInt(1e18);

  // V4's feed was registered with the pair inverted; see usdPriceForToken.
  const pricingCurrency = version === 4 ? currency : CURRENCY_USD;
  const unitCurrency = version === 4 ? CURRENCY_USD : currency;

  try {
    const rate = await context.client.readContract({
      abi: JBPricesAbi,
      address: addressForVersion("jbPrices", version),
      functionName: "pricePerUnitOf",
      args: [BigInt(projectId), pricingCurrency, unitCurrency, BigInt(18)],
    });
    return rate > BigInt(0) ? rate : null;
  } catch (e) {
    // A project with no feed for its accounting token is normal, not an error state.
    return null;
  }
}
