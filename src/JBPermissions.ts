import { ponder } from "ponder:registry";
import { permissionHolder } from "ponder:schema";

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
      const { id: chainId } = context.chain;
      const projectId = Number(_projectId);

      await context.db
        .insert(permissionHolder)
        .values({
          chainId,
          projectId,
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
