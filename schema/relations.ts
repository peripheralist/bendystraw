import { relations } from "ponder";

import { permissionHolder, projectCreateEvent } from "ponder:schema";
import { addToBalanceEvent } from "./addToBalanceEvent";
import { autoIssueEvent } from "./autoIssueEvent";
import { burnEvent } from "./burnEvent";
import { cashOutTokensEvent } from "./cashoutTokensEvent";
import { decorateBannyEvent } from "./decorateBannyEvent";
import { deployErc20Event } from "./deployErc20Event";
import { mintNftEvent } from "./mintNftEvent";
import { mintTokensEvent } from "./mintTokensEvent";
import { nft } from "./nft";
import { nftHook } from "./nftHook";
import { nftTier } from "./nftTier";
import { participant } from "./participant";
import { payEvent } from "./payEvent";
import { project } from "./project";
import { sendPayoutsEvent } from "./sendPayoutsEvent";
import { sendPayoutToSplitEvent } from "./sendPayoutToSplitEvent";
import { sendReservedTokensToSplitEvent } from "./sendReservedTokensToSplitEvent";
import { sendReservedTokensToSplitsEvent } from "./sendReservedTokensToSplitsEvent";
import { storeAutoIssuanceAmountEvent } from "./storeAutoIssuanceAmountEvent";
import { useAllowanceEvent } from "./useAllowanceEvent";
import { wallet } from "./wallet";

export const nftRelations = relations(nft, ({ one }) => ({
  tier: one(nftTier, {
    fields: [nft.tierId, nft.chainId],
    references: [nftTier.tierId, nftTier.chainId],
  }),
  project: one(project, {
    fields: [nft.projectId, nft.chainId],
    references: [project.projectId, project.chainId],
  }),
  hook: one(nftHook, {
    fields: [nft.hook, nft.chainId],
    references: [nftHook.address, nftHook.chainId],
  }),
  owner: one(participant, {
    fields: [nft.owner, nft.chainId],
    references: [participant.address, participant.chainId],
  }),
  wallet: one(wallet, {
    fields: [nft.owner],
    references: [wallet.address],
  }),
}));

export const nftTierRelations = relations(nftTier, ({ many, one }) => ({
  nfts: many(nft),
  project: one(project, {
    fields: [nftTier.projectId, nftTier.chainId],
    references: [project.projectId, project.chainId],
  }),
  hook: one(nftHook, {
    fields: [nftTier.hook, nftTier.chainId],
    references: [nftHook.address, nftHook.chainId],
  }),
}));

export const nftHookRelations = relations(nftHook, ({ many, one }) => ({
  nfts: many(nft),
  nftTiers: many(nftTier),
  project: one(project, {
    fields: [nftHook.projectId, nftHook.chainId],
    references: [project.projectId, project.chainId],
  }),
}));

export const projectRelations = relations(project, ({ many, one }) => ({
  nfts: many(nft),
  nftHooks: many(nftHook),
  mintTokensEvents: many(mintTokensEvent),
  sendPayoutsEvents: many(sendPayoutsEvent),
  sendPayoutToSplitEvents: many(sendPayoutToSplitEvent),
  sendReservedTokensToSplitsEvents: many(sendReservedTokensToSplitsEvent),
  sendReservedTokensToSplitEvents: many(sendReservedTokensToSplitEvent),
  addToBalanceEvents: many(addToBalanceEvent),
  cashOutTokensEvents: many(cashOutTokensEvent),
  useAllowanceEvents: many(useAllowanceEvent),
  payEvents: many(payEvent),
  mintNftEvents: many(mintNftEvent),
  burnEvents: many(burnEvent),
  deployErc20Events: many(deployErc20Event),
  permissionHolders: many(permissionHolder),
}));

export const projectCreateEventRelations = relations(
  projectCreateEvent,
  ({ one }) => ({
    project: one(project, {
      fields: [projectCreateEvent.projectId, projectCreateEvent.chainId],
      references: [project.projectId, project.chainId],
    }),
  })
);

export const mintTokensEventRelations = relations(
  mintTokensEvent,
  ({ one }) => ({
    project: one(project, {
      fields: [mintTokensEvent.projectId, mintTokensEvent.chainId],
      references: [project.projectId, project.chainId],
    }),
  })
);

export const decorateBannyEventRelations = relations(
  decorateBannyEvent,
  ({ one }) => ({
    bannyNft: one(nft, {
      fields: [decorateBannyEvent.bannyBodyId, decorateBannyEvent.chainId],
      references: [nft.tokenId, nft.chainId],
    }),
  })
);

