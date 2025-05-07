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
    };
  };
}) {
  return context.db
    .insert(participantSnapshot)
    .values({ ...participant, block: Number(event.block.number) })
    .onConflictDoUpdate({ ...participant, block: Number(event.block.number) });
}
