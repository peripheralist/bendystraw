import axios from "axios";
import { Context } from "ponder:registry";
import { Address, zeroAddress } from "viem";
import { JBPricesAbi } from "../../abis/JBPricesAbi";
import { addressForVersion, Version } from "./getVersion";

const priceIndexUrl = process.env.PRICES_API_URL;

const CURRENCY_NATIVE = BigInt(61166);
// const CURRENCY_ETH = BigInt(1);
const CURRENCY_USD = BigInt(2);

// const STABLES = new Set(
//   [
//     "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC ETH
//     "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // USDC ARB
//     "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", // USDC OP
//     "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC BASE
//   ].map((c) => c.toLowerCase()) as Address[]
// );

/**
 * Gets usd price of a token amount
 * @param context
 * @param version
 * @param projectId
 * @param amount Amount of token to convert
 * @param currency Currency of token to convert, defined by AccountingContext (usually native token)
 * @returns
 */
export async function usdPriceForToken({
  context,
  version,
  projectId,
  amount,
  currency,
  token,
  timestamp,
}: {
  context: Context;
  version: Version;
  projectId: bigint;
  amount: bigint;
  currency: bigint | null;
  token: Address | null;
  timestamp: number | bigint;
}) {
  if (!currency || !token || token === zeroAddress) return BigInt(0);

  // // just assume stables == 1 usd
  // if (STABLES.has(token)) return amount;

  let price = BigInt(0);

  try {
    if (currency === CURRENCY_NATIVE) {
      // IF NATIVE CURRENCY use on-chain price feed for native token conversion

      let pricingCurrency = CURRENCY_USD;
      let unitCurrency = CURRENCY_NATIVE;

      if (version === 4) {
        // price feed for v4 is inverted by mistake
        pricingCurrency = CURRENCY_NATIVE;
        unitCurrency = CURRENCY_USD;
      }

      // fetch price from on-chain feed
      const usdPriceWei = await context.client.readContract({
        abi: JBPricesAbi,
        address: addressForVersion("jbPrices", version),
        functionName: "pricePerUnitOf",
        args: [projectId, pricingCurrency, unitCurrency, BigInt(18)],
      });

      price = usdPriceWei / BigInt(1e18);
    } else if (priceIndexUrl) {
      // IF NON-NATIVE CURRENCY fetch price from index

      const res = await axios.get<{ priceUsd: number }>(
        `${priceIndexUrl}?token=${token}&timestamp=${timestamp}&chainId=${context.chain.id}`
      );

      const _price = res.data.priceUsd;

      if (!isNaN(_price)) {
        price = BigInt(Math.round(_price * 1e10)) / BigInt(1e10);
      }
    }

    return amount * price;
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
