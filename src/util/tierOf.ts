import { Context } from "ponder:registry";
import { JB721TiersHookStoreAbi } from "../../abis/JB721TiersHookStoreAbi";
import { ADDRESS } from "../constants/address";

export function tierOf({
  context,
  hook,
  tierId,
}: {
  context: Context;
  hook: `0x${string}`;
  tierId: bigint;
}) {
  return context.client.readContract({
    abi: JB721TiersHookStoreAbi,
    address: ADDRESS.jb721TiersHookStore,
    functionName: "tierOf",
    args: [hook, tierId, true],
  });
}
