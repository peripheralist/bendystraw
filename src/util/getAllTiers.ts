import { Context } from "ponder:registry";
import { JB721TiersHookStoreAbi } from "../../abis/JB721TiersHookStoreAbi";
import { JB721TiersHookStoreV6Abi } from "../../abis/JB721TiersHookStoreV6Abi";
import { addressForVersion, Version } from "./getVersion";
import { tierOf } from "./tierOf";

export async function getAllTiers({
  context,
  hook,
  version,
}: {
  context: Context;
  hook: `0x${string}`;
  version: Version;
}) {
  const maxTierCall =
    version === 6
      ? await context.client.readContract({
          abi: JB721TiersHookStoreV6Abi,
          address: addressForVersion("jb721TiersHookStore", version),
          functionName: "maxTierIdOf",
          args: [hook],
        })
      : await context.client.readContract({
          abi: JB721TiersHookStoreAbi,
          address: addressForVersion("jb721TiersHookStore", version),
          functionName: "maxTierIdOf",
          args: [hook],
        });

  const tierPromises = [];

  for (let tierId = BigInt(1); tierId <= maxTierCall; tierId += BigInt(1)) {
    tierPromises.push(tierOf({ context, hook, tierId, version }));
  }

  return Promise.all(tierPromises);
}