export const sendReservedTokensToSplitsEventRelations = relations(
  sendReservedTokensToSplitsEvent,
  ({ one }) => ({
    project: one(project, {
      fields: [
        sendReservedTokensToSplitsEvent.projectId,
        sendReservedTokensToSplitsEvent.chainId,
      ],
      references: [project.projectId, project.chainId],
    }),
  })
);

export const sendReservedTokensToSplitEventRelations = relations(
  sendReservedTokensToSplitEvent,
  ({ one }) => ({
    project: one(project, {
      fields: [
        sendReservedTokensToSplitEvent.projectId,
        sendReservedTokensToSplitEvent.chainId,
      ],
      references: [project.projectId, project.chainId],
    }),
  })
);

export const sendPayoutToSplitEventRelations = relations(
  sendPayoutToSplitEvent,
  ({ one }) => ({
    project: one(project, {
      fields: [
        sendPayoutToSplitEvent.projectId,
        sendPayoutToSplitEvent.chainId,
      ],
      references: [project.projectId, project.chainId],
    }),
  })
);

export const addToBalanceEventRelations = relations(
  addToBalanceEvent,
  ({ one }) => ({
    project: one(project, {
      fields: [addToBalanceEvent.projectId, addToBalanceEvent.chainId],
      references: [project.projectId, project.chainId],
    }),
  })
);

export const sendPayoutsEventRelations = relations(
  sendPayoutsEvent,
  ({ one }) => ({
    project: one(project, {
      fields: [sendPayoutsEvent.projectId, sendPayoutsEvent.chainId],
      references: [project.projectId, project.chainId],
    }),
  })
);

export const cashOutTokensEventRelations = relations(
  cashOutTokensEvent,
  ({ one }) => ({
    project: one(project, {
      fields: [cashOutTokensEvent.projectId, cashOutTokensEvent.chainId],
      references: [project.projectId, project.chainId],
    }),
  })
);

export const useAllowanceEventRelations = relations(
  useAllowanceEvent,
  ({ one }) => ({
    project: one(project, {
      fields: [useAllowanceEvent.projectId, useAllowanceEvent.chainId],
      references: [project.projectId, project.chainId],
    }),
  })
);

export const payEventRelations = relations(payEvent, ({ one }) => ({
  project: one(project, {
    fields: [payEvent.projectId, payEvent.chainId],
    references: [project.projectId, project.chainId],
  }),
}));

export const burnEventRelations = relations(burnEvent, ({ one }) => ({
  project: one(project, {
    fields: [burnEvent.projectId, burnEvent.chainId],
    references: [project.projectId, project.chainId],
  }),
}));

export const deployErc20EventRelations = relations(
  deployErc20Event,
  ({ one }) => ({
    project: one(project, {
      fields: [deployErc20Event.projectId, deployErc20Event.chainId],
      references: [project.projectId, project.chainId],
    }),
  })
);

export const mintNftEventRelations = relations(mintNftEvent, ({ one }) => ({
  project: one(project, {
    fields: [mintNftEvent.projectId, mintNftEvent.chainId],
    references: [project.projectId, project.chainId],
  }),
  tier: one(nftTier, {
    fields: [mintNftEvent.tierId, mintNftEvent.chainId],
    references: [nftTier.tierId, nftTier.chainId],
  }),
  nft: one(nft, {
    fields: [mintNftEvent.tokenId, mintNftEvent.chainId],
    references: [nft.tokenId, nft.chainId],
  }),
}));

export const walletRelations = relations(wallet, ({ many }) => ({
  participants: many(participant),
  nfts: many(nft),
}));

export const participantRelations = relations(participant, ({ one, many }) => ({
  wallet: one(wallet, {
    fields: [participant.address],
    references: [wallet.address],
  }),
  nfts: many(nft),
}));

export const permissionHolderRelations = relations(
  permissionHolder,
  ({ one }) => ({
    project: one(project, {
      fields: [permissionHolder.chainId, permissionHolder.projectId],
      references: [project.chainId, project.projectId],
    }),
  })
);

export const storeAutoIssuanceAmountEventRelations = relations(
  storeAutoIssuanceAmountEvent,
  ({ one }) => ({
    project: one(project, {
      fields: [
        storeAutoIssuanceAmountEvent.chainId,
        storeAutoIssuanceAmountEvent.projectId,
      ],
      references: [project.chainId, project.projectId],
    }),
  })
);

export const autoIssueEventRelations = relations(autoIssueEvent, ({ one }) => ({
  project: one(project, {
    fields: [autoIssueEvent.chainId, autoIssueEvent.projectId],
    references: [project.chainId, project.projectId],
  }),
}));
