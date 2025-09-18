import { Version } from "./getVersion";

export const idForProject = (
  version: Version,
  projectId: number | bigint,
  chainId: number
) => `${version}_${projectId}_${chainId}`;

export const idForSuckerGroup = (projects: string[]) =>
  projects.sort().join("-");
