import { and, arrayOverlaps, eq, inArray, ne, or } from "drizzle-orm";
import { ponder } from "ponder:registry";
import {
  _sucker,
  activityEvent,
  project,
  projectCreateEvent,
  suckerGroup,
} from "ponder:schema";
import { getVersion } from "./util/getVersion";

ponder.on("JBSuckersRegistry:SuckerDeployedFor", async ({ event, context }) => {
  try {
    const { projectId: _projectId, sucker: _suckerAddress } = event.args;
    const projectId = Number(_projectId);
    const chainId = context.chain.id;

    // towLowerCase() all addresses for consistency
    const suckerAddress = _suckerAddress.toLowerCase() as `0x${string}`;

    const version = getVersion(event, "jbSuckersRegistry");

    const thisProject = await context.db.find(project, {
      chainId,
      projectId,
      version,
    });

    if (!thisProject) {
      throw new Error("Missing project");
    }

    // NOTE: using promise.all() at any point in this function throws duplicate key errors on unrelated tables. Bug?

    // First we look for other suckers that may overlap by address or projectId.
    const matchingSuckers = await context.db.sql.query._sucker.findMany({
      where: and(
        or(
          eq(_sucker.address, suckerAddress), // Match would have been emitted by a project on a different chain linking to this project. (May be only 1)
          and(eq(_sucker.projectId, projectId), eq(_sucker.chainId, chainId)) // Match would have been emitted by this project on this chain to link projects on other chains. (May be multiple)
        ),
        eq(_sucker.version, version)
      ),
      with: { project: true },
    });

    // Groups are assembled as suckers are created. Multiple "partial" groups may be created before all sucker events linking the projects have been indexed.
    // Look for any groups that may already contain this project or sucker address. There may be one other group containing this sucker address, or multiple groups containing this project.
    const matchingGroups = await context.db.sql.query.suckerGroup.findMany({
      where: and(
        or(
          arrayOverlaps(suckerGroup.addresses, [suckerAddress]),
          arrayOverlaps(suckerGroup.projects, [thisProject.id])
        ),
        eq(suckerGroup.version, version)
      ),
    });

    if (matchingSuckers.length || matchingGroups.length) {
      // We've found matching suckers or groups, that we must consolidate into a new group.

      const newGroupAddresses = [suckerAddress];
      const newGroupProjects = [thisProject.id];

      matchingSuckers.forEach((s) => {
        // Add any affiliated addresses from matching suckers
        if (!newGroupAddresses.includes(s.address)) {
          newGroupAddresses.push(s.address);
        }
        // Add any affiliated projects from matching suckers
        if (!newGroupProjects.includes(s.project.id)) {
          newGroupProjects.push(s.project.id);
        }
      });

      // Add any affiliated projects or addresses from matching groups
      matchingGroups.forEach((g) => {
        g.addresses.forEach((a) => {
          if (!newGroupAddresses.includes(a)) newGroupAddresses.push(a);
        });
        g.projects.forEach((p) => {
          if (!newGroupProjects.includes(p)) newGroupProjects.push(p);
        });
      });

      const groupProjectsTokenSupplies = (
        await context.db.sql.query.project.findMany({
          where: inArray(project.id, newGroupProjects),
        })
      ).reduce((acc, curr) => acc + curr.tokenSupply, BigInt(0));

      // Create a new group from affiliated projects and addresses
      const newSuckerGroup = await context.db.insert(suckerGroup).values({
        projects: newGroupProjects,
        addresses: newGroupAddresses,
        tokenSupply: groupProjectsTokenSupplies,
        createdAt: Number(event.block.timestamp),
        version,
      });

      // Link all affiliated projects to the newly created sucker group
      for (const p of newGroupProjects) {
        const _project = await context.db.sql.query.project.findFirst({
          where: eq(project.id, p),
        });

        if (_project) {
          await context.db
            .update(project, _project)
            .set({ suckerGroupId: newSuckerGroup.id });
        }
      }

      // Assume any other overlapping groups are incomplete/redundant, delete them
      await context.db.sql
        .delete(suckerGroup)
        .where(
          and(
            ne(suckerGroup.id, newSuckerGroup.id),
            or(
              arrayOverlaps(suckerGroup.addresses, [suckerAddress]),
              arrayOverlaps(suckerGroup.projects, [thisProject.id])
            ),
            eq(suckerGroup.version, version)
          )
        );

      // Update any existing tables with suckerGroupId pointing to old suckerGroup
      await context.db.sql
        .update(projectCreateEvent)
        .set({ suckerGroupId: newSuckerGroup.id })
        .where(eq(projectCreateEvent.suckerGroupId, thisProject.suckerGroupId));
      await context.db.sql
        .update(activityEvent)
        .set({ suckerGroupId: newSuckerGroup.id })
        .where(eq(activityEvent.suckerGroupId, thisProject.suckerGroupId));
    }

    // Finally, create the sucker for this event which may be used by this function in later transactions.
    await context.db.insert(_sucker).values({
      chainId,
      projectId,
      address: suckerAddress,
      version,
    });
  } catch (e) {
    console.error("JBSuckersRegistry:SuckerDeployedFor", e);
  }
});
