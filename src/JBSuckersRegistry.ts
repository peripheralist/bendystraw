import {
  and,
  arrayContained,
  arrayOverlaps,
  eq,
  ne,
  or,
  inArray,
} from "drizzle-orm";
import { ponder } from "ponder:registry";
import {
  activityEvent,
  project,
  projectCreateEvent,
  sucker,
  suckerGroup,
} from "ponder:schema";

ponder.on("JBSuckersRegistry:SuckerDeployedFor", async ({ event, context }) => {
  try {
    const { projectId: _projectId, sucker: address } = event.args;
    const projectId = Number(_projectId);
    const chainId = context.chain.id;

    const thisProject = await context.db.find(project, {
      chainId,
      projectId,
    });

    if (!thisProject) {
      throw new Error("Missing project");
    }

    // NOTE: we towLowerCase() addresses because storing in an array may alter case.
    // NOTE: using promise.all() at any point in this function throws duplicate key errors on unrelated tables. Bug?

    // First we look for other suckers that may overlap by address or projectId.

    // Would have been emitted by a project on a different chain linking to this project. (May be only 1)
    const addressMatchingSucker = await context.db.sql.query.sucker.findFirst({
      where: eq(sucker.address, address.toLowerCase() as `0x${string}`),
      with: { project: true },
    });

    // Would have been emitted by this project to link projects on different chains. (May be multiple)
    const projectMatchingSuckers = await context.db.sql.query.sucker.findMany({
      where: and(eq(sucker.projectId, projectId), eq(sucker.chainId, chainId)),
      with: { project: true },
    });

    // Groups are assembled as suckers are created. Multiple "partial" groups may be created before all sucker events linking the projects have been indexed.
    // Look for any groups that may already contain this project or sucker address. There may be one other group containing this sucker address, or multiple groups containing this project.
    const matchingGroups = await context.db.sql.query.suckerGroup.findMany({
      where: or(
        arrayOverlaps(suckerGroup.addresses, [
          address.toLowerCase() as `0x${string}`,
        ]),
        arrayOverlaps(suckerGroup.projects, [thisProject.id])
      ),
    });

    if (
      addressMatchingSucker ||
      projectMatchingSuckers ||
      matchingGroups.length
    ) {
      // We've found matching suckers or groups, that we must consolidate into a new group.

      // Add any affiliated addresses from matching suckers
      const groupAddresses = [address.toLowerCase()];
      projectMatchingSuckers.forEach((s) => {
        if (!groupAddresses.includes(s.address.toLowerCase())) {
          groupAddresses.push(s.address.toLowerCase());
        }
      });

      // Add any affiliated projects from matching suckers
      const groupProjects = [thisProject.id];
      if (
        addressMatchingSucker?.project.id &&
        !groupProjects.includes(addressMatchingSucker.project.id)
      ) {
        groupProjects.push(addressMatchingSucker.project.id);
      }
      projectMatchingSuckers.forEach((s) => {
        if (!groupProjects.includes(s.project.id)) {
          groupProjects.push(s.project.id);
        }
      });

      // Add any affiliated projects or addresses from matching groups
      matchingGroups.forEach((g) => {
        g.addresses.forEach((a) => {
          if (!groupAddresses.includes(a.toLowerCase())) {
            groupAddresses.push(a.toLowerCase());
          }
        });
        g.projects.forEach((p) => {
          if (!groupProjects.includes(p)) groupProjects.push(p);
        });
      });

      const groupProjectsTokenSupplies = (
        await context.db.sql
          .select()
          .from(project)
          .where(inArray(project.id, groupProjects))
      ).reduce((acc, curr) => acc + curr.tokenSupply, BigInt(0));

      // Create a new group from affiliated projects and addresses
      const newSuckerGroup = await context.db.insert(suckerGroup).values({
        projects: groupProjects,
        addresses: groupAddresses as `0x${string}`[],
        tokenSupply: groupProjectsTokenSupplies,
        createdAt: Number(event.block.timestamp),
      });

      // Link all affiliated projects to the newly created sucker group
      for (const p of groupProjects) {
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
              arrayOverlaps(suckerGroup.addresses, [
                address.toLowerCase() as `0x${string}`,
              ]),
              arrayOverlaps(suckerGroup.projects, [thisProject.id])
            )
          )
        );

      // Update any existing tables with suckerGroupId pointing to old suckerGroup
      // for (const table of [projectCreateEvent, activityEvent] as const) {
      //   await context.db.sql
      //     .update(table)
      //     .set({ suckerGroupId: newSuckerGroup.id })
      //     .where(eq(table.suckerGroupId, suckerGroup.id));
      // }
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
    await context.db.insert(sucker).values({
      chainId,
      projectId,
      address: address.toLowerCase() as `0x${string}`,
    });
  } catch (e) {
    console.error("JBSuckersRegistry:SuckerDeployedFor", e);
  }
});
