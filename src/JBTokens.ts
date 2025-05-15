import { ponder } from "ponder:registry";
import {
  burnEvent,
  deployErc20Event,
  participant,
  project,
  suckerGroup,
} from "ponder:schema";
import { insertActivityEvent } from "./util/activityEvent";
import { getEventParams } from "./util/getEventParams";
import { setParticipantSnapshot } from "./util/participantSnapshot";

ponder.on("JBTokens:Burn", async ({ event, context }) => {
  try {
    const { projectId: _projectId, holder, count } = event.args;
    const projectId = Number(_projectId);
    const { chainId } = context.network;

    let burnedCredits = BigInt(0);

    const _project = await context.db.find(project, { projectId, chainId });

    if (!_project) {
      throw new Error("Missing project");
    }

    // update holder participant
    await context.db
      .update(participant, { chainId, projectId, address: holder })
      .set((p) => {
        const _p = p;

        _p.suckerGroupId = _project.suckerGroupId;

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
      });

    // update suckerGroup tokenSupply
    const { suckerGroupId } = await context.db
      .update(project, {
        chainId,
        projectId,
      })
      .set(({ tokenSupply }) => ({
        tokenSupply: tokenSupply - count,
      }));

    // update sucker group
    await context.db
      .update(suckerGroup, { id: suckerGroupId })
      .set(({ tokenSupply }) => ({
        tokenSupply: tokenSupply - count,
      }));

    // insert event
    const { id } = await context.db.insert(burnEvent).values({
      ...getEventParams({ event, context }),
      projectId,
      holder,
      amount: count,
      creditAmount: burnedCredits,
      erc20Amount: BigInt(0),
    });
    await insertActivityEvent("burnEvent", { id, event, context, projectId });
  } catch (e) {
    console.error("JBTokens:Burn", e);
  }
});

ponder.on("JBTokens:ClaimTokens", async ({ event, context }) => {
  try {
    const { projectId: _projectId, holder, count, creditBalance } = event.args;
    const projectId = Number(_projectId);
    const { chainId } = context.network;

    const _project = await context.db.find(project, { projectId, chainId });

    if (!_project) {
      throw new Error("Missing project");
    }

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
        suckerGroupId: _project.suckerGroupId,
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

    const _project = await context.db.find(project, { projectId, chainId });

    if (!_project) {
      throw new Error("Missing project");
    }

    // update sender participant
    const sender = await context.db
      .update(participant, {
        chainId,
        address: holder,
        projectId,
      })
      .set((p) => ({
        creditBalance: p.creditBalance - count,
        balance: p.creditBalance - count + p.erc20Balance,
        suckerGroupId: _project.suckerGroupId,
      }));
    await setParticipantSnapshot({ participant: sender, context, event });

    // insert/update receiver participant
    const receiver = await context.db
      .insert(participant)
      .values({
        chainId,
        address: recipient,
        projectId,
        balance: count,
        creditBalance: count,
        suckerGroupId: _project.suckerGroupId,
      })
      .onConflictDoUpdate((p) => ({
        creditBalance: p.creditBalance + count,
        balance: p.creditBalance + count + p.erc20Balance,
        suckerGroupId: _project.suckerGroupId,
      }));
    await setParticipantSnapshot({ participant: receiver, context, event });
  } catch (e) {
    console.error("JBTokens:TransferCredits", e);
  }
});

ponder.on("JBTokens:DeployERC20", async ({ event, context }) => {
  try {
    const { symbol, token, name, projectId } = event.args;

    const { id } = await context.db.insert(deployErc20Event).values({
      ...getEventParams({ event, context }),
      projectId: Number(projectId),
      symbol,
      token,
      name,
    });

    await insertActivityEvent("deployErc20Event", {
      id,
      event,
      context,
      projectId,
    });
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

    // update project
    const { suckerGroupId } = await context.db
      .update(project, {
        chainId,
        projectId,
      })
      .set(({ tokenSupply }) => ({
        tokenSupply: tokenSupply + count,
      }));

    // update sucker group
    await context.db
      .update(suckerGroup, { id: suckerGroupId })
      .set(({ tokenSupply }) => ({
        tokenSupply: tokenSupply + count,
      }));

    /**
     * We're only concerned with updating unclaimed token balance.
     * "Claimed" ERC20 tokens will be handled separately.
     */
    if (tokensWereClaimed) return;

    // insert/update receiver participant
    const receiver = await context.db
      .insert(participant)
      .values({
        chainId,
        address: holder,
        projectId,
        creditBalance: count,
        balance: count,
        suckerGroupId,
      })
      .onConflictDoUpdate((p) => ({
        creditBalance: p.creditBalance + count,
        balance: p.creditBalance + p.erc20Balance + count,
      }));

    await setParticipantSnapshot({ participant: receiver, context, event });
  } catch (e) {
    console.error("JBTokens:Mint", e);
  }
});
