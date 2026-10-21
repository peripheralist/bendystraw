import { Context, Event } from "ponder:registry";
import {
  mintNftEvent,
  nft,
  nftTier,
  participant,
  project,
  wallet,
} from "ponder:schema";
import { JB721TiersHookV6Abi } from "../../abis/JB721TiersHookV6Abi";
import { JB721TiersHookStoreV6Abi } from "../../abis/JB721TiersHookStoreV6Abi";
import { insertActivityEvent } from "./activityEvent";
import { getEventParams } from "./getEventParams";
import { addressForVersion } from "./getVersion";
import { setParticipantSnapshot } from "./participantSnapshot";
import { parseTokenUri } from "./tokenUri";

const version = 6;
const hookStore = addressForVersion("jb721TiersHookStore", version);

// `store` overrides the canonical tier store for hooks that keep tiers elsewhere (Defifa 2.0).
export async function recordV6NftTransfer({ event, context, strict = false, store = hookStore }: { event: Event<"JB721TiersHook6:Transfer">; context: Context; strict?: boolean; store?: `0x${string}` }) {
    const { tokenId, to } = event.args;
    const hook = event.log.address;
    const chainId = context.chain.id;

    try {
      const tier = await context.client.readContract({
        abi: JB721TiersHookStoreV6Abi,
        address: store,
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

      await recordNftRecipient({ context, event, projectId, to });

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

      // A Defifa hook can transfer before its LaunchGame seeds the tiers in the same block; the seed then reads
      // the block's final supply.
      const tierKey = { chainId, hook, tierId: tier.id, version };
      if (await context.db.find(nftTier, tierKey)) {
        await context.db.update(nftTier, tierKey).set({ remainingSupply: tier.remainingSupply });
      }
    } catch (e) {
      if (strict) throw e;
      console.error("JB721TiersHook6:Transfer", e);
    }
}

export async function recordV6NftMint({ event, context, strict = false }: { event: Event<"JB721TiersHook6:Mint">; context: Context; strict?: boolean }) {
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
      if (strict) throw e;
      console.error("JB721TiersHook6:Mint", e);
    }
}

/** Record `to` as a wallet and a participant of the project they received an NFT in. */
export async function recordNftRecipient({
  context,
  event,
  projectId,
  to,
}: {
  context: Context;
  event: Parameters<typeof setParticipantSnapshot>[0]["event"];
  projectId: number;
  to: `0x${string}`;
}) {
  const chainId = context.chain.id;
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
      isHomerun: _project.isHomerun,
      isSticky: _project.isSticky,
      version,
    })
    .onConflictDoUpdate({
      suckerGroupId: _project.suckerGroupId,
      isRevnet: _project.isRevnet,
      isHomerun: _project.isHomerun,
      isSticky: _project.isSticky,
    });
  await setParticipantSnapshot({
    participant: _participant,
    context,
    event,
  });
}
