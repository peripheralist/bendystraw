import axios from "axios";
import * as dotenv from "dotenv";
import { NETWORKS } from "../src/constants/networks";
import { getBsStatus } from "../src/lib/getBsStatus";

dotenv.config({ path: ".env.local" });

const webhookUrl = process.env.STATUS_WEBHOOK;

async function main() {
  if (!webhookUrl) {
    console.warn("Missing STATUS_WEBHOOK");
    return;
  }

  const statuses = await getBsStatus();

  const fields = [];

  let shouldAlert = false;

  for (const { id, name } of NETWORKS) {
    const { secsBehind, blocksBehind } = statuses[id];

    let value = "";
    if (secsBehind > 60 * 10) {
      value = `🚨 ${blocksBehind} blocks, ${secsBehind} seconds behind!`;
      shouldAlert = true;
    } else if (isNaN(secsBehind)) {
      value = `🚨 Offline?`;
      shouldAlert = true;
    } else {
      value = `${blocksBehind} blocks, ${secsBehind} seconds behind`;
    }

    fields.push({
      name,
      value,
    });

    console.info(`${name}: ${value}`);
  }

  try {
    await axios.post(webhookUrl, {
      content: shouldAlert
        ? "**<@666841845099134988> Bendystraw has issues‼️**"
        : "Bendystraw is chillin 🟢",
      embeds: [{ fields }],
    });
  } catch (e) {
    console.error(`Error sending webhook: ${(e as Error).message}`);
  }
}

main();
