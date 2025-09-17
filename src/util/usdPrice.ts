import { Context } from "ponder:registry";
import { JBPricesAbi } from "../../abis/JBPricesAbi";
import { ADDRESS } from "../constants/address";

const CURRENCY_NATIVE = BigInt(61166);
const CURRENCY_ETH = BigInt(1);
const CURRENCY_USD = BigInt(2);

// const STABLES = new Set([
//   BigInt(281666209), // ??
//   BigInt(3181390099), // ??
// ]);

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
}: {
  context: Context;
  version: 4 | 5;
  projectId: bigint;
  amount: bigint;
  currency: bigint | null;
}) {
  if (!currency || currency !== CURRENCY_NATIVE) {
    // for now, only convert from native currency
    // currency should usually be native
    return BigInt(0);
  }

  try {
    let pricingCurrency = CURRENCY_USD;
    let unitCurrency = currency;

    if (version === 4) {
      // price feed for v4 is inverted by mistake
      pricingCurrency = currency;
      unitCurrency = CURRENCY_USD;
    }

    const usdPrice = await context.client.readContract({
      abi: JBPricesAbi,
      address: ADDRESS.jbPrices,
      functionName: "pricePerUnitOf",
      args: [projectId, pricingCurrency, unitCurrency, BigInt(18)],
    });

    return (amount * usdPrice) / BigInt(1e18);
  } catch (e) {
    console.error(
      `Error: usdPriceForToken failed for projectId: ${projectId}, version: ${version}, unitCurrency: ${currency.toString()} - ${
        (e as Error).message
      }`
    );

    return BigInt(0);
  }
}
