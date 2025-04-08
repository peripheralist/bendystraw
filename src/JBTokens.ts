import { ponder } from "ponder:registry";
import {
  burnEvent,
  deployErc20Event,
  participant,
  project,
} from "ponder:schema";
import { getEventParams } from "./util/getEventParams";

// ponder.on("JBTokens:Burn", async ({ event, context }) => {
//   const { projectId: _projectId, holder, count } = event.args;
//   const projectId = Number(_projectId);
//   const { chainId } = context.network;

//   let burnedCredits = BigInt(0);

//   await context.db
//     .update(participant, { chainId, projectId, address: holder })
//     .set((p) => {
//       const _p = p;

//       // Only update stakedBalance, since erc20Balance will be updated by erc20 handler
//       if (count > _p.creditBalance) {
//         burnedCredits = _p.creditBalance;
//         _p.creditBalance = BigInt(0);
//       } else {
//         burnedCredits = count;
//         _p.creditBalance = _p.creditBalance - count;
//       }

//       _p.balance = _p.creditBalance + _p.erc20Balance;

//       return _p;
//     });

//   await Promise.all([
//     context.db.insert(burnEvent).values({
//       ...getEventParams({ event, context }),
//       projectId,
//       holder,
//       amount: count,
//       creditAmount: burnedCredits,
//       erc20Amount: BigInt(0),
//     }),

//     context.db
//       .update(project, {
//         chainId,
//         projectId,
//       })
//       .set((p) => ({
//         tokenSupply: p.tokenSupply - count,
//       })),
//   ]);
// });

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

    const [_, receiverParticipant] = await Promise.all([
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

      // get receiver participant
      context.db.find(participant, {
        chainId,
        address: recipient,
        projectId,
      }),
    ]);

    if (receiverParticipant) {
      await context.db
        .update(participant, {
          chainId,
          address: recipient,
          projectId,
        })
        .set((p) => ({
          creditBalance: p.creditBalance + count,
          balance: p.creditBalance + count + p.erc20Balance,
        }));
    } else {
      await context.db.insert(participant).values({
        chainId,
        address: recipient,
        projectId,
        balance: count,
        creditBalance: count,
      });
    }
  } catch (e) {
    console.error("JBTokens:TransferCredits", e);
  }
});

ponder.on("JBTokens:DeployERC20", async ({ event, context }) => {
  console.log(
    "ASDF DeployERC20",
    context.network.chainId,
    event.args.projectId
  );

  try {
    const { symbol, token, name, projectId } = event.args;

    await context.db.insert(deployErc20Event).values({
      ...getEventParams({ event, context }),
      projectId: Number(projectId),
      symbol,
      token,
      name,
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

    /**
     * We're only concerned with updating unclaimed token balance.
     * "Claimed" ERC20 tokens will be handled separately.
     */
    if (tokensWereClaimed) return;

    await context.db
      .find(participant, {
        chainId,
        address: holder,
        projectId,
      })
      .then(async (p) => {
        if (p) return;

        await context.db.insert(participant).values({
          chainId,
          address: holder,
          projectId,
        });
      });

    await Promise.all([
      // update receiver participant
      context.db
        .update(participant, {
          chainId,
          address: holder,
          projectId,
        })
        .set((_p) => ({
          creditBalance: _p.creditBalance + count,
          balance: _p.creditBalance + count + _p.erc20Balance,
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
