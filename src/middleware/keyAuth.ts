import { Unkey } from "@unkey/api";
import type { Context, Next } from "hono";
import { createMiddleware } from "hono/factory";

const rootKey = process.env.UNKEY_ROOT_KEY;

const unkey = rootKey ? new Unkey({ rootKey }) : undefined;

export const keyAuthMiddleware = createMiddleware(
  async (c: Context, next: Next) => {
    if (!unkey) {
      // No root key configured - skip auth in development
      return await next();
    }

    const key = c.req.param("key");

    if (!key) return c.text("Unauthorized", 401);

    try {
      const { data } = await unkey.keys.verifyKey({ key });

      if (!data.valid) return c.text("Unauthorized", 401);

      await next();
    } catch (e) {
      console.error("keyAuth error", e);
      return c.text("Internal Server Error", 500);
    }
  }
);
