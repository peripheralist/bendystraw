import { ponder } from "ponder:registry";
import {
  mintNftEvent,
  nft,
  nftTier,
  participant,
  project,
  wallet,
} from "ponder:schema";
import { JB721TiersHookV6Abi } from "../abis/JB721TiersHookV6Abi";
import { JB721TiersHookStoreV6Abi } from "../abis/JB721TiersHookStoreV6Abi";
import { ADDRESS } from "./constants/address";
import { insertActivityEvent } from "./util/activityEvent";
import { getEventParams } from "./util/getEventParams";
import { addressForVersion } from "./util/getVersion";
import { setParticipantSnapshot } from "./util/participantSnapshot";
import { tierOf } from "./util/tierOf";
import { parseTokenUri } from "./util/tokenUri";
import { isAddressEqual } from "viem";
import { BANNY_RETAIL_HOOK_6 } from "./constants/bannyHook";
import { getBannySvg } from "./util/getBannySvg";

const version = 6;

if (ADDRESS.jb721TiersHookDeployer6) {
  const hookStore = addressForVersion("jb721TiersHookStore", version);

  ponder.on("JB721TiersHook6:AddTier", async ({ event, context }) => {
    const hook = event.log.address;

    const { tier, tierId } = event.args;

    try {
      const { resolvedUri } = await tierOf({ context, hook, tierId, version });

      const projectIdCall = await context.client.readContract({
        abi: JB721TiersHookV6Abi,
        address: hook,
        functionName: "projectId",
      });

      let svg = null;
      if (isAddressEqual(hook, BANNY_RETAIL_HOOK_6)) {
        svg = await getBannySvg({
          context,
          tierId,
          block: event.block.number,
          version,
        });
      }

      await context.db.insert(nftTier).values({
        tierId: Number(tierId),
        chainId: context.chain.id,
        price: tier.price,
        hook,
        projectId: Number(projectIdCall),
        allowOwnerMint: tier.flags.allowOwnerMint,
        createdAt: Number(event.block.timestamp),
        cannotBeRemoved: tier.flags.cantBeRemoved,
        reserveBeneficiary: tier.reserveBeneficiary,
        reserveFrequency: tier.reserveFrequency,
        category: tier.category,
        encodedIpfsUri: tier.encodedIPFSUri,
        initialSupply: tier.initialSupply,
        remainingSupply: tier.initialSupply,
        transfersPausable: tier.flags.transfersPausable,
        votingUnits: BigInt(tier.votingUnits),
        resolvedUri,
        metadata: parseTokenUri(resolvedUri),
        svg,
        version,
      });
    } catch (e) {
      console.error("JB721TiersHook6:AddTier", e);
    }
  });

  ponder.on("JB721TiersHook6:Transfer", async ({ event, context }) => {
    const { tokenId, to } = event.args;
    const hook = event.log.address;
    const chainId = context.chain.id;

    try {
      const tier = await context.client.readContract({
        abi: JB721TiersHookStoreV6Abi,
        address: hookStore,
        functionName: "tierOfTokenId",
        args: [hook, tokenId, true],
      });

      const _projectId = await context.client.readContract({
        abi: JB721TiersHookV6Abi,
        address: hook,
        functionName: "projectId",
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

      await context.db
        .insert(wallet)
        .values({ address: to })
        .onConflictDoNothing();

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
      await setParticipantSnapshot({
        participant: _participant,
        context,
        event,
      });

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
          abi: JB721TiersHookV6Abi,
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
          projectId,
          createdAt: Number(event.block.timestamp),
          customizedAt: Number(event.block.timestamp),
          tokenUri,
          metadata: parseTokenUri(tokenUri),
          tierId: tier.id,
          version,
        });
      }

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
      console.error("JB721TiersHook6:Transfer", e);
    }
  });

  ponder.on("JB721TiersHook6:RemoveTier", async ({ event, context }) => {
    try {
      await context.db.delete(nftTier, {
        chainId: context.chain.id,
        hook: event.log.address,
        tierId: Number(event.args.tierId),
        version,
      });
    } catch (e) {
      console.error("JB721TiersHook6:RemoveTier", e);
    }
  });

  ponder.on("JB721TiersHook6:Mint", async ({ event, context }) => {
    try {
      const { beneficiary, tierId, tokenId, totalAmountPaid } = event.args;
      const hook = event.log.address;

      const projectIdCall = await context.client.readContract({
        abi: JB721TiersHookV6Abi,
        address: hook,
        functionName: "projectId",
      });

      const projectId = Number(projectIdCall);

      const _project = await context.db
        .update(project, {
          projectId,
          chainId: context.chain.id,
          version,
        })
        .set((p) => ({ nftsMintedCount: p.nftsMintedCount + 1 }));

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
        suckerGroupId: _project.suckerGroupId,
        version,
      });
    } catch (e) {
      console.error("JB721TiersHook6:Mint", e);
    }
  });
}
