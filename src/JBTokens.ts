import { ponder } from "ponder:registry";
import {
  burnEvent,
  deployErc20Event,
  participant,
  project,
} from "ponder:schema";
import { getEventParams } from "./util/getEventParams";
import { insertActivityEvent } from "./util/activityEvent";

ponder.on("JBTokens:Burn", async ({ event, context }) => {
  const { projectId: _projectId, holder, count } = event.args;
  const projectId = Number(_projectId);
  const { chainId } = context.network;

  let burnedCredits = BigInt(0);

  await Promise.all([
    context.db
      .update(participant, { chainId, projectId, address: holder })
      .set((p) => {
        const _p = p;

        // Only update stakedBalance, since erc20Balance will be updated by erc20 handler
        if (count > _p.creditBalance) {
          burnedCredits = _p.creditBalance;
          _p.creditBalance = BigInt(0);
        } else {
          burnedCredits = count;
          _p.creditBalance = _p.creditBalance - count;
        }

        _p.balance = _p.creditBalance + _p.erc20Balance;

        return _p;
      }),

    context.db
      .insert(burnEvent)
      .values({
        ...getEventParams({ event, context }),
        projectId,
        holder,
        amount: count,
        creditAmount: burnedCredits,
        erc20Amount: BigInt(0),
      })
      .then(({ id }) =>
        insertActivityEvent("burnEvent", { id, event, context, projectId })
      ),

    context.db
      .update(project, {
        chainId,
        projectId,
      })
      .set((p) => ({
        tokenSupply: p.tokenSupply - count,
      })),
  ]);
});

ponder.on("JBTokens:ClaimTokens", async ({ event, context }) => {
  try {
    const { projectId: _projectId, holder, count, creditBalance } = event.args;
    const projectId = Number(_projectId);
    const { chainId } = context.network;

    // participant will have been created by previous transferCredits event to holder

    // only update staked balance, erc20 balance will be updated by erc20 mint event
    await context.db
      .update(participant, {
        chainId,
        address: holder,
        projectId,
      })
      .set((p) => ({
        creditBalance: creditBalance - count,
        balance: p.erc20Balance + creditBalance - count,
      }));
  } catch (e) {
    console.error("JBTokens:ClaimTokens", e);
  }
});

ponder.on("JBTokens:TransferCredits", async ({ event, context }) => {
  try {
    const { projectId: _projectId, holder, recipient, count } = event.args;
    const projectId = Number(_projectId);
    const { chainId } = context.network;

    await Promise.all([
      // update sender participant
      context.db
        .update(participant, {
          chainId,
          address: holder,
          projectId,
        })
        .set((p) => ({
          creditBalance: p.creditBalance - count,
          balance: p.creditBalance - count + p.erc20Balance,
        })),

      // insert/update receiver participant
      context.db
        .insert(participant)
        .values({
          chainId,
          address: recipient,
          projectId,
          balance: count,
          creditBalance: count,
        })
        .onConflictDoUpdate((p) => ({
          creditBalance: p.creditBalance + count,
          balance: p.creditBalance + count + p.erc20Balance,
        })),
    ]);
  } catch (e) {
    console.error("JBTokens:TransferCredits", e);
  }
});

ponder.on("JBTokens:DeployERC20", async ({ event, context }) => {
  try {
    const { symbol, token, name, projectId } = event.args;

    await context.db
      .insert(deployErc20Event)
      .values({
        ...getEventParams({ event, context }),
        projectId: Number(projectId),
        symbol,
        token,
        name,
      })
      .then(({ id }) =>
        insertActivityEvent("deployErc20Event", {
          id,
          event,
          context,
          projectId,
        })
      );
  } catch (e) {
    console.error("JBTokens:DeployERC20", e);
  }
});

ponder.on("JBTokens:Mint", async ({ event, context }) => {
  try {
    const {
      tokensWereClaimed,
      projectId: _projectId,
      holder,
      count,
    } = event.args;
    const { chainId } = context.network;
    const projectId = Number(_projectId);

    /**
     * We're only concerned with updating unclaimed token balance.
     * "Claimed" ERC20 tokens will be handled separately.
     */
    if (tokensWereClaimed) return;

    await Promise.all([
      // insert/update receiver participant
      context.db
        .insert(participant)
        .values({
          chainId,
          address: holder,
          projectId,
          creditBalance: count,
          balance: count,
        })
        .onConflictDoUpdate((p) => ({
          creditBalance: p.creditBalance + count,
          balance: p.creditBalance + p.erc20Balance + count,
        })),

      // update project
      context.db
        .update(project, {
          chainId,
          projectId,
        })
        .set((p) => ({
          tokenSupply: p.tokenSupply + count,
        })),
    ]);
  } catch (e) {
    console.error("JBTokens:Mint", e);
  }
});
