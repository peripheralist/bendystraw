import { desc, eq } from "ponder";
import { Context } from "ponder:registry";
import { payEvent } from "ponder:schema";

export async function getLatestPayEvent({ context }: { context: Context }) {
  const [latestPayEvent] = await context.db.sql
    .select()
    .from(payEvent)
    .where(eq(payEvent.chainId, context.chain.id))
    .orderBy(desc(payEvent.timestamp), desc(payEvent.logIndex))
    .limit(1);

  return latestPayEvent;
}
