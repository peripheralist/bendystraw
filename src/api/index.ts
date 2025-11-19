import { serveStatic } from "@hono/node-server/serve-static";
import axios from "axios";
import { readFileSync } from "fs";
import { Hono } from "hono";
import { cors } from "hono/cors";
import MarkdownIt from "markdown-it";
import { graphql } from "ponder";
import { db } from "ponder:api";
import schema from "ponder:schema";
import { IS_DEV } from "../constants/dev";
import { NETWORKS } from "../constants/networks";
import { ALLOWED_ORIGINS } from "../constants/origins";
import { getBsStatus } from "../lib/getBsStatus";
import { keyAuthMiddleware } from "../middleware/keyAuth";
import { rateLimitMiddleware } from "../middleware/rateLimit";
import { getParticipantSnapshots } from "./participants";

const app = new Hono();

if (process.env.WATCH_STATUS) {
  app.get("/", async () => {});
}

app.get(
  "/favicon.ico",
  serveStatic({
    path: "src/assets/favicon.ico",
  })
);

// Serve a markdown file as HTML
app.get("/", async (c) => {
  let markdown = readFileSync("README.md", "utf-8");

  if (IS_DEV) {
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
      IS_DEV
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
  const statuses = await getBsStatus();

  const rows = NETWORKS.map((n) => {
    const { block, blocksBehind, secsBehind } = statuses[n.id];

    const behindTimeStr = isNaN(secsBehind)
      ? ""
      : secsBehind < 60
      ? `(${secsBehind}s)`
      : `(${Math.round(secsBehind / 60)}m)`;

    let className = "good";
    if (secsBehind > 60 * 5 || isNaN(secsBehind)) className = "danger";
    else if (secsBehind > 60) className = "warn";

    return `<tr><td>${n.name}</td><td><code style="color: var(--body);">${
      block ?? "--"
    }</code></td><td><span class="${className}">${
      isNaN(blocksBehind) ? "?" : blocksBehind
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
  try {
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
  } catch (e) {
    console.error("Error loading status.svg badge", e);

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="20">
    <rect width="100" height="20" fill="#666"/>
    <text x="50%" y="14" font-family="Roboto Mono, monospace" font-size="11" fill="#fff" text-anchor="middle">Unavailable</text>
    </svg>`;

    return c.body(svg, 200, {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-cache",
    });
  }
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
