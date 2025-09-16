import { isAddressEqual } from "viem";
import { ADDRESS } from "../constants/address";

/**
 * Gets version of contract
 * @param event Indexer function event object
 * @param v5ContractName Name of v5 contract as keyed in /constants/address.ts
 * @returns Version number
 */
export function getVersion(
  event: { log: { address: `0x${string}` } },
  v5ContractName: Extract<keyof typeof ADDRESS, `${string}5`>
) {
  return isAddressEqual(event.log.address, ADDRESS[v5ContractName]) ? 5 : 4;
}
