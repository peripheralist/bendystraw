import { Context } from "hono";
import { and, desc, eq, lte } from "ponder";
import { db } from "ponder:api";
import { participant, participantSnapshot } from "ponder:schema";
import { Address } from "viem";

// @ts-ignore
BigInt.prototype.toJSON = function () {
  return String(this);
};

export async function getParticipantSnapshots(c: Context) {
  try {
    const { suckerGroupId, timestamp } = await c.req.json<{
      suckerGroupId: string;
      timestamp: string;
    }>();

    if (typeof suckerGroupId !== "string") {
      c.status(400);
      return c.text("suckerGroupId must be a string");
    }

    if (typeof timestamp !== "string" || isNaN(parseInt(timestamp))) {
      c.status(400);
      return c.text("timestamp must be a number");
    }

    const participants = await db.query.participant.findMany({
      where: and(
        eq(participant.suckerGroupId, suckerGroupId),
        lte(participant.createdAt, parseInt(timestamp))
      ),
    });

    // de-duped addresses list
    const addresses = participants.reduce(
      (acc, { address }) => (acc.includes(address) ? acc : [...acc, address]),
      [] as Address[]
    );

    const snapshots = await Promise.all(
      addresses.map((address) =>
        db.query.participantSnapshot.findFirst({
          orderBy: desc(participantSnapshot.timestamp),
          where: and(
            eq(participantSnapshot.address, address),
            lte(participantSnapshot.timestamp, parseInt(timestamp))
          ),
        })
      )
    );

    return c.json(snapshots);
  } catch (e) {
    console.error("Error getting participants snapshot", e);

    c.status(500);
    return c.json({ error: (e as Error).message });
  }
}
