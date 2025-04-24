import { getConnInfo } from "@hono/node-server/conninfo";
import { Ratelimit } from "@unkey/ratelimit";
import type { Context, Next } from "hono";
import { createMiddleware } from "hono/factory";

const rootKey = process.env.UNKEY_ROOT_KEY;

if (!rootKey && process.env.NODE_ENV !== "development") {
  throw new Error(
    "UNKEY_ROOT_KEY undefined. Requests will not be rate-limited."
  );
}

const unkey = rootKey
  ? new Ratelimit({
      rootKey,
      namespace: "bendystraw-api",
      limit: 6,
      duration: "60s",
    })
  : undefined;

export const rateLimitMiddleware = createMiddleware(
  async (c: Context, next: Next) => {
    if (!unkey) {
      // unkey will be undefined if no root key
      return await next();
    }

    const info = getConnInfo(c);

    const id = info.remote.address;

    if (!id) return c.text("Something missing", 500);

    const { success } = await unkey.limit(id);

    if (success) {
      await next();
    } else {
      return c.text("Too many requests", 429);
    }
  }
);
