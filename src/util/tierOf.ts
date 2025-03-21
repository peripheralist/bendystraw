import { Context } from "ponder:registry";
import { JB721TiersHookStoreAbi } from "../../abis/JB721TiersHookStoreAbi";

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
    address: "0xdc162a8a6decc7f27fd4cff58d69b9cc0c7c2ea1",
    functionName: "tierOf",
    args: [hook, tierId, true],
  });
}
