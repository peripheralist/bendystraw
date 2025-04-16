import { activityEvent, project } from "ponder:schema";
import { getEventParams } from "./getEventParams";

export const insertActivityEvent = async <
  Args extends { caller: `0x${string}` } | {}
>(
  key: Extract<keyof typeof activityEvent.$inferInsert, `${string}Event`>,
  {
    event,
    context,
    projectId,
  }: Parameters<typeof getEventParams<Args>>[0] & {
    projectId: bigint | number;
  }
) => {
  const { id, ...params } = getEventParams<typeof event.args>({
    event,
    context,
  });

  const _project = await context.db.find(project, {
    chainId: params.chainId,
    projectId: Number(projectId),
  });

  return context.db.insert(activityEvent).values({
    ...params, // exclude id from params to use generated id
    [key]: id, // NOTE: using the id from `getEventParams` ensures that if this function is called in the same function that inserts the target event, the ID will match
    projectId: Number(projectId),
    suckerGroup: _project?.suckerGroup,
  });
};
