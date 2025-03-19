import { ponder } from "ponder:registry";
import { nftHook } from "ponder:schema";
import { JB721TiersHookAbi } from "../abis/JB721TiersHookAbi";

ponder.on("JB721TiersHookDeployer:HookDeployed", async ({ event, context }) => {
  try {
    const nameCall = await context.client.readContract({
      abi: JB721TiersHookAbi,
      address: event.args.hook,
      functionName: "name",
    });
    const symbolCall = await context.client.readContract({
      abi: JB721TiersHookAbi,
      address: event.args.hook,
      functionName: "symbol",
    });

    await context.db.insert(nftHook).values({
      chainId: context.network.chainId,
      address: event.args.hook,
      projectId: event.args.projectId,
      createdAt: event.block.timestamp,
      name: nameCall,
      symbol: symbolCall,
    });
  } catch (e) {
    console.error("JB721TiersHookDeployer:HookDeployed", e);
  }
});
