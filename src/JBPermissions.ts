import { ponder } from "ponder:registry";
import {
  operatorPermissionsSetEvent,
  permissionHolder,
  project,
} from "ponder:schema";
import { getVersion } from "./util/getVersion";
import { insertActivityEvent } from "./util/activityEvent";
import { getEventParams } from "./util/getEventParams";

// https://github.com/rev-net/revnet-core-v5/blob/024d584cbb765d6466787ac6dac0326cbb146db4/src/REVDeployer.sol#L538
const REVNET_OPERATOR_PERMISSIONS_V5 = [17, 25, 24, 6, 18, 30];
const REVNET_OPERATOR_PERMISSIONS_V4 = [17, 25, 6, 18, 30];
const REVNET_OPERATOR_PERMISSIONS_V6 = [19, 29, 28, 7, 35, 30, 31, 22, 23];

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
        version === 6
          ? REVNET_OPERATOR_PERMISSIONS_V6
          : version === 5
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
        // Recompute isRevnetOperator on every write — a later OperatorPermissionsSet that
        // revokes an operator (empty permissionIds, e.g. from REVOwner.setOperatorOf rotating
        // the operator) must clear the flag on the old holder's existing row. Updating only
        // `permissions` left a stale `isRevnetOperator: true`, so a rotated-away operator kept
        // showing up in `permissionHolders(where: { isRevnetOperator: true })`.
        .onConflictDoUpdate({
          permissions: [...permissionIds],
          isRevnetOperator,
        });

      if (_project) {
        const { id } = await context.db.insert(operatorPermissionsSetEvent).values({
          ...getEventParams({ event, context }),
          projectId,
          suckerGroupId: _project.suckerGroupId,
          version,
          account,
          operator,
          permissions: [...permissionIds],
          packed: event.args.packed,
          isRevnetOperator,
        });

        await insertActivityEvent("operatorPermissionsSetEvent", {
          id,
          event,
          context,
          projectId,
          suckerGroupId: _project.suckerGroupId,
          version,
        });
      }
    } catch (e) {
      console.error("JBPermissions:OperatorPermissionsSet", e);
    }
  }
);
