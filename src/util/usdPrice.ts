import { Context } from "ponder:registry";
import { JBPricesAbi } from "../../abis/JBPricesAbi";
import { ADDRESS } from "../constants/address";

const CURRENCY_NATIVE = BigInt(61166);
const CURRENCY_ETH = BigInt(1);
const CURRENCY_USD = BigInt(3); // we never deployed the 61166 <==> 3 price feed since we never moved forward with allowing USD denominated payouts for ETH projects in v4, so use USDC for conversions

const CURRENCY_USDC = BigInt(2);

const STABLES = new Set([
  BigInt(281666209), // ??
  BigInt(3181390099), // ??
  CURRENCY_USDC,
]);

export async function usdPriceForEth({
  context,
  projectId,
  amount,
  currency,
}: {
  context: Context;
  projectId: bigint;
  amount: bigint;
  currency: bigint | null;
}) {
  if (
    !currency ||
    (currency !== CURRENCY_ETH && currency !== CURRENCY_NATIVE) // TODO: need price conversion for non-ETH
  ) {
    return BigInt(0);
  }

  if (STABLES.has(currency)) return amount;

  try {
    const usdPrice = await context.client.readContract({
      abi: JBPricesAbi,
      address: ADDRESS.jbPrices,
      functionName: "pricePerUnitOf",
      args: [projectId, currency, CURRENCY_USDC, BigInt(18)],
    });

    return (amount * usdPrice) / BigInt(1e18);
  } catch (e) {
    console.error(
      `Error: usdPriceForEth failed for projectId: ${projectId}, currency: ${currency.toString()} - ${
        (e as Error).message
      }`
    );

    return BigInt(0);
  }
}
