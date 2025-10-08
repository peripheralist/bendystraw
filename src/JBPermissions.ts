import { ponder } from "ponder:registry";
import { permissionHolder, project } from "ponder:schema";
import { getVersion } from "./util/getVersion";

// https://github.com/rev-net/revnet-core-v5/blob/024d584cbb765d6466787ac6dac0326cbb146db4/src/REVDeployer.sol#L538
const REVNET_OPERATOR_PERMISSIONS_V5 = [17, 25, 24, 6, 18, 30];
const REVNET_OPERATOR_PERMISSIONS_V4 = [17, 25, 6, 18, 30];

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

      const _project = await context.db.find(project, {
        chainId,
        version,
        projectId,
      });

      const revnetOperatorPermissions =
        version === 5
          ? REVNET_OPERATOR_PERMISSIONS_V5
          : REVNET_OPERATOR_PERMISSIONS_V4;

      const isRevnetOperator =
        _project?.isRevnet &&
        revnetOperatorPermissions.every((id) => permissionIds.includes(id));

      await context.db
        .insert(permissionHolder)
        .values({
          chainId,
          projectId,
          operator,
          account,
          permissions: [...permissionIds],
          version,
          isRevnetOperator,
        })
        .onConflictDoUpdate({ permissions: [...permissionIds] });
    } catch (e) {
      console.error("JBPermissions:OperatorPermissionsSet", e);
    }
  }
);
