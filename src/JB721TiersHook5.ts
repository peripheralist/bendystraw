import { ponder } from "ponder:registry";
import {
  mintNftEvent,
  nft,
  nftTier,
  participant,
  project,
} from "ponder:schema";
import { isAddressEqual } from "viem";
import { JB721TiersHookAbi } from "../abis/JB721TiersHookAbi";
import { JB721TiersHookStoreAbi } from "../abis/JB721TiersHookStoreAbi";
import { ADDRESS } from "./constants/address";
import { BANNY_RETAIL_HOOK_5 } from "./constants/bannyHook";
import { insertActivityEvent } from "./util/activityEvent";
import { getBannySvg } from "./util/getBannySvg";
import { getEventParams } from "./util/getEventParams";
import { setParticipantSnapshot } from "./util/participantSnapshot";
import { tierOf } from "./util/tierOf";
import { parseTokenUri } from "./util/tokenUri";

// we hard-code version and duplicate this logic bc no other way to dynamically determine contract version (i think)
const version = 5;

ponder.on("JB721TiersHook5:AddTier", async ({ event, context }) => {
  const hook = event.log.address;

  const { tier, tierId } = event.args;

  try {
    // `resolvedUri` and `svg` are the only things we can't get from the event args
    const { resolvedUri } = await tierOf({ context, hook, tierId, version });

    let svg = null;
    if (isAddressEqual(hook, BANNY_RETAIL_HOOK_5)) {
      svg = await getBannySvg({
        context,
        tierId,
        block: event.block.number,
        version,
      });
    }

    const projectIdCall = await context.client.readContract({
      abi: JB721TiersHookAbi,
      address: hook,
      functionName: "PROJECT_ID",
    });

    await context.db.insert(nftTier).values({
      tierId: Number(tierId),
      chainId: context.chain.id,
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
      version,
    });
  } catch (e) {
    console.error("JB721TiersHook5:AddTier", e);
  }
});

ponder.on("JB721TiersHook5:Transfer", async ({ event, context }) => {
  const { tokenId, to } = event.args;
  const hook = event.log.address;
  const chainId = context.chain.id;

  try {
    const tier = await context.client.readContract({
      abi: JB721TiersHookStoreAbi,
      address: ADDRESS.jb721TiersHookStore5,
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

    const _project = await context.db.find(project, {
      projectId,
      chainId,
      version,
    });

    if (!_project) {
      throw new Error("Missing project");
    }

    // create participant if none exists
    const _participant = await context.db
      .insert(participant)
      .values({
        address: to,
        chainId,
        projectId,
        createdAt: Number(event.block.timestamp),
        suckerGroupId: _project.suckerGroupId,
        isRevnet: _project.isRevnet,
        version,
      })
      .onConflictDoUpdate({
        suckerGroupId: _project.suckerGroupId,
        isRevnet: _project.isRevnet,
      });
    await setParticipantSnapshot({ participant: _participant, context, event });

    const existingNft = await context.db.find(nft, {
      chainId,
      hook,
      tokenId,
      version,
    });

    if (existingNft) {
      await context.db
        .update(nft, {
          chainId,
          hook,
          tokenId,
          version,
        })
        .set({ owner: to });
    } else {
      const tokenUri = await context.client.readContract({
        abi: JB721TiersHookAbi,
        address: hook,
        functionName: "tokenURI",
        args: [tokenId],
      });

      await context.db.insert(nft).values({
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
        version,
      });
    }

    // update remainingSupply of tier, in case this is a mint
    await context.db
      .update(nftTier, {
        chainId,
        hook,
        tierId: tier.id,
        version,
      })
      .set({
        remainingSupply: tier.remainingSupply,
      });
  } catch (e) {
    console.error("JB721TiersHook5:Transfer", e);
  }
});

ponder.on("JB721TiersHook5:RemoveTier", async ({ event, context }) => {
  try {
    await context.db.delete(nftTier, {
      chainId: context.chain.id,
      hook: event.log.address,
      tierId: Number(event.args.tierId),
      version,
    });
  } catch (e) {
    console.error("JB721TiersHook5:RemoveTier", e);
  }
});

ponder.on("JB721TiersHook5:Mint", async ({ event, context }) => {
  try {
    const { beneficiary, tierId, tokenId, totalAmountPaid } = event.args;
    const hook = event.log.address;

    const projectIdCall = await context.client.readContract({
      abi: JB721TiersHookAbi,
      address: hook,
      functionName: "PROJECT_ID",
    });

    const projectId = Number(projectIdCall);

    // update project
    const _project = await context.db
      .update(project, {
        projectId,
        chainId: context.chain.id,
        version,
      })
      .set((p) => ({ nftsMintedCount: p.nftsMintedCount + 1 }));

    // insert mintNftEvent
    const { id } = await context.db.insert(mintNftEvent).values({
      ...getEventParams({ event, context }),
      projectId,
      suckerGroupId: _project.suckerGroupId,
      hook,
      tierId: Number(tierId),
      tokenId,
      beneficiary,
      totalAmountPaid,
      version,
    });
    await insertActivityEvent("mintNftEvent", {
      id,
      event,
      context,
      projectId,
      version,
    });
  } catch (e) {
    console.error("JB721TiersHook5:Mint", e);
  }
});
