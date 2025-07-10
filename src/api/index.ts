import { serveStatic } from "@hono/node-server/serve-static";
import axios from "axios";
import { readFileSync } from "fs";
import { Hono } from "hono";
import { cors } from "hono/cors";
import MarkdownIt from "markdown-it";
import { graphql } from "ponder";
import { db } from "ponder:api";
import schema from "ponder:schema";
import { ChainId, MAINNETS, NETWORKS, TESTNETS } from "../constants/networks";
import { ALLOWED_ORIGINS } from "../constants/origins";
import { keyAuthMiddleware } from "../middleware/keyAuth";
import { rateLimitMiddleware } from "../middleware/rateLimit";
import { getParticipantSnapshots } from "./participants";

const isDev = process.env.NODE_ENV === "development";

function getBlockHeight(chainId: ChainId) {
  return axios
    .get<{ result: `0x${string}` }>(
      `https://api.etherscan.io/v2/api?chainId=${chainId}&module=proxy&action=eth_blockNumber&apiKey=${process.env.ETHERSCAN_API_KEY}`
    )
    .then((res) => parseInt(res.data.result, 16) ?? JSON.stringify(res.data))
    .catch((e) => {
      console.warn(`Error getting block height for ${chainId}: ${e}`);
      return 0;
    });
}

function getBsStatus(testnet?: boolean) {
  return axios
    .get<
      Record<
        string,
        { id: ChainId; block: { number: number; timestamp: number } }
      >
    >(
      isDev
        ? `http://localhost:42069/status`
        : `https://${testnet ? "testnet." : ""}bendystraw.xyz/status`
    )
    .then((res) => res.data);
}

const app = new Hono();

app.get(
  "/favicon.ico",
  serveStatic({
    path: "src/assets/favicon.ico",
  })
);

// Serve a markdown file as HTML
app.get("/", async (c) => {
  let markdown = readFileSync("README.md", "utf-8");

  if (isDev) {
    markdown = markdown.replaceAll(
      "https://testnet.bendystraw.xyz",
      "http://localhost:42069"
    );
    markdown = markdown.replaceAll(
      "https://bendystraw.xyz",
      "http://localhost:42069"
    );
  }

  const css = readFileSync("src/assets/docs.css", "utf-8");
  const md = new MarkdownIt({ html: true });
  let html = md.render(markdown) as string;

  await axios
    .get(
      isDev
        ? "http://localhost:42069/status-table"
        : "https://bendystraw.xyz/status-table"
    )
    .then((res) => {
      const parts = html.split("<hr>");

      html = parts[0] + res.data + parts.slice(1).join("");
    });

  return c.html(`
    <html>
      <head>
        <title>Bendystraw</title>
        <meta name="description" content="GraphQL API for Juicebox protocol.">
        <meta charset="UTF-8">
        <meta name=viewport content="width=device-width, initial-scale=1,user-scalable=no"/>
        <link href="https://fonts.googleapis.com/css2?family=Roboto+Mono:ital,wght@0,100..700;1,100..700&display=swap" rel="stylesheet">
        <style>
          ${css}
        </style>
      </head>
      <body>
        <div class="container">
          ${html}
        </div>
      </body>
    </html>
  `);
});

// Serve a markdown file as HTML
app.get("/status-table", async (c) => {
  const mainnetStatus = await getBsStatus();
  const testnetStatus = await getBsStatus(true);

  const chainStatuses = [
    ...Object.values(mainnetStatus),
    ...Object.values(testnetStatus),
  ].map((s) => ({
    chainId: s.id,
    block: s.block.number,
    timestamp: s.block.timestamp,
  }));

  const mainnetsBlockHeights = await Promise.all(
    MAINNETS.map(async (chain) => ({
      chainId: chain.id,
      blockHeight: await getBlockHeight(chain.id),
    }))
  );

  await new Promise((r) => setTimeout(() => r(null), 1100)); // avoid rate limit with getting block height (max 5 req/s)

  const testnetsBlockHeights = await Promise.all(
    TESTNETS.map(async (chain) => ({
      chainId: chain.id,
      blockHeight: await getBlockHeight(chain.id),
    }))
  );

  const blockHeights = [...mainnetsBlockHeights, ...testnetsBlockHeights];

  const rows = NETWORKS.map((n) => {
    const blockHeight = blockHeights.find(({ chainId }) => n.id === chainId)
      ?.blockHeight!;

    const bsBlockHeight = chainStatuses.find(({ chainId }) => n.id === chainId)
      ?.block!;

    const blocksBehind = Math.max(blockHeight - bsBlockHeight, 0);

    const bsTimestamp = chainStatuses.find(({ chainId }) => n.id === chainId)
      ?.timestamp!;

    const secsBehind = Math.max(Math.floor(Date.now() / 1000) - bsTimestamp, 0);

    const behindTimeStr = isNaN(secsBehind)
      ? ""
      : secsBehind < 60
      ? `(${secsBehind}s)`
      : `(${Math.round(secsBehind / 60)}m)`;

    let className = "good";
    if (secsBehind > 60 * 5 || isNaN(secsBehind)) className = "danger";
    else if (secsBehind > 60) className = "warn";

    return `<tr><td>${n.name}</td><td><code style="color: var(--body);">${
      bsBlockHeight ?? "--"
    }</code></td><td><span class="${className}">${
      isNaN(blocksBehind) ? "Offline" : blocksBehind
    } ${behindTimeStr}</span></td></tr>`;
  }).join("\n");

  return c.text(`
    <h3>Status</h3>
    <table>
      <tr>
        <th>Network</th>
        <th>Block</th>
        <th>Behind</th>
      </tr>
      ${rows}
    </table>
  `);
});

app.get("/status.svg", async (c) => {
  const isReady = await axios
    .get(`${new URL(c.req.url).origin}/ready`)
    .then(() => true)
    .catch(() => false);

  const color = isReady ? "limegreen" : "crimson";
  const label = isReady ? "Running" : "Error";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="20">
  <rect width="100" height="20" fill="${color}"/>
  <text x="50%" y="14" font-family="Roboto Mono, monospace" font-size="11" fill="#fff" text-anchor="middle">${label}</text>
</svg>`;

  return c.body(svg, 200, {
    "Content-Type": "image/svg+xml",
    "Cache-Control": "no-cache",
  });
});

if (process.env.NODE_ENV !== "development") {
  app.use("/schema", rateLimitMiddleware);
}
app.use("/schema", graphql({ db, schema }));

app.post("/graphql", cors({ origin: ALLOWED_ORIGINS }));
app.post("/participants", cors({ origin: ALLOWED_ORIGINS }));

app.post("/graphql", graphql({ db, schema }));
app.post("/:key/graphql", keyAuthMiddleware);
app.post("/:key/graphql", graphql({ db, schema }));

app.post("/participants", getParticipantSnapshots);
app.post("/:key/participants", keyAuthMiddleware);
app.post("/:key/participants", getParticipantSnapshots);

app.get(
  "/legal",
  (c) => c.redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ") // lmao
);

export default app;
