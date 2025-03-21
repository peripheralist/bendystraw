import { ponder } from "ponder:registry";
import { nftTier } from "ponder:schema";
import { BANNY_RETAIL_HOOK } from "./constants";
import { getBannySvg } from "./util/getBannySvg";
import { tierOf } from "./util/tierOf";
import { nft } from "ponder:schema";
import { JB721TiersHookStoreAbi } from "../abis/JB721TiersHookStoreAbi";
import { JB721TiersHookAbi } from "../abis/JB721TiersHookAbi";

ponder.on("JB721TiersHook:AddTier", async ({ event, context }) => {
  const hook = event.log.address;

  const { tier, tierId } = event.args;

  try {
    // `resolvedUri` and `svg` are the only things we can't get from the event args
    const { resolvedUri } = await tierOf({ context, hook, tierId });

    let svg = null;
    if (hook == BANNY_RETAIL_HOOK) {
      svg = await getBannySvg({ context, tierId });
    }

    await context.db.insert(nftTier).values({
      tierId,
      chainId: context.network.chainId,
      price: tier.price,
      hook,
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
      votingUnits: BigInt(tier.votingUnits),
      resolvedUri,
      svg,
    });
  } catch (e) {
    console.error("JB721TiersHook:AddTier", e);
  }
});

ponder.on("JB721TiersHook:Transfer", async ({ event, context }) => {
  const hook = event.log.address;

  try {
    const tier = await context.client.readContract({
      abi: JB721TiersHookStoreAbi,
      address: "0xdc162a8a6decc7f27fd4cff58d69b9cc0c7c2ea1",
      functionName: "tierOfTokenId",
      args: [event.log.address, event.args.tokenId, true],
    });

    // update remainingSupply of tier, in case this is a mint
    await context.db
      .update(nftTier, {
        chainId: context.network.chainId,
        hook,
        tierId: BigInt(tier.id),
      })
      .set({
        remainingSupply: tier.remainingSupply,
      });

    const existingNft = await context.db.find(nft, {
      chainId: context.network.chainId,
      hook,
      tokenId: event.args.tokenId,
    });

    if (existingNft) {
      await context.db
        .update(nft, {
          chainId: context.network.chainId,
          hook: event.log.address,
          tokenId: event.args.tokenId,
        })
        .set({ owner: event.args.to });
    } else {
      const projectId = await context.client.readContract({
        abi: JB721TiersHookAbi,
        address: hook,
        functionName: "PROJECT_ID",
      });
      const tokenUri = await context.client.readContract({
        abi: JB721TiersHookAbi,
        address: hook,
        functionName: "tokenURI",
        args: [event.args.tokenId],
      });

      await context.db.insert(nft).values({
        chainId: context.network.chainId,
        hook,
        tokenId: event.args.tokenId,
        category: tier.category,
        owner: event.args.to,
        projectId,
        createdAt: event.block.timestamp,
        tokenUri,
      });
    }
  } catch (e) {
    console.error("JB721TiersHook:Transfer", e);
  }
});

ponder.on("JB721TiersHook:RemoveTier", async ({ event, context }) => {
  try {
    await context.db.delete(nftTier, {
      chainId: context.network.chainId,
      hook: event.log.address,
      tierId: event.args.tierId,
    });
  } catch (e) {
    console.error("JB721TiersHook:RemoveTier", e);
  }
});
