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
  let alertNetworks = [];

  for (const { id, name } of NETWORKS) {
    const { secsBehind, blocksBehind } = statuses[id];

    let value = "";
    if (secsBehind > 60 * 10) {
      value = `🚨 Behind ${blocksBehind} blocks, ${secsBehind} seconds!`;
      shouldAlert = true;
      alertNetworks.push(name);
    } else if (isNaN(secsBehind)) {
      value = `🚨 Offline?`;
      shouldAlert = true;
      alertNetworks.push(name);
    } else {
      value = `Behind ${blocksBehind} blocks, ${secsBehind} seconds`;
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
        ? "**<@666841845099134988> Bendystraw error!**"
        : undefined,
      embeds: [
        {
          fields,
          author: {
            name: "bendystraw.xyz",
            url: "https://bendystraw.xyz",
          },
          color: shouldAlert ? 14360591 : 1039136,
          title: `Status: ${shouldAlert ? "ATTENTION‼️" : "chillin"}`,
          description: alertNetworks.join(", "),
        },
      ],
    });
  } catch (e) {
    console.error(`Error sending webhook: ${(e as Error).message}`);
  }
}

main();
