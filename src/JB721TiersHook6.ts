import { ponder } from "ponder:registry";
import { nftTier, project } from "ponder:schema";
import { JB721TiersHookV6Abi } from "../abis/JB721TiersHookV6Abi";
import { ADDRESS } from "./constants/address";
import {
  recordAddNftTierActivity,
  recordRemoveNftTierActivity,
} from "./util/nftTierActivity";
import { tierOf } from "./util/tierOf";
import { parseTierMetadata } from "./util/tokenUri";
import { isAddressEqual } from "viem";
import { bannyRetailHookForVersion } from "./constants/bannyHook";
import { getBannySvg } from "./util/getBannySvg";

import { recordV6NftTransfer, recordV6NftMint } from "./util/v6Nft";

const version = 6;

if (ADDRESS.jb721TiersHookDeployer6) {

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
      const projectId = Number(projectIdCall);

      const _project = await context.db.find(project, {
        projectId,
        chainId: context.chain.id,
        version,
      });

      let svg = null;
      if (isAddressEqual(hook, bannyRetailHookForVersion(version, context.chain.id))) {
        svg = await getBannySvg({
          context,
          tierId,
          block: event.block.number,
          version,
        });
      }

      const metadata = await parseTierMetadata({ resolvedUri, encodedIpfsUri: tier.encodedIPFSUri });

      await context.db.insert(nftTier).values({
        tierId: Number(tierId),
        chainId: context.chain.id,
        price: tier.price,
        hook,
        projectId,
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
        metadata,
        svg,
        version,
      });

      if (_project) {
        await recordAddNftTierActivity(event, context, {
          projectId,
          suckerGroupId: _project.suckerGroupId,
          version,
          resolvedUri,
          metadata,
        });
      }
    } catch (e) {
      console.error("JB721TiersHook6:AddTier", e);
    }
  });

  ponder.on("JB721TiersHook6:Transfer", recordV6NftTransfer);

  // `setMetadata` replaces a tier's media in place; the indexed CID and parsed
  // metadata must follow it or every client that prefers the index shows the old media.
  ponder.on("JB721TiersHook6:SetEncodedIpfsUri", async ({ event, context }) => {
    try {
      const hook = event.log.address;
      const tierId = Number(event.args.tierId);
      const key = { chainId: context.chain.id, hook, tierId, version };
      const existingTier = await context.db.find(nftTier, key);
      if (!existingTier) return;

      const { resolvedUri } = await tierOf({ context, hook, tierId: event.args.tierId, version });
      const metadata = await parseTierMetadata({ resolvedUri, encodedIpfsUri: event.args.encodedUri });

      await context.db.update(nftTier, key).set({
        encodedIpfsUri: event.args.encodedUri,
        resolvedUri,
        metadata: metadata ?? existingTier.metadata,
      });
    } catch (e) {
      console.error("JB721TiersHook6:SetEncodedIpfsUri", e);
    }
  });

  ponder.on("JB721TiersHook6:RemoveTier", async ({ event, context }) => {
    try {
      const hook = event.log.address;
      const tierId = Number(event.args.tierId);
      const existingTier = await context.db.find(nftTier, {
        chainId: context.chain.id,
        hook,
        tierId,
        version,
      });
      let projectId = existingTier?.projectId;

      if (projectId === undefined) {
        const projectIdCall = await context.client.readContract({
          abi: JB721TiersHookV6Abi,
          address: hook,
          functionName: "projectId",
        });
        projectId = Number(projectIdCall);
      }

      const _project = await context.db.find(project, {
        projectId,
        chainId: context.chain.id,
        version,
      });

      if (_project) {
        await recordRemoveNftTierActivity(event, context, {
          projectId,
          suckerGroupId: _project.suckerGroupId,
          version,
        });
      }

      await context.db.delete(nftTier, {
        chainId: context.chain.id,
        hook,
        tierId,
        version,
      });
    } catch (e) {
      console.error("JB721TiersHook6:RemoveTier", e);
    }
  });

  ponder.on("JB721TiersHook6:Mint", recordV6NftMint);
}
