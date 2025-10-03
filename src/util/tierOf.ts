import { Context } from "ponder:registry";
import { JB721TiersHookStoreAbi } from "../../abis/JB721TiersHookStoreAbi";
import { ADDRESS } from "../constants/address";
import { Version } from "./getVersion";

export function tierOf({
  context,
  hook,
  tierId,
  version,
}: {
  context: Context;
  hook: `0x${string}`;
  tierId: bigint;
  version: Version;
}) {
  return context.client.readContract({
    abi: JB721TiersHookStoreAbi,
    address:
      version === 5
        ? ADDRESS.jb721TiersHookStore5
        : ADDRESS.jb721TiersHookStore,
    functionName: "tierOf",
    args: [hook, tierId, true],
  });
}
