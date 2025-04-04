import { and, eq, or } from "ponder";
import { ponder } from "ponder:registry";
import { decorateBannyEvent, nft, nftTier } from "ponder:schema";
import { JB721TiersHookAbi } from "../abis/JB721TiersHookAbi";
import { BANNY_RETAIL_HOOK } from "./constants/bannyHook";
import { getAllTiers } from "./util/getAllTiers";
import { getBannySvg } from "./util/getBannySvg";
import { getEventParams } from "./util/getEventParams";
import { tierOf } from "./util/tierOf";

ponder.on(
  "Banny721TokenUriResolver:DecorateBanny",
  async ({ event, context }) => {
    try {
      const tokenUri = await context.client.readContract({
        abi: JB721TiersHookAbi,
        address: BANNY_RETAIL_HOOK,
        functionName: "tokenURI",
        args: [event.args.bannyBodyId],
      });

      await Promise.all([
        // update nft tokenUri
        await context.db
          .update(nft, {
            chainId: context.network.chainId,
            hook: BANNY_RETAIL_HOOK,
            tokenId: event.args.bannyBodyId,
          })
          .set({
            tokenUri,
          }),
        // store decorate event
        await context.db.insert(decorateBannyEvent).values({
          ...getEventParams({ event, context }),
          bannyBodyId: event.args.bannyBodyId,
          outfitIds: event.args.outfitIds.map((o) => o),
          backgroundId: event.args.backgroundId,
          tokenUri,
        }),
      ]);
    } catch (e) {
      console.error("Banny721TokenUriResolver:DecorateBanny", e);
    }
  }
);

ponder.on(
  "Banny721TokenUriResolver:SetSvgContent",
  async ({ event, context }) => {
    try {
      const svg = await getBannySvg({ context, tierId: event.args.upc });

      const _nftTier = await context.db.find(nftTier, {
        chainId: context.network.chainId,
        hook: BANNY_RETAIL_HOOK,
        tierId: Number(event.args.upc),
      });

      await context.db
        .update(nftTier, {
          chainId: context.network.chainId,
          hook: BANNY_RETAIL_HOOK,
          tierId: Number(event.args.upc),
        })
        .set({ svg });

      // Now we need to update NFTs who are wearing the Tier, so that their tokenURI will reflect the new SVG contents.
      // We don't have a good way to figure out which NFTs may be wearing the tier, so we update all body NFTs, and all NFTs of the same tierId.
      const tokenIdsToUpdate = await context.db.sql
        .select({ tokenId: nft.tokenId })
        .from(nft)
        .where(
          and(
            eq(nft.chainId, context.network.chainId),
            eq(nft.hook, BANNY_RETAIL_HOOK),
            or(eq(nft.category, 1), eq(nft.category, _nftTier?.category || 0))
          )
        );

      await Promise.all(
        tokenIdsToUpdate.map(async ({ tokenId }) => {
          const tokenUri = await context.client.readContract({
            abi: JB721TiersHookAbi,
            address: BANNY_RETAIL_HOOK,
            functionName: "tokenURI",
            args: [tokenId],
          });

          return context.db
            .update(nft, {
              chainId: context.network.chainId,
              hook: BANNY_RETAIL_HOOK,
              tokenId,
            })
            .set({ tokenUri });
        })
      );
    } catch (e) {
      console.error("Banny721TokenUriResolver:DecorateBanny", e);
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
          chainId: context.network.chainId,
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

      const tiersWithSvgs = await Promise.all(
        tiers.map(async (t) => ({
          ...t,
          svg: await getBannySvg({ context, tierId: BigInt(t.id) }),
        }))
      );

      await Promise.all(
        tiersWithSvgs.map(({ id, resolvedUri, encodedIPFSUri, svg }) =>
          context.db
            .update(nftTier, {
              hook: BANNY_RETAIL_HOOK,
              chainId: context.network.chainId,
              tierId: id,
            })
            .set({
              resolvedUri: resolvedUri,
              encodedIpfsUri: encodedIPFSUri,
              svg,
            })
        )
      );
    } catch (e) {
      console.error("Banny721TokenUriResolver:SetSvgBaseUri", e);
    }
  }
);
