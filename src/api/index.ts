import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { graphql } from "ponder";
import { db } from "ponder:api";
import schema from "ponder:schema";
import { ALLOWED_ORIGINS } from "../constants/origins";
import { keyAuthMiddleware } from "../middleware/keyAuth";
import { rateLimitMiddleware } from "../middleware/rateLimit";
import { getParticipantSnapshots } from "./participants";

const app = new Hono();

app.get(
  "/favicon.ico",
  serveStatic({
    path: "/src/api/favicon.ico",
  })
);

// public testing
if (process.env.NODE_ENV !== "development") {
  app.use("/", rateLimitMiddleware);
}
app.use("/", graphql({ db, schema }));

app.post("/graphql", cors({ origin: ALLOWED_ORIGINS }));
app.post("/participants", cors({ origin: ALLOWED_ORIGINS }));

app.post("/:key/*", keyAuthMiddleware);

app.post("/graphql", graphql({ db, schema }));
app.post("/:key/graphql", graphql({ db, schema }));

app.post("/participants", getParticipantSnapshots);
app.post("/:key/participants", getParticipantSnapshots);

export default app;
