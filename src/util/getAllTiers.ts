import { Context } from "ponder:registry";
import { JB721TiersHookStoreAbi } from "../../abis/JB721TiersHookStoreAbi";
import { ADDRESS } from "../constants/address";
import { Version } from "./getVersion";
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
  const maxTierCall = await context.client.readContract({
    abi: JB721TiersHookStoreAbi,
    address:
      version === 5
        ? ADDRESS.jb721TiersHookStore5
        : ADDRESS.jb721TiersHookStore,
    functionName: "maxTierIdOf",
    args: [hook],
  });

  const tierPromises = [];

  for (let tierId = BigInt(1); tierId <= maxTierCall; tierId += BigInt(1)) {
    tierPromises.push(tierOf({ context, hook, tierId, version }));
  }

  return Promise.all(tierPromises);
}
