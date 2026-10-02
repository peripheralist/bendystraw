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
import { getChainHead } from "./getChainHead";

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

  const mainnetsChainheads = await Promise.all(
    MAINNETS.map(async (chain) => ({
      chainId: chain.id,
      chainHead: await getChainHead(chain.id),
    }))
  );

  await new Promise((r) => setTimeout(() => r(null), 1100)); // avoid rate limit with getting block height (max 5 req/s)

  const testnetsChainheads = await Promise.all(
    TESTNETS.map(async (chain) => ({
      chainId: chain.id,
      chainHead: await getChainHead(chain.id),
    }))
  );

  const chainHeads = [...mainnetsChainheads, ...testnetsChainheads];

  return NETWORKS.reduce((acc, curr) => {
    const chainHead = chainHeads.find(
      ({ chainId }) => curr.id === chainId
    )!.chainHead ?? 0;

    const currentBlock = chainStatuses.find(
      ({ chainId }) => curr.id === chainId
    )!.block;

    const blocksBehind =
      currentBlock === null
        ? "error"
        : Math.max(chainHead - currentBlock, 0);

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
        chainHead,
        block: currentBlock,
        blocksBehind,
        secsBehind,
      },
    };
  }, {} as Record<ChainId, { chainHead: number; block: number; blocksBehind: number; secsBehind: number }>);
}
