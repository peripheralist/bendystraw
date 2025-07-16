import { Context } from "ponder:registry";
import { JBPricesAbi } from "../../abis/JBPricesAbi";
import { ADDRESS } from "../constants/address";

// const CURRENCY_NATIVE = BigInt(61166);
// const CURRENCY_ETH = BigInt(1);
const CURRENCY_USD = BigInt(2);

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
  if (!currency) return BigInt(0);

  const usdPrice = await context.client.readContract({
    abi: JBPricesAbi,
    address: ADDRESS.jbPrices,
    functionName: "pricePerUnitOf",
    args: [projectId, currency, CURRENCY_USD, BigInt(18)],
  });

  return (amount * usdPrice) / BigInt(1e18);
}
