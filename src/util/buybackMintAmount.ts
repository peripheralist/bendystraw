import type { Context } from "ponder:registry";
import { pendingBuybackMint, swapEvent } from "ponder:schema";
import { usdPerAccountingTokenAtBlock } from "./usdPrice";

// The buyback hook's Mint names no token. The terminal emits HookAfterRecordPay
// for the same hook call as soon as it returns, carrying the forwarded token's
// currency, so a Mint parks its row under that call and the HookAfterRecordPay
// prices it: no trace. Payments nested in the hook call run before its Mint
// (swap, then leftover), so each finishes Mint then HookAfterRecordPay before
// the outer Mint parks under the same key.
// ponytail: a payment nested AFTER the outer Mint (only a custom project
// token's mint callback can make one) re-parks or claims under the same key:
// the outer rate is left null, or, if that nested call had no leftover Mint,
// priced in the nested payment's currency. Trace those transactions if one
// ever appears.

type MintKey = { txHash: `0x${string}`; terminal: `0x${string}`; projectId: number };

export async function parkBuybackMint(
  context: Context,
  key: MintKey & { hook: `0x${string}`; swapEventId: string }
) {
  const { hook, swapEventId } = key;
  await context.db
    .insert(pendingBuybackMint)
    .values({ chainId: context.chain.id, ...key })
    .onConflictDoUpdate({ hook, swapEventId });
}

/** Prices the Mint this hook call parked, if any. Never throws. */
export async function priceBuybackMint(
  context: Context,
  key: MintKey & { hook: `0x${string}`; currency: bigint }
) {
  try {
    const id = { chainId: context.chain.id, txHash: key.txHash, terminal: key.terminal, projectId: key.projectId };
    const pending = await context.db.find(pendingBuybackMint, id);
    if (!pending || pending.hook.toLowerCase() !== key.hook.toLowerCase()) return;
    await context.db.delete(pendingBuybackMint, id);
    await context.db.update(swapEvent, { id: pending.swapEventId }).set({
      accountingTokenUsdRate: await usdPerAccountingTokenAtBlock({
        context,
        version: 6,
        projectId: key.projectId,
        currency: key.currency,
      }),
    });
  } catch (e) {
    console.error(`buyback mint: not priced, rate left null: chain ${context.chain.id} tx ${key.txHash}`, e);
  }
}
