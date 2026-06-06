import { Context } from "ponder:registry";
import { JB721TiersHookStoreAbi } from "../../abis/JB721TiersHookStoreAbi";
import { JB721TiersHookStoreV6Abi } from "../../abis/JB721TiersHookStoreV6Abi";
import { addressForVersion, Version } from "./getVersion";

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
  if (version === 6) {
    return context.client.readContract({
      abi: JB721TiersHookStoreV6Abi,
      address: addressForVersion("jb721TiersHookStore", version),
      functionName: "tierOf",
      args: [hook, tierId, true],
    });
  }

  return context.client.readContract({
    abi: JB721TiersHookStoreAbi,
    address: addressForVersion("jb721TiersHookStore", version),
    functionName: "tierOf",
    args: [hook, tierId, true],
  });
}
