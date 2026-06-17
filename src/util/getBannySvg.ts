import { Context } from "ponder:registry";
import { Banny721TokenUriResolverAbi } from "../../abis/Banny721TokenUriResolverAbi";
import { ADDRESS } from "../constants/address";
import { bannyRetailHookForVersion } from "../constants/bannyHook";
import { Version } from "./getVersion";

// copied here from config, loading config in real time here breaks
const resolverStartBlocks = {
  legacy: {
    ethereum: 23971096,
    arbitrum: 408615445,
    base: 39221996,
    optimism: 144817281,
    ethereumSepolia: 9823930,
    arbitrumSepolia: 223948198,
    baseSepolia: 34884744,
    optimismSepolia: 36867619,
  },
  v6: {
    ethereum: 25330084,
    arbitrum: 474174392,
    base: 47399252,
    optimism: 152994511,
    ethereumSepolia: 11070733,
    arbitrumSepolia: 277727786,
    baseSepolia: 42909633,
    optimismSepolia: 44892469,
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
  const resolverStartBlock =
    version === 6
      ? resolverStartBlocks.v6[context.chain.name]
      : resolverStartBlocks.legacy[context.chain.name];

  // current resolver contract is a redeploy from the original. some events may trigger this query in a block prior to the current resolver contract being deployed. in that case, we will just return empty.
  if (block < resolverStartBlock) return Promise.resolve(null);

  const address =
    version === 6
      ? ADDRESS.banny721TokenUriResolver6
      : version === 5
        ? ADDRESS.banny721TokenUriResolver5
        : ADDRESS.banny721TokenUriResolver;

  const hook = bannyRetailHookForVersion(version, context.chain.id);

  return context.client.readContract({
    abi: Banny721TokenUriResolverAbi,
    address,
    functionName: "svgOf",
    args: [hook, tierId * BigInt(1000000000), false, false],
  });
}
