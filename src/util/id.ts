import { keccak256 } from "viem";
import { Version } from "./getVersion";

export const idForProject = (
  version: Version,
  projectId: number | bigint,
  chainId: number
) => `${version}-${projectId}-${chainId}`;

export const idForSuckerGroup = (projects: string[]) => {
  const str = projects.sort().join("-");

  const arr = new TextEncoder().encode(str);

  const hash = keccak256(arr);

  return hash.substring(2, 34); // trim leading '0x' and use next 32 characters
};
