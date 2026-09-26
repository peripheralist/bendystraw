import { Context, ponder } from "ponder:registry";
import { project, stickyEvent, stickyPosition } from "ponder:schema";
import { getEventParams } from "./util/getEventParams";

// StickyHook only exists on V6.
const version = 6;

type PositionUpdate = {
  stakedBalance?: bigint;
  streakStartedAt?: number | null;
  completedStreak?: number;
};

// StickyHook emits StreakStarted and StreakEnded before the Staked or Unstaked of the same
// change, so any of the four events may be the first one to write a holder's position.
async function recordPosition({
  context,
  projectId,
  holder,
  timestamp,
  update,
}: {
  context: Context;
  projectId: number;
  holder: `0x${string}`;
  timestamp: number;
  update: PositionUpdate;
}) {
  const chainId = context.chain.id;
  const _project = await context.db.find(project, { chainId, projectId, version });
  if (!_project) throw new Error("Missing project");

  const { completedStreak, ...fields } = update;

  await context.db
    .insert(stickyPosition)
    .values({
      chainId,
      projectId,
      version,
      holder,
      suckerGroupId: _project.suckerGroupId,
      longestCompletedStreak: completedStreak ?? 0,
      createdAt: timestamp,
      updatedAt: timestamp,
      ...fields,
    })
    .onConflictDoUpdate((p) => ({
      ...fields,
      longestCompletedStreak: Math.max(
        p.longestCompletedStreak,
        completedStreak ?? 0
      ),
      updatedAt: timestamp,
    }));

  return _project.suckerGroupId;
}

ponder.on("StickyHook:Staked", async ({ event, context }) => {
  try {
    const { projectId: _projectId, holder, payer, count, stakedBalance } =
      event.args;
    const projectId = Number(_projectId);

    const suckerGroupId = await recordPosition({
      context,
      projectId,
      holder,
      timestamp: Number(event.block.timestamp),
      update: { stakedBalance },
    });

    await context.db.insert(stickyEvent).values({
      ...getEventParams({ event, context }),
      version,
      projectId,
      suckerGroupId,
      holder,
      type: "staked",
      count,
      stakedBalance,
      payer,
    });
  } catch (e) {
    console.error("StickyHook:Staked", e);
  }
});

ponder.on("StickyHook:Unstaked", async ({ event, context }) => {
  try {
    const { projectId: _projectId, holder, count, stakedBalance } = event.args;
    const projectId = Number(_projectId);

    const suckerGroupId = await recordPosition({
      context,
      projectId,
      holder,
      timestamp: Number(event.block.timestamp),
      update: { stakedBalance },
    });

    await context.db.insert(stickyEvent).values({
      ...getEventParams({ event, context }),
      version,
      projectId,
      suckerGroupId,
      holder,
      type: "unstaked",
      count,
      stakedBalance,
    });
  } catch (e) {
    console.error("StickyHook:Unstaked", e);
  }
});

ponder.on("StickyHook:StreakStarted", async ({ event, context }) => {
  try {
    const { projectId: _projectId, holder } = event.args;
    const projectId = Number(_projectId);
    const timestamp = Number(event.block.timestamp);

    const suckerGroupId = await recordPosition({
      context,
      projectId,
      holder,
      timestamp,
      update: { streakStartedAt: timestamp },
    });

    await context.db.insert(stickyEvent).values({
      ...getEventParams({ event, context }),
      version,
      projectId,
      suckerGroupId,
      holder,
      type: "streakStarted",
    });
  } catch (e) {
    console.error("StickyHook:StreakStarted", e);
  }
});

ponder.on("StickyHook:StreakEnded", async ({ event, context }) => {
  try {
    const { projectId: _projectId, holder } = event.args;
    const projectId = Number(_projectId);
    const duration = Number(event.args.duration);

    const suckerGroupId = await recordPosition({
      context,
      projectId,
      holder,
      timestamp: Number(event.block.timestamp),
      update: { streakStartedAt: null, completedStreak: duration },
    });

    await context.db.insert(stickyEvent).values({
      ...getEventParams({ event, context }),
      version,
      projectId,
      suckerGroupId,
      holder,
      type: "streakEnded",
      duration,
    });
  } catch (e) {
    console.error("StickyHook:StreakEnded", e);
  }
});
