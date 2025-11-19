import axios from "axios";
import {
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
  mainnet,
  optimism,
  optimismSepolia,
  sepolia,
} from "viem/chains";
import { IS_DEV } from "../constants/dev";
import { ChainId, MAINNETS, NETWORKS, TESTNETS } from "../constants/networks";
import { getBlockHeight } from "./getBlockHeight";

async function getStatus(testnet?: boolean) {
  try {
    const res = await axios.get<
      Record<
        string,
        { id: ChainId; block: { number: number; timestamp: number } }
      >
    >(
      IS_DEV
        ? `http://localhost:42069/status`
        : `https://bendystraw${testnet ? "-testnet" : ""}.up.railway.app/status`
    );

    return res.data;
  } catch (e) {
    console.error(
      `Error getting bendystraw status (${testnet ? "testnets" : "mainnets"})`,
      e
    );

    const block = { number: null, timestamp: null };

    return testnet
      ? {
          sepolia: { id: sepolia.id, block },
          optimismSepolia: { id: optimismSepolia.id, block },
          baseSepolia: { id: baseSepolia.id, block },
          arbitrumSepolia: { id: arbitrumSepolia.id, block },
        }
      : {
          ethereum: { id: mainnet.id, block },
          optimism: { id: optimism.id, block },
          base: { id: base.id, block },
          arbitrum: { id: arbitrum.id, block },
        };
  }
}

export async function getBsStatus() {
  const mainnetStatus = await getStatus();
  const testnetStatus = await getStatus(true);

  const chainStatuses = [
    ...Object.values(mainnetStatus),
    ...Object.values(testnetStatus),
  ].map((s) => ({
    chainId: s.id,
    block: s.block.number as number | null,
    timestamp: s.block.timestamp as number | null,
  }));

  const mainnetsBlockHeights = await Promise.all(
    MAINNETS.map(async (chain) => ({
      chainId: chain.id,
      blockHeight: await getBlockHeight(chain.id),
    }))
  );

  await new Promise((r) => setTimeout(() => r(null), 1100)); // avoid rate limit with getting block height (max 5 req/s)

  const testnetsBlockHeights = await Promise.all(
    TESTNETS.map(async (chain) => ({
      chainId: chain.id,
      blockHeight: await getBlockHeight(chain.id),
    }))
  );

  const blockHeights = [...mainnetsBlockHeights, ...testnetsBlockHeights];

  return NETWORKS.reduce((acc, curr) => {
    const blockHeight = blockHeights.find(
      ({ chainId }) => curr.id === chainId
    )!.blockHeight;

    const bsBlockHeight = chainStatuses.find(
      ({ chainId }) => curr.id === chainId
    )!.block;

    const blocksBehind =
      bsBlockHeight === null
        ? "error"
        : Math.max(blockHeight - bsBlockHeight, 0);

    const bsTimestamp = chainStatuses.find(
      ({ chainId }) => curr.id === chainId
    )!.timestamp;

    const secsBehind =
      bsTimestamp == null
        ? "error"
        : Math.max(Math.floor(Date.now() / 1000) - bsTimestamp, 0);

    return {
      ...acc,
      [curr.id]: {
        block: bsBlockHeight,
        blocksBehind,
        secsBehind,
      },
    };
  }, {} as Record<ChainId, { block: number; blocksBehind: number; secsBehind: number }>);
}
