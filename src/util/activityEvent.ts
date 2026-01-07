import { activityEvent } from "ponder:schema";
import { getEventParams } from "./getEventParams";
import { Version } from "./getVersion";

/**
 * Inserts an activity event record.
 *
 * @param suckerGroupId - Pass the suckerGroupId directly to avoid redundant DB lookup.
 */
export const insertActivityEvent = async <
  Args extends { caller: `0x${string}` } | {}
>(
  key: Extract<keyof typeof activityEvent.$inferInsert, `${string}Event`>,
  {
    event,
    context,
    id,
    projectId,
    suckerGroupId,
    version,
  }: Parameters<typeof getEventParams<Args>>[0] & {
    id: string;
    projectId: bigint | number;
    suckerGroupId: string;
    version: Version;
  }
) => {
  const params = getEventParams<typeof event.args>({
    event,
    context,
  });

  return context.db.insert(activityEvent).values({
    ...params, // exclude id from params to use generated id
    [key]: id, // NOTE: using the id from `getEventParams` ensures that if this function is called in the same function that inserts the target event, the ID will match
    type: key,
    projectId: Number(projectId),
    suckerGroupId,
    version,
  });
};
