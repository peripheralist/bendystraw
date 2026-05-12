import { isAddressEqual } from "viem";
import { ADDRESS } from "../constants/address";

export type Version = 4 | 5 | 6;

type VersionedAddressKey = Extract<keyof typeof ADDRESS, `${string}${5 | 6}`>;
export type VersionedContractName =
  VersionedAddressKey extends `${infer Name}${5 | 6}` ? Name : never;

export function addressForVersion(
  contractName: VersionedContractName,
  version: Version
): `0x${string}` {
  const key = `${contractName}${version === 4 ? "" : version}` as keyof typeof ADDRESS;
  const address = ADDRESS[key] as `0x${string}` | undefined;

  if (!address) {
    throw new Error(`Missing ${version} address for ${contractName}`);
  }

  return address as `0x${string}`;
}

/**
 * Gets version of contract
 * @param event Indexer function event object
 * @param contractName Versioned contract name as keyed in /constants/address.ts
 * @returns Version number
 */
export function getVersion(
  event: { log: { address: `0x${string}` } },
  contractName: VersionedContractName
): Version {
  const v6Key = `${contractName}6` as keyof typeof ADDRESS;
  const v5Key = `${contractName}5` as keyof typeof ADDRESS;
  const v6Address = ADDRESS[v6Key] as `0x${string}` | undefined;
  const v5Address = ADDRESS[v5Key] as `0x${string}` | undefined;

  if (
    v6Address &&
    isAddressEqual(event.log.address, v6Address)
  ) {
    return 6;
  }

  if (
    v5Address &&
    isAddressEqual(event.log.address, v5Address)
  ) {
    return 5;
  }

  return 4;
}
