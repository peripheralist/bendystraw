import axios from "axios";
import { ChainId } from "../constants/networks";

export function getBlockHeight(chainId: ChainId) {
  return axios
    .get<{ result: `0x${string}` }>(
      `https://api.etherscan.io/v2/api?chainId=${chainId}&module=proxy&action=eth_blockNumber&apiKey=${process.env.ETHERSCAN_API_KEY}`
    )
    .then((res) => parseInt(res.data.result, 16) ?? JSON.stringify(res.data))
    .catch((e) => {
      console.warn(`Error getting block height for ${chainId}: ${e}`);
      return 0;
    });
}
