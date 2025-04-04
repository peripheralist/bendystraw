import { verifyKey } from "@unkey/api";
import type { Context, Next } from "hono";
import { createMiddleware } from "hono/factory";

export const keyAuthMiddleware = createMiddleware(async (c: Context, next: Next) => {
  // handle /graphql endpoint
  const key = c.req.param("key");

  if (!key) return c.text("Unauthorized", 401);

  const { error, result } = await verifyKey(key);

  if (error) return c.text(error.message, 500);
  if (!result.valid) return c.text("Unauthorized", 401);

  await next();
});
