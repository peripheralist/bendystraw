import { serveStatic } from "@hono/node-server/serve-static";
import { readFileSync } from "fs";
import { Hono } from "hono";
import { cors } from "hono/cors";
import MarkdownIt from "markdown-it";
import { graphql } from "ponder";
import { db } from "ponder:api";
import schema from "ponder:schema";
import { ALLOWED_ORIGINS } from "../constants/origins";
import { keyAuthMiddleware } from "../middleware/keyAuth";
import { rateLimitMiddleware } from "../middleware/rateLimit";
import { getParticipantSnapshots } from "./participants";
import axios from "axios";

const app = new Hono();

app.get(
  "/favicon.ico",
  serveStatic({
    path: "src/assets/favicon.ico",
  })
);

// Serve a markdown file as HTML
app.get("/", (c) => {
  const markdown = readFileSync("README.md", "utf-8");
  const css = readFileSync("src/assets/docs.css", "utf-8");
  const md = new MarkdownIt({ html: true });
  const html = md.render(markdown);

  return c.html(`
    <html>
      <head>
        <title>Bendystraw</title>
        <meta name="description" content="GraphQL API for Juicebox protocol.">
        <meta charset="UTF-8">
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

app.get("/badge", async (c) => {
  const isReady = await axios.get("/ready").then((res) => res.status === 200);

  return c.html(
    `<div style="color:${isReady ? "green" : "red"}">${
      isReady ? "Ready" : "Error"
    }</div>`
  );
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
