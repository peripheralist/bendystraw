import { Context } from "ponder:registry";
import { Banny721TokenUriResolverAbi } from "../../abis/Banny721TokenUriResolverAbi";
import { ADDRESS } from "../constants/address";
import { BANNY_RETAIL_HOOK } from "../constants/bannyHook";
import { config } from "ponder:internal";

export function getBannySvg({
  context,
  tierId,
  block,
}: {
  context: Context;
  tierId: bigint;
  block: bigint;
}) {
  const chainName = context.chain.name;

  const startBlocksLib = config.default.contracts.Banny721TokenUriResolver
    .chain as Record<typeof chainName, { startBlock: number }>;

  const startBlock = startBlocksLib[chainName].startBlock;

  if (block < startBlock) return Promise.resolve("");

  return context.client.readContract({
    abi: Banny721TokenUriResolverAbi,
    address: ADDRESS.banny721TokenUriResolver,
    functionName: "svgOf",
    args: [BANNY_RETAIL_HOOK, tierId * BigInt(1000000000), false, false],
  });
}
