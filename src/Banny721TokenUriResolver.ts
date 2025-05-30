import { and, eq, or } from "ponder";
import { ponder } from "ponder:registry";
import { decorateBannyEvent, nft, nftTier } from "ponder:schema";
import { arbitrum, base, mainnet, optimism } from "viem/chains";
import { JB721TiersHookAbi } from "../abis/JB721TiersHookAbi";
import { BANNY_RETAIL_HOOK } from "./constants/bannyHook";
import { insertActivityEvent } from "./util/activityEvent";
import { getAllTiers } from "./util/getAllTiers";
import { getBannySvg } from "./util/getBannySvg";
import { getEventParams } from "./util/getEventParams";
import { tierOf } from "./util/tierOf";
import { parseTokenUri } from "./util/tokenUri";

const projectId = (chainId: number) => {
  switch (chainId) {
    case mainnet.id:
    case arbitrum.id:
    case optimism.id:
    case base.id:
      return 4;
  }

  // testnets
  return 6;
};

ponder.on(
  "Banny721TokenUriResolver:DecorateBanny",
  async ({ event, context }) => {
    try {
      const chainId = context.chain.id;
      const { bannyBodyId: tokenId } = event.args;

      const decoratedTokenUri = await context.client.readContract({
        abi: JB721TiersHookAbi,
        address: BANNY_RETAIL_HOOK,
        functionName: "tokenURI",
        args: [tokenId],
      });

      const nftToDecorate = await context.db.find(nft, {
        chainId,
        hook: BANNY_RETAIL_HOOK,
        tokenId,
      });

      if (!nftToDecorate) {
        throw new Error("Missing Banny NFT");
      }

      const ownerBannys = await context.db.sql
        .select()
        .from(nft)
        .where(
          and(
            eq(nft.hook, BANNY_RETAIL_HOOK),
            eq(nft.category, 0),
            eq(nft.owner, nftToDecorate?.owner)
          )
        );

      // store decorate event
      const { id } = await context.db.insert(decorateBannyEvent).values({
        ...getEventParams({ event, context }),
        bannyBodyId: event.args.bannyBodyId,
        outfitIds: event.args.outfitIds.map((o) => o),
        backgroundId: event.args.backgroundId,
        tokenUri: decoratedTokenUri,
        tokenUriMetadata: parseTokenUri(decoratedTokenUri),
      });
      await insertActivityEvent("decorateBannyEvent", {
        id,
        event,
        context,
        projectId: projectId(context.chain.id),
      });

      // update tokenUri of ALL banny NFTs of owner, to make sure we update any Bannys that may have an outfit removed
      await Promise.all(
        ownerBannys.map((_nft) =>
          context.client
            .readContract({
              abi: JB721TiersHookAbi,
              address: BANNY_RETAIL_HOOK,
              functionName: "tokenURI",
              args: [_nft.tokenId] as const,
            })
            .then((tokenUri) => {
              const metadata = parseTokenUri<{
                outfitIds: bigint[];
                backgroundId?: bigint;
              }>(tokenUri);

              const customized =
                !!metadata &&
                (metadata.outfitIds.length > 0 ||
                  (!!metadata.backgroundId &&
                    metadata.backgroundId !== BigInt(0)));

              return context.db.update(nft, _nft).set({
                tokenUri,
                metadata,
                customized,
                ...(customized && _nft.tokenId === tokenId // only update customizedAt for Banny being dressed
                  ? {
                      customizedAt: Number(event.block.timestamp),
                    }
                  : {}),
              });
            })
        )
      );
    } catch (e) {
      console.error("Banny721TokenUriResolver:DecorateBanny", e);
    }
  }
);

ponder.on(
  "Banny721TokenUriResolver:SetSvgContent",
  async ({ event, context }) => {
    try {
      const hook = BANNY_RETAIL_HOOK;
      const { id: chainId } = context.chain;
      const tierId = Number(event.args.upc);

      const svg = await getBannySvg({ context, tierId: event.args.upc });

      const _nftTier = await context.db.find(nftTier, {
        chainId,
        hook,
        tierId,
      });

      if (!_nftTier) {
        throw new Error("Missing NFT tier");
      }

      await context.db
        .update(nftTier, {
          chainId,
          hook,
          tierId,
        })
        .set({ svg });

      // Now we need to update NFTs who are wearing the Tier, so that their tokenURI will reflect the new SVG contents.
      // We don't have a good way to figure out which NFTs may be wearing the tier, so we update all body NFTs, and all NFTs of the same tierId.
      const tokenIdsToUpdate = await context.db.sql
        .select({ tokenId: nft.tokenId })
        .from(nft)
        .where(
          and(
            eq(nft.chainId, chainId),
            eq(nft.hook, hook),
            or(eq(nft.category, 1), eq(nft.category, _nftTier.category))
          )
        );

      await Promise.all(
        tokenIdsToUpdate.map(async ({ tokenId }) => {
          const tokenUri = await context.client.readContract({
            abi: JB721TiersHookAbi,
            address: hook,
            functionName: "tokenURI",
            args: [tokenId],
          });

          return context.db
            .update(nft, {
              chainId,
              hook: hook,
              tokenId,
            })
            .set({
              tokenUri,
              metadata: parseTokenUri(tokenUri),
            });
        })
      );
    } catch (e) {
      console.error(
        "Banny721TokenUriResolver:SetSvgContent",
        context.chain.id,
        event.args.upc,
        e
      );
    }
  }
);

ponder.on(
  "Banny721TokenUriResolver:SetProductName",
  async ({ event, context }) => {
    try {
      const tier = await tierOf({
        context,
        hook: BANNY_RETAIL_HOOK,
        tierId: event.args.upc,
      });

      await context.db
        .update(nftTier, {
          hook: BANNY_RETAIL_HOOK,
          chainId: context.chain.id,
          tierId: Number(event.args.upc),
        })
        .set({
          resolvedUri: tier.resolvedUri,
          encodedIpfsUri: tier.encodedIPFSUri,
        });
    } catch (e) {
      console.error("Banny721TokenUriResolver:SetProductName", e);
    }
  }
);

ponder.on(
  "Banny721TokenUriResolver:SetSvgBaseUri",
  async ({ event, context }) => {
    try {
      const tiers = await getAllTiers({ context, hook: BANNY_RETAIL_HOOK });

      await Promise.all(
        tiers.map(async ({ id, resolvedUri, encodedIPFSUri }) =>
          context.db
            .update(nftTier, {
              hook: BANNY_RETAIL_HOOK,
              chainId: context.chain.id,
              tierId: id,
            })
            .set({
              resolvedUri: resolvedUri,
              metadata: parseTokenUri(resolvedUri),
              encodedIpfsUri: encodedIPFSUri,
              svg: await getBannySvg({ context, tierId: BigInt(id) }),
            })
        )
      );
    } catch (e) {
      console.error("Banny721TokenUriResolver:SetSvgBaseUri", e);
    }
  }
);
