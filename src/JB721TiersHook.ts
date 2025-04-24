import { ponder } from "ponder:registry";
import {
  mintNftEvent,
  nft,
  nftTier,
  participant,
  project,
} from "ponder:schema";
import { JB721TiersHookAbi } from "../abis/JB721TiersHookAbi";
import { JB721TiersHookStoreAbi } from "../abis/JB721TiersHookStoreAbi";
import { BANNY_RETAIL_HOOK } from "./constants/bannyHook";
import { insertActivityEvent } from "./util/activityEvent";
import { getBannySvg } from "./util/getBannySvg";
import { getEventParams } from "./util/getEventParams";
import { tierOf } from "./util/tierOf";
import { parseTokenUri } from "./util/tokenUri";
import { ADDRESS } from "./constants/address";

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
      metadata: parseTokenUri(resolvedUri),
      svg,
    });
  } catch (e) {
    console.error("JB721TiersHook:AddTier", e);
  }
});

ponder.on("JB721TiersHook:Transfer", async ({ event, context }) => {
  const { tokenId, to } = event.args;
  const hook = event.log.address;
  const chainId = context.network.chainId;

  try {
    const tier = await context.client.readContract({
      abi: JB721TiersHookStoreAbi,
      address: ADDRESS.jb721TiersHookStore,
      functionName: "tierOfTokenId",
      args: [hook, tokenId, true],
    });

    const _projectId = await context.client.readContract({
      abi: JB721TiersHookAbi,
      address: hook,
      functionName: "PROJECT_ID",
    });

    if (!_projectId) {
      throw new Error("Missing projectId");
    }

    const projectId = Number(_projectId);

    const _project = await context.db.find(project, { projectId, chainId });

    if (!_project) {
      throw new Error("Missing project");
    }

    await Promise.all([
      // create participant if none exists
      context.db
        .insert(participant)
        .values({
          address: to,
          chainId,
          projectId,
          suckerGroupId: _project.suckerGroup,
        })
        .onConflictDoUpdate({ suckerGroupId: _project.suckerGroup }),

      // update remainingSupply of tier, in case this is a mint
      context.db
        .update(nftTier, {
          chainId,
          hook,
          tierId: tier.id,
        })
        .set({
          remainingSupply: tier.remainingSupply,
        }),

      context.db
        .find(nft, {
          chainId,
          hook,
          tokenId,
        })
        .then(async (existingNft) => {
          // we first check for existingNft because we may not need to call tokenUri(). db query is cheaper than contract read

          if (existingNft) {
            return context.db
              .update(nft, {
                chainId,
                hook,
                tokenId,
              })
              .set({ owner: to });
          } else {
            const tokenUri = await context.client.readContract({
              abi: JB721TiersHookAbi,
              address: hook,
              functionName: "tokenURI",
              args: [tokenId],
            });

            return context.db.insert(nft).values({
              chainId,
              hook,
              mintTx: event.transaction.hash,
              tokenId,
              category: tier.category,
              owner: to,
              projectId: Number(projectId),
              createdAt: Number(event.block.timestamp),
              customizedAt: Number(event.block.timestamp),
              tokenUri,
              metadata: parseTokenUri(tokenUri),
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

    const projectId = Number(projectIdCall);

    await Promise.all([
      context.db
        .insert(mintNftEvent)
        .values({
          ...getEventParams({ event, context }),
          projectId,
          hook,
          tierId: Number(tierId),
          tokenId,
          beneficiary,
          totalAmountPaid,
        })
        .then(({ id }) =>
          insertActivityEvent("mintNftEvent", { id, event, context, projectId })
        ),

      context.db
        .update(project, {
          projectId,
          chainId: context.network.chainId,
        })
        .set((p) => ({ nftsMintedCount: p.nftsMintedCount + 1 })),
    ]);
  } catch (e) {
    console.error("JB721TiersHook:Mint", e);
  }
});
