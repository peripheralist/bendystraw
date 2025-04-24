import { Hono } from "hono";
import { cors } from "hono/cors";
import { graphql } from "ponder";
import { db } from "ponder:api";
import schema from "ponder:schema";
import { ALLOWED_ORIGINS } from "../constants/origins";
import { keyAuthMiddleware } from "../middleware/keyAuth";
import { serveStatic } from "@hono/node-server/serve-static";

const app = new Hono();

// public testing
// if (process.env.NODE_ENV !== "development") app.use("/", rateLimitMiddleware); // disable rate limiting until CORS works
app.use("/", graphql({ db, schema }));

app.get(
  "/favicon.ico",
  serveStatic({
    path: "/src/api/favicon.ico",
  })
);

// origin restricted (internal apps)
app.use("/graphql", async (c, next) => {
  // only allow requests, not yoga UI (GET)
  if (c.req.method !== "POST") return c.text("Not allowed", 401);
  await next();
});
// app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use("/graphql", graphql({ db, schema }));

// require key (internal dev, external apps)
app.use("/graphql/:key", async (c, next) => {
  // only allow requests, not yoga UI (GET)
  if (c.req.method !== "POST") return c.text("Not allowed", 401);
  await next();
});
app.use("/graphql/:key", keyAuthMiddleware);
app.use("/graphql/:key", graphql({ db, schema }));

export default app;
