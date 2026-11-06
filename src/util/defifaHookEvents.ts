import { ponder } from "ponder:registry";
import { defifaGame, defifaTierDelegate } from "ponder:schema";
import { gameIdOfHook, insertDefifaEvent } from "./defifa";

/** Delegation, fee-token claim and cash-out-weight events, identical on 2.0's 721 and ERC-1155 hooks. */
export function registerDefifaHookEvents(source: "DefifaHookV2" | "Defifa1155Hook") {
  ponder.on(`${source}:TierDelegateAttestationsChanged`, async ({ event, context }) => {
    const { delegate, tierId, newBalance } = event.args;
    const hook = event.log.address;
    const projectId = await gameIdOfHook(context, hook);
    const row = { attestationUnits: newBalance, updatedAt: Number(event.block.timestamp) };
    await context.db.insert(defifaTierDelegate)
      .values({ chainId: context.chain.id, projectId, hook, tierId: Number(tierId), delegate, ...row })
      .onConflictDoUpdate(row);
  });

  // DelegateChanged carries no tier ID, so it is history only; per-tier units come from the event above.
  ponder.on(`${source}:DelegateChanged`, async ({ event, context }) => {
    const { delegator, toDelegate } = event.args;
    const projectId = await gameIdOfHook(context, event.log.address);
    await insertDefifaEvent({ event, context, projectId, type: "delegateChanged", account: delegator, delegate: toDelegate });
  });

  ponder.on(`${source}:ClaimedTokens`, async ({ event, context }) => {
    const { beneficiary, defifaTokenAmount, baseProtocolTokenAmount } = event.args;
    const projectId = await gameIdOfHook(context, event.log.address);
    await insertDefifaEvent({ event, context, projectId, type: "feeTokensClaimed", account: beneficiary, defifaTokenAmount, baseProtocolTokenAmount });
  });

  ponder.on(`${source}:TierCashOutWeightsSet`, async ({ event, context }) => {
    const projectId = await gameIdOfHook(context, event.log.address);
    const cashOutWeights = event.args.tierWeights.map(({ id, cashOutWeight }) => ({ tierId: Number(id), cashOutWeight: cashOutWeight.toString() }));
    await context.db.update(defifaGame, { chainId: context.chain.id, projectId })
      .set({ cashOutWeights, cashOutWeightsSetAt: Number(event.block.timestamp) });
    await insertDefifaEvent({ event, context, projectId, type: "cashOutWeightsSet" });
  });
}
