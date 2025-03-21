import { ponder } from "ponder:registry";
import { decorateBannyEvent, nft, nftTier } from "ponder:schema";
import { JB721TiersHookAbi } from "../abis/JB721TiersHookAbi";
import { JB721TiersHookStoreAbi } from "../abis/JB721TiersHookStoreAbi";
import { BANNY_RETAIL_HOOK } from "./constants";
import { getBannySvg } from "./util/getBannySvg";
import { tierOf } from "./util/tierOf";
import { and, eq, or } from "ponder";

ponder.on(
  "Banny721TokenUriResolver:DecorateBanny",
  async ({ event, context }) => {
    try {
      const tokenUri = await context.client.readContract({
        abi: JB721TiersHookAbi,
        address: BANNY_RETAIL_HOOK,
        functionName: "tokenURI",
        args: [event.args.backgroundId],
      });

      await context.db.insert(decorateBannyEvent).values({
        chainId: context.network.chainId,
        txHash: event.transaction.hash,
        timestamp: event.block.timestamp,
        bannyBodyId: event.args.bannyBodyId,
        caller: event.args.caller,
        outfitIds: event.args.outfitIds.map((o) => o),
        backgroundId: event.args.backgroundId,
        tokenUri,
      });
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

      const tier = await context.db.find(nftTier, {
        chainId: context.network.chainId,
        hook: BANNY_RETAIL_HOOK,
        tierId: event.args.upc,
      });

      await context.db
        .update(nftTier, {
          chainId: context.network.chainId,
          hook: BANNY_RETAIL_HOOK,
          tierId: event.args.upc,
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
            or(eq(nft.category, 1), eq(nft.category, tier?.category || 0))
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
          tierId: event.args.upc,
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
    const maxTierCall = await context.client.readContract({
      abi: JB721TiersHookStoreAbi,
      address: "0xdc162a8a6decc7f27fd4cff58d69b9cc0c7c2ea1",
      functionName: "maxTierIdOf",
      args: [BANNY_RETAIL_HOOK],
    });

    const tierPromises = [];

    for (let i = BigInt(1); i < maxTierCall; i += BigInt(1)) {
      tierPromises.push(
        Promise.all([
          tierOf({ context, hook: BANNY_RETAIL_HOOK, tierId: i }),
          getBannySvg({ context, tierId: i }),
        ])
      );
    }

    const tiers = await Promise.all(tierPromises);

    await Promise.all(
      tiers.map(([{ id: tierId, resolvedUri, encodedIPFSUri }, svg]) =>
        context.db
          .update(nftTier, {
            hook: BANNY_RETAIL_HOOK,
            chainId: context.network.chainId,
            tierId: BigInt(tierId),
          })
          .set({
            resolvedUri: resolvedUri,
            encodedIpfsUri: encodedIPFSUri,
            svg,
          })
      )
    );
  }
);
