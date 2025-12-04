import { ponder } from "ponder:registry";
import { cashOutTaxSnapshot, project } from "ponder:schema";
import { getVersion } from "./util/getVersion";
import { ADDRESS } from "./constants/address";
import { JBControllerAbi } from "../abis/JBControllerAbi";

ponder.on("JBRulesets:RulesetQueued", async ({ event, context }) => {
  try {
    const version = getVersion(event, "jbRulesets");

    let cashOutTax: number | undefined = undefined;

    for (const address of version == 5
      ? [ADDRESS.jbController5]
      : [ADDRESS.jbController, ADDRESS.jbController4_1]) {
      // if version == 4, we have no way of knowing if we should use jbController or jbController4_1, so we loop
      try {
        const _ruleset = await context.client.readContract({
          address,
          abi: JBControllerAbi,
          functionName: "getRulesetOf",
          args: [event.args.projectId, event.args.rulesetId],
        });

        if (_ruleset[0].cycleNumber) {
          cashOutTax = _ruleset[1].cashOutTaxRate;
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (cashOutTax === undefined) throw new Error("Missing cashOutTax");

    const _project = await context.db.find(project, {
      projectId: Number(event.args.projectId),
      chainId: context.chain.id,
      version,
    });

    if (!_project) {
      throw new Error("Missing project");
    }

    await context.db.insert(cashOutTaxSnapshot).values({
      version,
      projectId: Number(event.args.projectId),
      chainId: context.chain.id,
      suckerGroupId: _project.suckerGroupId,
      rulesetId: event.args.rulesetId,
      cashOutTax,
      start: event.args.mustStartAtOrAfter,
      duration: event.args.duration,
    });
  } catch (e) {
    console.error("JBRulesets:RulesetQueued", e);
  }
});
