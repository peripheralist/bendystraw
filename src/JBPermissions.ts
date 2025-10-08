import { ponder } from "ponder:registry";
import { permissionHolder } from "ponder:schema";
import { getVersion } from "./util/getVersion";

// https://github.com/rev-net/revnet-core-v5/blob/024d584cbb765d6466787ac6dac0326cbb146db4/src/REVDeployer.sol#L538
const DEFAULT_OPERATOR_PERMISSIONS = [17, 25, 24, 6, 18, 30];

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
          isOperator: DEFAULT_OPERATOR_PERMISSIONS.every((id) =>
            permissionIds.includes(id)
          ), // true if permissionIds include ALL default operator permissions
        })
        .onConflictDoUpdate({ permissions: [...permissionIds] });
    } catch (e) {
      console.error("JBPermissions:OperatorPermissionsSet", e);
    }
  }
);
