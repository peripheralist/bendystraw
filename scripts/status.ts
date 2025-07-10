import axios from "axios";
import * as dotenv from "dotenv";
import { NETWORKS } from "../src/constants/networks";
import { getBsStatus } from "../src/lib/getBsStatus";

const webhookUrl = dotenv.config({ path: ".env.local" }).parsed?.STATUS_WEBHOOK;

async function main() {
  if (!webhookUrl) return;

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
