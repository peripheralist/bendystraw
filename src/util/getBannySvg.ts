import { Context } from "ponder:registry";
import { Banny721TokenUriResolverAbi } from "../../abis/Banny721TokenUriResolverAbi";
import { ADDRESS } from "../constants/address";
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
    address: ADDRESS.banny721TokenUriResolver,
    functionName: "svgOf",
    args: [BANNY_RETAIL_HOOK, tierId * BigInt(1000000000), false, false],
  });
}
