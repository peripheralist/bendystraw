import { ponder } from "ponder:registry";
import { permissionHolder } from "ponder:schema";

ponder.on(
  "JBPermissions:OperatorPermissionsSet",
  async ({ event, context }) => {
    const {
      projectId: _projectId,
      operator,
      permissionIds,
      account,
    } = event.args;
    const { chainId } = context.network;
    const projectId = Number(_projectId);

    try {
      const holder = await context.db.find(permissionHolder, {
        chainId,
        projectId,
        operator,
        account,
      });

      if (holder) {
        await context.db
          .update(permissionHolder, {
            chainId,
            projectId,
            operator,
            account,
          })
          .set({
            permissions: [...permissionIds],
          });
      } else {
        await context.db.insert(permissionHolder).values({
          chainId,
          projectId,
          operator,
          account,
          permissions: [...permissionIds],
        });
      }
    } catch (e) {
      console.error("JBPermissions:OperatorPermissionsSet", e);
    }
  }
);
