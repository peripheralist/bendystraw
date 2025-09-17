import { ponder } from "ponder:registry";
import { permissionHolder } from "ponder:schema";
import { getVersion } from "./util/getVersion";

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

      const version = getVersion(event, "jbPermissions");

      await context.db
        .insert(permissionHolder)
        .values({
          chainId,
          projectId,
          operator,
          account,
          permissions: [...permissionIds],
          version,
        })
        .onConflictDoUpdate({ permissions: [...permissionIds] });
    } catch (e) {
      console.error("JBPermissions:OperatorPermissionsSet", e);
    }
  }
);
