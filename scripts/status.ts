import axios from "axios";
import * as dotenv from "dotenv";
import { NETWORKS } from "../src/constants/networks";
import { getBsStatus } from "../src/lib/getBsStatus";
import { IS_DEV } from "../src/constants/dev";

if (IS_DEV) {
  dotenv.config({ path: ".env.local" });
}

const webhookUrl = process.env.STATUS_WEBHOOK;

async function main() {
  if (!webhookUrl) {
    console.warn("Missing STATUS_WEBHOOK");
    return;
  }

  const statuses = await getBsStatus();

  for (const n of NETWORKS) {
    const { secsBehind, blocksBehind } = statuses[n.id];

    let content = "";
    if (secsBehind > 60 * 10) {
      content = `🚨 ${n.name} is **HURTIN -- ${blocksBehind} blocks (${secsBehind}s) behind!**`;
    } else if (isNaN(secsBehind)) {
      content = `🚨 ${n.name} is **offline**??`;
    } else {
      content = `${n.name} is **chillin** (${secsBehind}s behind)`;
    }

    try {
      await axios.post(webhookUrl, {
        content,
      });

      console.info(content);
    } catch (e) {
      console.error(
        `Error sending webhook: ${n.name}, ${secsBehind} behind, (${
          (e as Error).message
        })`
      );
    }

    await new Promise((r) => setTimeout(() => r(null), 100)); // avoid rate limits
  }
}

main();
