import { ponder } from "ponder:registry";
import {
  burnEvent,
  deployErc20Event,
  manualBurnEvent,
  participant,
  project,
} from "ponder:schema";
import { isAddressEqual } from "viem";
import { ADDRESS } from "./constants/address";
import { insertActivityEvent } from "./util/activityEvent";
import { getEventParams } from "./util/getEventParams";
import { getVersion } from "./util/getVersion";
import { onProjectStatsUpdated } from "./util/onProjectStatsUpdated";
import { setParticipantSnapshot } from "./util/participantSnapshot";

ponder.on("JBTokens:Burn", async ({ event, context }) => {
  try {
    const { projectId: _projectId, holder, count } = event.args;
    const projectId = Number(_projectId);
    const { id: chainId } = context.chain;

    let burnedCredits = BigInt(0);

    const version = getVersion(event, "jbTokens");

    const _project = await context.db.find(project, {
      projectId,
      chainId,
      version,
    });

    if (!_project) {
      throw new Error("Missing project");
    }

    // update holder participant
    const _holder = await context.db
      .update(participant, { chainId, projectId, address: holder, version })
      .set(({ chainId, projectId, address, ...partial }) => {
        partial.suckerGroupId = _project.suckerGroupId;

        // Only update stakedBalance, since erc20Balance will be updated by erc20 handler
        if (count > partial.creditBalance) {
          burnedCredits = partial.creditBalance;
          partial.creditBalance = BigInt(0);
        } else {
          burnedCredits = count;
          partial.creditBalance = partial.creditBalance - count;
        }

        partial.balance = partial.creditBalance + partial.erc20Balance;

        return partial;
      });
    await setParticipantSnapshot({ participant: _holder, context, event });

    // update project tokenSupply
    const updatedProject = await context.db
      .update(project, {
        chainId,
        projectId,
        version,
      })
      .set(({ tokenSupply }) => ({
        tokenSupply: tokenSupply - count,
      }));

    await onProjectStatsUpdated({
      projectId,
      version,
      event,
      context,
      _project: updatedProject,
    });

    const isCashOutEvent = isAddressEqual(
      version === 5 ? ADDRESS.jbTokens5 : ADDRESS.jbTokens,
      event.args.caller
    );

    if (!isCashOutEvent) {
      // insert event
      const { id } = await context.db.insert(manualBurnEvent).values({
        ...getEventParams({ event, context }),
        suckerGroupId: _project.suckerGroupId,
        projectId,
        amount: count,
        creditAmount: burnedCredits,
        erc20Amount: BigInt(0),
        version,
      });
      await insertActivityEvent("manualBurnEvent", {
        id,
        event,
        context,
        projectId,
        suckerGroupId: _project.suckerGroupId,
        version,
      });
    }

    // insert event
    const { id } = await context.db.insert(burnEvent).values({
      ...getEventParams({ event, context }),
      suckerGroupId: _project.suckerGroupId,
      projectId,
      amount: count,
      creditAmount: burnedCredits,
      erc20Amount: BigInt(0),
      version,
    });
    await insertActivityEvent("burnEvent", {
      id,
      event,
      context,
      projectId,
      suckerGroupId: _project.suckerGroupId,
      version,
    });
  } catch (e) {
    console.error("JBTokens:Burn", e);
  }
});

ponder.on("JBTokens:ClaimTokens", async ({ event, context }) => {
  try {
    const { projectId: _projectId, holder, count, creditBalance } = event.args;
    const projectId = Number(_projectId);
    const { id: chainId } = context.chain;

    const version = getVersion(event, "jbTokens");

    const _project = await context.db.find(project, {
      projectId,
      chainId,
      version,
    });

    if (!_project) {
      throw new Error("Missing project");
    }

    // participant will have been created by previous transferCredits event to holder

    // only update staked balance, erc20 balance will be updated by erc20 mint event
    const _participant = await context.db
      .update(participant, {
        chainId,
        address: holder,
        projectId,
        version,
      })
      .set((p) => ({
        // balance does not change, only exchanging credits for erc20
        creditBalance: creditBalance - count,
        suckerGroupId: _project.suckerGroupId,
      }));
    await setParticipantSnapshot({ participant: _participant, context, event });
  } catch (e) {
    console.error("JBTokens:ClaimTokens", e);
  }
});

ponder.on("JBTokens:TransferCredits", async ({ event, context }) => {
  try {
    const { projectId: _projectId, holder, recipient, count } = event.args;
    const projectId = Number(_projectId);
    const { id: chainId } = context.chain;

    const version = getVersion(event, "jbTokens");

    const _project = await context.db.find(project, {
      projectId,
      chainId,
      version,
    });

    if (!_project) {
      throw new Error("Missing project");
    }

    // update sender participant
    const sender = await context.db
      .update(participant, {
        chainId,
        address: holder,
        projectId,
        version,
      })
      .set((p) => ({
        creditBalance: p.creditBalance - count,
        balance: p.balance - count,
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
        createdAt: Number(event.block.timestamp),
        balance: count,
        creditBalance: count,
        suckerGroupId: _project.suckerGroupId,
        isRevnet: _project.isRevnet,
        version,
      })
      .onConflictDoUpdate((p) => ({
        creditBalance: p.creditBalance + count,
        balance: p.balance + count,
        suckerGroupId: _project.suckerGroupId,
        isRevnet: _project.isRevnet,
      }));
    await setParticipantSnapshot({ participant: receiver, context, event });
  } catch (e) {
    console.error("JBTokens:TransferCredits", e);
  }
});

ponder.on("JBTokens:DeployERC20", async ({ event, context }) => {
  try {
    const { symbol, token, name, projectId } = event.args;

    const version = getVersion(event, "jbTokens");

    const _project = await context.db.find(project, {
      projectId: Number(event.args.projectId),
      chainId: context.chain.id,
      version,
    });

    if (!_project) {
      throw new Error("Missing project");
    }

    const { id } = await context.db.insert(deployErc20Event).values({
      ...getEventParams({ event, context }),
      suckerGroupId: _project.suckerGroupId,
      projectId: Number(projectId),
      symbol,
      token,
      name,
      version,
    });

    await insertActivityEvent("deployErc20Event", {
      id,
      event,
      context,
      projectId,
      suckerGroupId: _project.suckerGroupId,
      version,
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
    const { id: chainId } = context.chain;
    const projectId = Number(_projectId);

    const version = getVersion(event, "jbTokens");

    // update project
    const _project = await context.db.find(project, {
      chainId,
      projectId,
      version,
    });

    if (!_project) {
      throw new Error("Missing project");
    }

    const { suckerGroupId, isRevnet } = _project;

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
        createdAt: Number(event.block.timestamp),
        creditBalance: count,
        balance: count,
        suckerGroupId,
        isRevnet,
        version,
      })
      .onConflictDoUpdate((p) => ({
        creditBalance: p.creditBalance + count,
        balance: p.balance + count,
        suckerGroupId,
        isRevnet,
      }));
    await setParticipantSnapshot({ participant: receiver, context, event });
  } catch (e) {
    console.error("JBTokens:Mint", e);
  }
});
