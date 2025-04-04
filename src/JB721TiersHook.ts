import { ponder } from "ponder:registry";
import { mintNftEvent, nft, nftTier } from "ponder:schema";
import { JB721TiersHookAbi } from "../abis/JB721TiersHookAbi";
import { JB721TiersHookStoreAbi } from "../abis/JB721TiersHookStoreAbi";
import { BANNY_RETAIL_HOOK } from "./constants/bannyHook";
import { getBannySvg } from "./util/getBannySvg";
import { getEventParams } from "./util/getEventParams";
import { tierOf } from "./util/tierOf";

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

    const projectIdCall = await context.client.readContract({
      abi: JB721TiersHookAbi,
      address: hook,
      functionName: "PROJECT_ID",
    });

    await context.db.insert(nftTier).values({
      tierId: Number(tierId),
      chainId: context.network.chainId,
      price: tier.price,
      hook,
      projectId: Number(projectIdCall),
      allowOwnerMint: tier.allowOwnerMint,
      createdAt: Number(event.block.timestamp),
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
  const { tokenId, to } = event.args;
  const hook = event.log.address;

  try {
    const tier = await context.client.readContract({
      abi: JB721TiersHookStoreAbi,
      address: "0xdc162a8a6decc7f27fd4cff58d69b9cc0c7c2ea1",
      functionName: "tierOfTokenId",
      args: [event.log.address, tokenId, true],
    });

    await Promise.all([
      // update remainingSupply of tier, in case this is a mint
      context.db
        .update(nftTier, {
          chainId: context.network.chainId,
          hook,
          tierId: tier.id,
        })
        .set({
          remainingSupply: tier.remainingSupply,
        }),
      context.db
        .find(nft, {
          chainId: context.network.chainId,
          hook,
          tokenId,
        })
        .then(async (existingNft) => {
          if (existingNft) {
            return context.db
              .update(nft, {
                chainId: context.network.chainId,
                hook: event.log.address,
                tokenId,
              })
              .set({ owner: to });
          } else {
            const [projectId, tokenUri] = await Promise.all([
              context.client.readContract({
                abi: JB721TiersHookAbi,
                address: hook,
                functionName: "PROJECT_ID",
              }),
              context.client.readContract({
                abi: JB721TiersHookAbi,
                address: hook,
                functionName: "tokenURI",
                args: [tokenId],
              }),
            ]);

            return context.db.insert(nft).values({
              chainId: context.network.chainId,
              hook,
              tokenId,
              category: tier.category,
              owner: to,
              projectId: Number(projectId),
              createdAt: Number(event.block.timestamp),
              tokenUri,
              tierId: tier.id,
            });
          }
        }),
    ]);
  } catch (e) {
    console.error("JB721TiersHook:Transfer", e);
  }
});

ponder.on("JB721TiersHook:RemoveTier", async ({ event, context }) => {
  try {
    await context.db.delete(nftTier, {
      chainId: context.network.chainId,
      hook: event.log.address,
      tierId: Number(event.args.tierId),
    });
  } catch (e) {
    console.error("JB721TiersHook:RemoveTier", e);
  }
});

ponder.on("JB721TiersHook:Mint", async ({ event, context }) => {
  try {
    const { beneficiary, tierId, tokenId, totalAmountPaid } = event.args;
    const hook = event.log.address;

    const projectIdCall = await context.client.readContract({
      abi: JB721TiersHookAbi,
      address: hook,
      functionName: "PROJECT_ID",
    });

    await context.db.insert(mintNftEvent).values({
      ...getEventParams({ event, context }),
      projectId: Number(projectIdCall),
      hook,
      tierId: Number(tierId),
      tokenId,
      beneficiary,
      totalAmountPaid,
    });
  } catch (e) {
    console.error("JB721TiersHook:Mint", e);
  }
});
