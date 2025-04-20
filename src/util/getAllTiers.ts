import { Context } from "ponder:registry";
import { JB721TiersHookStoreAbi } from "../../abis/JB721TiersHookStoreAbi";
import { ADDRESS } from "../constants/address";
import { tierOf } from "./tierOf";

export async function getAllTiers({
  context,
  hook,
}: {
  context: Context;
  hook: `0x${string}`;
}) {
  const maxTierCall = await context.client.readContract({
    abi: JB721TiersHookStoreAbi,
    address: ADDRESS.jb721TiersHookStore,
    functionName: "maxTierIdOf",
    args: [hook],
  });

  const tierPromises = [];

  for (let tierId = BigInt(1); tierId <= maxTierCall; tierId += BigInt(1)) {
    tierPromises.push(tierOf({ context, hook, tierId }));
  }

  return Promise.all(tierPromises);
}
