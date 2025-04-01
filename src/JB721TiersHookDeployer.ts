import { ponder } from "ponder:registry";
import { nftHook, nftTier } from "ponder:schema";
import { JB721TiersHookAbi } from "../abis/JB721TiersHookAbi";
import { BANNY_RETAIL_HOOK } from "./constants";
import { getAllTiers } from "./util/getAllTiers";
import { getBannySvg } from "./util/getBannySvg";

ponder.on("JB721TiersHookDeployer:HookDeployed", async ({ event, context }) => {
  const { hook } = event.args;
  const { client, db, network } = context;

  try {
    const [nameCall, symbolCall] = await Promise.all([
      client.readContract({
        abi: JB721TiersHookAbi,
        address: hook,
        functionName: "name",
      }),
      client.readContract({
        abi: JB721TiersHookAbi,
        address: hook,
        functionName: "symbol",
      }),
    ]);

    await db.insert(nftHook).values({
      chainId: context.network.chainId,
      address: hook,
      projectId: event.args.projectId,
      createdAt: event.block.timestamp,
      name: nameCall,
      symbol: symbolCall,
    });

    // Next we add all NFT Tiers for the collection (if any)
    const tiers = await getAllTiers({ context, hook });

    await Promise.all(
      tiers.map(async (tier) => {
        const tierId = BigInt(tier.id);

        let svg = undefined;
        if (hook == BANNY_RETAIL_HOOK) {
          svg = await getBannySvg({ context, tierId });
        }

        return db.insert(nftTier).values({
          tierId,
          chainId: network.chainId,
          price: tier.price,
          hook,
          projectId: event.args.projectId,
          allowOwnerMint: tier.allowOwnerMint,
          createdAt: event.block.timestamp,
          cannotBeRemoved: tier.cannotBeRemoved,
          reserveBeneficiary: tier.reserveBeneficiary,
          reserveFrequency: tier.reserveFrequency,
          category: tier.category,
          encodedIpfsUri: tier.encodedIPFSUri,
          initialSupply: tier.initialSupply,
          remainingSupply: tier.initialSupply,
          transfersPausable: tier.transfersPausable,
          votingUnits: tier.votingUnits,
          resolvedUri: tier.resolvedUri,
          svg,
        });
      })
    );
  } catch (e) {
    console.error("JB721TiersHookDeployer:HookDeployed", e);
  }
});
