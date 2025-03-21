import { ponder } from "ponder:registry";
import { decorateBannyEvent, nftTier } from "ponder:schema";
import { JB721TiersHookAbi } from "../abis/JB721TiersHookAbi";
import { JB721TiersHookStoreAbi } from "../abis/JB721TiersHookStoreAbi";
import { BANNY_RETAIL_HOOK } from "./constants";
import { getBannySvg } from "./util/getBannySvg";
import { tierOf } from "./util/tierOf";

ponder.on(
  "Banny721TokenUriResolver:DecorateBanny",
  async ({ event, context }) => {
    try {
      const tokenUri = await context.client.readContract({
        abi: JB721TiersHookAbi,
        address: event.args.hook,
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
        hook: event.args.hook,
        backgroundId: event.args.backgroundId,
        tokenUri,
      });
    } catch (e) {
      console.error("Banny721TokenUriResolver:DecorateBanny", e);
    }
  }
);

ponder.on(
  "Banny721TokenUriResolver:OwnershipTransferred",
  async ({ event, context }) => {
    console.log(event.args);
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

    for (let i = BigInt(0); i < maxTierCall; i += BigInt(1)) {
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
