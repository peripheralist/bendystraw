import { Context } from "ponder:registry";
import { project } from "ponder:schema";

// Sticky only exists on V6.
export const stickyVersion = 6;

// Sticky rows carry their project's suckerGroupId, read from the project row.
export async function suckerGroupIdOf({
  context,
  projectId,
}: {
  context: Context;
  projectId: number;
}) {
  const _project = await context.db.find(project, {
    chainId: context.chain.id,
    projectId,
    version: stickyVersion,
  });
  if (!_project) throw new Error("Missing project");

  return _project.suckerGroupId;
}
