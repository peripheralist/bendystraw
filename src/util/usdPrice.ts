import { Context } from "ponder:registry";
import { JBPricesAbi } from "../../abis/JBPricesAbi";

const CURRENCY_NATIVE = BigInt(61166);
const CURRENCY_ETH = BigInt(1);
const CURRENCY_USD = BigInt(2);

export async function usdPriceForEth({
  context,
  projectId,
  ethAmount,
}: {
  context: Context;
  projectId: bigint;
  ethAmount: bigint;
}) {
  const usdPrice = await context.client.readContract({
    abi: JBPricesAbi,
    address: "0xe712d14b04f1a1fe464be930e3ea72b9b0a141d7",
    functionName: "pricePerUnitOf",
    args: [projectId, CURRENCY_NATIVE, CURRENCY_USD, BigInt(18)],
  });

  return (ethAmount * usdPrice) / BigInt(1e18);
}
