import type { Context } from "ponder:registry";
import {
  accountingSyncEvent,
  bridgeToOutboxEvent,
  bridgeToRemoteEvent,
} from "ponder:schema";
import { insertActivityEvent } from "./activityEvent";
import { getEventParams } from "./getEventParams";
import type { Version } from "./getVersion";

// Identity of the sucker emitting a bridge event, resolved by the caller (which already
// reads projectId/peer/peerChainId/version to maintain suckerTransaction). peerChainId is the
// destination chain, so a consuming UI can render "sending/sent X to {chain}".
export type SuckerInfo = {
  projectId: number;
  suckerGroupId: string;
  peer: `0x${string}`;
  peerChainId: number;
  version: Version;
};

// ponytail: event typed loosely — Ponder's per-event generics don't survive being passed to a
// helper, and getEventParams/insertActivityEvent already accept this structural shape.
type BridgeEvent = Parameters<typeof getEventParams>[0]["event"] & {
  args: {
    token: `0x${string}`;
    index: bigint;
    root: `0x${string}`;
  };
  log: { address: `0x${string}` };
};

// "sending" step — InsertToOutboxTree queued a move into the sucker outbox tree.
export async function recordBridgeToOutbox(
  event: BridgeEvent & {
    args: {
      beneficiary: `0x${string}`;
      projectTokenCount: bigint;
      terminalTokenAmount: bigint;
      hashed: `0x${string}`;
    };
  },
  context: Context,
  info: SuckerInfo
) {
  const { id } = await context.db.insert(bridgeToOutboxEvent).values({
    ...getEventParams({ event, context }),
    projectId: info.projectId,
    suckerGroupId: info.suckerGroupId,
    version: info.version,
    sucker: event.log.address,
    peer: info.peer,
    peerChainId: info.peerChainId,
    token: event.args.token,
    beneficiary: event.args.beneficiary,
    projectTokenCount: event.args.projectTokenCount,
    terminalTokenAmount: event.args.terminalTokenAmount,
    index: Number(event.args.index),
    root: event.args.root,
    hashed: event.args.hashed,
  });
  await insertActivityEvent("bridgeToOutboxEvent", {
    id,
    event,
    context,
    projectId: info.projectId,
    suckerGroupId: info.suckerGroupId,
    version: info.version,
  });
}

// "sent" step — RootToRemote shipped the outbox root to the remote chain.
export async function recordBridgeToRemote(
  event: BridgeEvent & { args: { nonce: bigint } },
  context: Context,
  info: SuckerInfo
) {
  const { id } = await context.db.insert(bridgeToRemoteEvent).values({
    ...getEventParams({ event, context }),
    projectId: info.projectId,
    suckerGroupId: info.suckerGroupId,
    version: info.version,
    sucker: event.log.address,
    peer: info.peer,
    peerChainId: info.peerChainId,
    token: event.args.token,
    index: Number(event.args.index),
    nonce: event.args.nonce,
    root: event.args.root,
  });
  await insertActivityEvent("bridgeToRemoteEvent", {
    id,
    event,
    context,
    projectId: info.projectId,
    suckerGroupId: info.suckerGroupId,
    version: info.version,
  });
}

// ponytail: event typed loosely — see BridgeEvent note above.
type AccountingSyncEvent = Parameters<typeof getEventParams>[0]["event"] & {
  args: { sourceTimestamp: bigint };
  log: { address: `0x${string}` };
};

// Cross-chain accounting "gossip" sync (AccountingDataSynced, V6). sourceTimestamp is packed
// `(block.timestamp << 128) | sequence`; we store it raw and also the unpacked `>> 128` seconds.
export async function recordAccountingSync(
  event: AccountingSyncEvent,
  context: Context,
  info: Omit<SuckerInfo, "peer">
) {
  const sourceTimestamp = event.args.sourceTimestamp;
  const { id } = await context.db.insert(accountingSyncEvent).values({
    ...getEventParams({ event, context }),
    projectId: info.projectId,
    suckerGroupId: info.suckerGroupId,
    version: info.version,
    sucker: event.log.address,
    peerChainId: info.peerChainId,
    sourceTimestamp,
    sourceTimestampSeconds: sourceTimestamp >> 128n,
  });
  await insertActivityEvent("accountingSyncEvent", {
    id,
    event,
    context,
    projectId: info.projectId,
    suckerGroupId: info.suckerGroupId,
    version: info.version,
  });
}
