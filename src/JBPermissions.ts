import { ponder } from "ponder:registry";
import { permissionHolder, project } from "ponder:schema";

ponder.on(
  "JBPermissions:OperatorPermissionsSet",
  async ({ event, context }) => {
    try {
      const {
        projectId: _projectId,
        operator,
        permissionIds,
        account,
      } = event.args;
      const { chainId } = context.network;
      const projectId = Number(_projectId);

      const _project = await context.db.find(project, {
        projectId,
        chainId: context.network.chainId,
      });

      if (!_project) {
        throw new Error("Missing project");
      }

      await context.db
        .insert(permissionHolder)
        .values({
          chainId,
          projectId,
          suckerGroupId: _project.suckerGroupId,
          operator,
          account,
          permissions: [...permissionIds],
        })
        .onConflictDoUpdate({ permissions: [...permissionIds] });
    } catch (e) {
      console.error("JBPermissions:OperatorPermissionsSet", e);
    }
  }
);
