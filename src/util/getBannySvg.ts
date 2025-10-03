import { Context } from "ponder:registry";
import { Banny721TokenUriResolverAbi } from "../../abis/Banny721TokenUriResolverAbi";
import { ADDRESS } from "../constants/address";
import { BANNY_RETAIL_HOOK, BANNY_RETAIL_HOOK_5 } from "../constants/bannyHook";

// copied here from config, loading config in real time here breaks
const resolverStartBlocks = {
  ethereum: {
    startBlock: 22039034,
  },
  arbitrum: {
    startBlock: 315299005,
  },
  base: {
    startBlock: 27545253,
  },
  optimism: {
    startBlock: 133140537,
  },
  ethereumSepolia: {
    startBlock: 7894609,
  },
  arbitrumSepolia: {
    startBlock: 132035055,
  },
  baseSepolia: {
    startBlock: 23055756,
  },
  optimismSepolia: {
    startBlock: 25038630,
  },
} as const;

export function getBannySvg({
  context,
  tierId,
  block,
  version,
}: {
  context: Context;
  tierId: bigint;
  block: bigint;
  version: 4 | 5;
}) {
  const resolverStartBlock = resolverStartBlocks[context.chain.name].startBlock;

  // current resolver contract is a redeploy from the original. some events may trigger this query in a block prior to the current resolver contract being deployed. in that case, we will just return empty.
  if (block < resolverStartBlock) return Promise.resolve("");

  const address =
    version === 5
      ? ADDRESS.banny721TokenUriResolver5
      : ADDRESS.banny721TokenUriResolver;
  const hook = version === 5 ? BANNY_RETAIL_HOOK_5 : BANNY_RETAIL_HOOK;

  return context.client.readContract({
    abi: Banny721TokenUriResolverAbi,
    address:
      version == 5
        ? ADDRESS.banny721TokenUriResolver5
        : ADDRESS.banny721TokenUriResolver,
    functionName: "svgOf",
    args: [hook, tierId * BigInt(1000000000), false, false],
  });
}
