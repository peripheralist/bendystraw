import { ponder } from "ponder:registry";
import { project, projectPayer } from "ponder:schema";
import { getVersion } from "./util/getVersion";

ponder.on("JBProjectPayerDeployer:DeployProjectPayer", async ({ event, context }) => {
  try {
    const {
      projectPayer: projectPayerAddress,
      defaultProjectId,
      defaultBeneficiary,
      defaultMemo,
      defaultMetadata,
      defaultAddToBalance,
      owner,
      caller,
    } = event.args;
    const projectId = Number(defaultProjectId);
    const version = getVersion(event, "jbProjectPayerDeployer");

    const _project = await context.db.find(project, {
      chainId: context.chain.id,
      projectId,
      version,
    });

    if (!_project) {
      throw new Error("Missing project");
    }

    await context.db.insert(projectPayer).values({
      address: projectPayerAddress.toLowerCase() as `0x${string}`,
      chainId: context.chain.id,
      projectId,
      suckerGroupId: _project.suckerGroupId,
      version,
      createdAt: Number(event.block.timestamp),
      owner: owner.toLowerCase() as `0x${string}`,
      deployer: caller.toLowerCase() as `0x${string}`,
      defaultBeneficiary: defaultBeneficiary.toLowerCase() as `0x${string}`,
      defaultMemo,
      defaultMetadata,
      defaultAddToBalance,
    });
  } catch (e) {
    console.error("JBProjectPayerDeployer:DeployProjectPayer", e);
  }
});
