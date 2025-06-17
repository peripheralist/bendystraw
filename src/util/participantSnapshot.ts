import { Context } from "ponder:registry";
import { participantSnapshot, participant } from "ponder:schema";

type _Participant = typeof participant.$inferSelect;

export function setParticipantSnapshot({
  participant,
  context,
  event,
}: {
  participant: _Participant;
  context: Context;
  event: {
    block: {
      number: bigint;
      timestamp: bigint;
    };
  };
}) {
  const { chainId, projectId, address, ...partialParticipant } = participant;

  return context.db
    .insert(participantSnapshot)
    .values({
      ...participant,
      block: Number(event.block.number),
      timestamp: Number(event.block.timestamp),
    })
    .onConflictDoUpdate({
      ...partialParticipant,
      block: Number(event.block.number),
      timestamp: Number(event.block.timestamp),
    });
}
