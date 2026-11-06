import { Context } from "ponder:registry";
import { JB721TiersHookStoreAbi } from "../../abis/JB721TiersHookStoreAbi";
import { JB721TiersHookStoreV6Abi } from "../../abis/JB721TiersHookStoreV6Abi";
import { addressForVersion, Version } from "./getVersion";
import { tierOf } from "./tierOf";

export async function getAllTiers({
  context,
  hook,
  version,
  includeResolvedUri = true,
  store,
}: {
  context: Context;
  hook: `0x${string}`;
  version: Version;
  includeResolvedUri?: boolean;
  // A V6 hook that keeps its tiers outside the canonical store (Defifa 2.0) passes that store.
  store?: `0x${string}`;
}) {
  const maxTierCall =
    version === 6
      ? await context.client.readContract({
          abi: JB721TiersHookStoreV6Abi,
          address: store ?? addressForVersion("jb721TiersHookStore", version),
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
    tierPromises.push(tierOf({ context, hook, tierId, version, includeResolvedUri, store }));
  }

  return Promise.all(tierPromises);
}
