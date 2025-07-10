import axios from "axios";
import { IS_DEV } from "../constants/dev";
import { ChainId, MAINNETS, NETWORKS, TESTNETS } from "../constants/networks";
import { getBlockHeight } from "./getBlockHeight";

function getStatus(testnet?: boolean) {
  return axios
    .get<
      Record<
        string,
        { id: ChainId; block: { number: number; timestamp: number } }
      >
    >(
      IS_DEV
        ? `http://localhost:42069/status`
        : `https://${testnet ? "testnet." : ""}bendystraw.xyz/status`
    )
    .then((res) => res.data);
}

export async function getBsStatus() {
  const mainnetStatus = await getStatus();
  const testnetStatus = await getStatus(true);

  const chainStatuses = [
    ...Object.values(mainnetStatus),
    ...Object.values(testnetStatus),
  ].map((s) => ({
    chainId: s.id,
    block: s.block.number,
    timestamp: s.block.timestamp,
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
    const blockHeight = blockHeights.find(({ chainId }) => curr.id === chainId)
      ?.blockHeight!;

    const bsBlockHeight = chainStatuses.find(
      ({ chainId }) => curr.id === chainId
    )?.block!;

    const blocksBehind = Math.max(blockHeight - bsBlockHeight, 0);

    const bsTimestamp = chainStatuses.find(({ chainId }) => curr.id === chainId)
      ?.timestamp!;

    const secsBehind = Math.max(Math.floor(Date.now() / 1000) - bsTimestamp, 0);

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
