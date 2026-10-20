import type { Context } from "ponder:registry";
import { pendingBuybackMint, swapEvent } from "ponder:schema";
import { usdPerAccountingTokenAtBlock } from "./usdPrice";

// The buyback hook's Mint names no token. The terminal emits HookAfterRecordPay
// for the same hook call as soon as it returns, carrying the forwarded token's
// currency, so a Mint parks its row under that call and the HookAfterRecordPay
// prices it: no trace.
//
// Pay is emitted before a payment's hooks run, so a payment nested in the hook
// call before its Mint (the swap) finishes before the outer Mint parks. One
// nested after the Mint (a project token's mint, transfer or burn calling back)
// emits its Pay while the Mint is parked; that Mint is then abandoned with a
// null rate, since the next HookAfterRecordPay may be the nested one.

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

/** A Pay to the parked key means a nested payment: leave the parked Mint unpriced. Never throws. */
export async function abandonBuybackMint(context: Context, key: MintKey) {
  try {
    const id = { chainId: context.chain.id, ...key };
    if (!(await context.db.find(pendingBuybackMint, id))) return;
    await context.db.delete(pendingBuybackMint, id);
    console.error(`buyback mint: nested payment after it, rate left null: chain ${context.chain.id} tx ${key.txHash}`);
  } catch (e) {
    console.error(`buyback mint: not abandoned: chain ${context.chain.id} tx ${key.txHash}`, e);
  }
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
