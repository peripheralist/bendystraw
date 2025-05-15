import { Context } from "hono";
import { db } from "ponder:api";

export async function getParticipantSnapshots(c: Context) {
  try {
    const { suckerGroupId, block } = await c.req.parseBody<{
      suckerGroupId: string;
      block: string;
    }>();

    if (typeof suckerGroupId !== "string") {
      c.status(400);
      return c.text("suckerGroupId must be a string");
    }

    if (typeof block !== "string" || isNaN(parseInt(block))) {
      c.status(400);
      return c.text("Block must be a number");
    }

    const snapshots = await db.execute(`SELECT ps.*
FROM ParticipantSnapshot ps
JOIN (
  SELECT address, MAX(block) AS maxBlock
  FROM ParticipantSnapshot
  WHERE block <= ${block}
  GROUP BY address
) latest
ON ps.address = latest.address AND ps.block = latest.maxBlock;`);

    console.log("asdf", snapshots);

    return c.json(snapshots);

    // await db
    //   .select()
    //   .from(schema.participantSnapshot)
    //   .where(
    //     and(
    //       eq(schema.participantSnapshot.suckerGroupId, suckerGroupId),
    //       lte(schema.participantSnapshot.block, parseInt(block))
    //     )
    //   );
  } catch (e) {
    console.error("Error", c.req.path, e);
  }
}
