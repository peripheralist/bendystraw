import { and, eq } from "ponder";
import { Context, ponder } from "ponder:registry";
import { participant, project } from "ponder:schema";

// HomerunDeployer only exists on V6.
const version = 6;

// Participants copy the project's flags when they are written, so update any that already exist.
async function markHomerunProject(context: Context, projectId: number) {
  const chainId = context.chain.id;

  await context.db
    .update(project, { chainId, projectId, version })
    .set({ isHomerun: true });

  await context.db.sql
    .update(participant)
    .set({ isHomerun: true })
    .where(
      and(
        eq(participant.chainId, chainId),
        eq(participant.projectId, projectId),
        eq(participant.version, version)
      )
    );
}

ponder.on("HomerunDeployer:FundLaunched", async ({ event, context }) => {
  try {
    await markHomerunProject(context, Number(event.args.projectId));
  } catch (e) {
    console.error("HomerunDeployer:FundLaunched", e);
  }
});

ponder.on("HomerunDeployer:IncomeDeployed", async ({ event, context }) => {
  try {
    await markHomerunProject(context, Number(event.args.incomeProjectId));
  } catch (e) {
    console.error("HomerunDeployer:IncomeDeployed", e);
  }
});
