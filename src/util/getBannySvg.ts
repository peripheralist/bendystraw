import { Context } from "ponder:registry";
import { Banny721TokenUriResolverAbi } from "../../abis/Banny721TokenUriResolverAbi";
import { ADDRESS } from "../constants/address";
import { BANNY_RETAIL_HOOK, BANNY_RETAIL_HOOK_5 } from "../constants/bannyHook";
import { Version } from "./getVersion";

// copied here from config, loading config in real time here breaks
const resolverStartBlocks = {
  ethereum: {
    startBlock: 23971096,
  },
  arbitrum: {
    startBlock: 408615445,
  },
  base: {
    startBlock: 39221996,
  },
  optimism: {
    startBlock: 144817281,
  },
  ethereumSepolia: {
    startBlock: 9823930,
  },
  arbitrumSepolia: {
    startBlock: 223948198,
  },
  baseSepolia: {
    startBlock: 34884744,
  },
  optimismSepolia: {
    startBlock: 36867619,
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
  version: Version;
}) {
  const resolverStartBlock = resolverStartBlocks[context.chain.name].startBlock;

  // current resolver contract is a redeploy from the original. some events may trigger this query in a block prior to the current resolver contract being deployed. in that case, we will just return empty.
  if (block < resolverStartBlock) return Promise.resolve(null);

  const address =
    version === 5
      ? ADDRESS.banny721TokenUriResolver5
      : ADDRESS.banny721TokenUriResolver;

  const hook = version === 5 ? BANNY_RETAIL_HOOK_5 : BANNY_RETAIL_HOOK;

  return context.client.readContract({
    abi: Banny721TokenUriResolverAbi,
    address,
    functionName: "svgOf",
    args: [hook, tierId * BigInt(1000000000), false, false],
  });
}
