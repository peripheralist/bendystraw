import { Context } from "hono";
import { db } from "ponder:api";

export async function getParticipantSnapshots(c: Context) {
  try {
    const { suckerGroupId, timestamp } = await c.req.parseBody<{
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

    const snapshots = await db.execute(`SELECT ps.*
SELECT ps.*
FROM ParticipantSnapshot ps
JOIN (
  SELECT address, MAX(timestamp) AS maxTimestamp
  FROM ParticipantSnapshot
  WHERE timestamp <= ${timestamp}
  AND suckerGroupId = ${suckerGroupId}
  GROUP BY address
) latest
ON ps.address = latest.address 
AND ps.timestamp = latest.maxTimestamp
AND ps.suckerGroupId = ${suckerGroupId};`);

    console.log("asdf", snapshots);

    return c.json(snapshots);
  } catch (e) {
    console.error("Error", c.req.path, e);
  }
}
