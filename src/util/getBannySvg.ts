import { Context } from "ponder:registry";
import { Banny721TokenUriResolverAbi } from "../../abis/Banny721TokenUriResolverAbi";
import { BANNY_RETAIL_HOOK } from "../constants/bannyHook";

export function getBannySvg({
  context,
  tierId,
}: {
  context: Context;
  tierId: bigint;
}) {
  return context.client.readContract({
    abi: Banny721TokenUriResolverAbi,
    address: "0xa5f8911d4cfd60a6697479f078409434424fe666",
    functionName: "svgOf",
    args: [BANNY_RETAIL_HOOK, tierId * BigInt(1000000000), false, false],
  });
}
