import { getConnInfo } from "@hono/node-server/conninfo";
import type { Context, Next } from "hono";
import { createMiddleware } from "hono/factory";
import { IS_DEV } from "../constants/dev";
import { TRUSTED_ORIGINS } from "../constants/origins";
import { reportRateLimitExceeded } from "../lib/rateLimitAlerts";

// Per client IP. The Origin header can't be verified (non-browser clients can
// set it to anything), so it only raises the limit rather than bypassing it.
const LIMIT = 100;
const TRUSTED_ORIGIN_LIMIT = 300;
const WINDOW_MS = 60_000;

// In-memory fixed-window counters. Each replica keeps its own, so the
// effective limit across N replicas is up to N * limit per window.
const windows = new Map<string, { count: number; resetAt: number }>();

// Drop expired windows so the map doesn't grow unbounded.
setInterval(() => {
  const now = Date.now();
  for (const [key, w] of windows) {
    if (w.resetAt <= now) windows.delete(key);
  }
}, WINDOW_MS).unref();

/**
 * The socket peer is always Railway's edge proxy, so the client IP can only
 * come from the edge. x-real-ip is the header Railway documents for this, and
 * its edge overwrites any client-sent copy on public requests. x-forwarded-for
 * is deliberately not used: its leftmost entry has historically been
 * client-controlled on Railway.
 *
 * Caveat: requests over Railway private networking (*.railway.internal) skip
 * the edge, so x-real-ip is absent or caller-controlled there.
 */
function clientIp(c: Context) {
  const realIp = c.req.header("x-real-ip")?.trim();
  if (realIp) return realIp;

  try {
    return getConnInfo(c).remote.address;
  } catch {
    return undefined;
  }
}

/**
 * Private, CGNAT (Railway's internal proxy range is 100.64.0.0/10), and
 * loopback addresses are proxy hops or internal callers, not real clients.
 */
function isInternalIp(ip: string) {
  const v4 = ip.startsWith("::ffff:") ? ip.slice(7) : ip;
  const parts = v4.split(".").map(Number);

  if (parts.length === 4 && parts.every((n) => Number.isInteger(n))) {
    const [a, b] = parts as [number, number];
    return (
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168)
    );
  }

  const v6 = ip.toLowerCase();
  return v6 === "::1" || v6.startsWith("fc") || v6.startsWith("fd");
}

let warnedNoClientIp = false;

export const rateLimitMiddleware = createMiddleware(
  async (c: Context, next: Next) => {
    if (IS_DEV) return await next();

    const origin = c.req.header("origin");
    const limit =
      origin && TRUSTED_ORIGINS.includes(origin) ? TRUSTED_ORIGIN_LIMIT : LIMIT;

    const key = clientIp(c);

    // Fail open: without a real client IP, counting would lump every request
    // into one shared bucket and 429 all users at once.
    if (!key || isInternalIp(key)) {
      if (!warnedNoClientIp) {
        warnedNoClientIp = true;
        console.warn(
          `rateLimit: no public client IP (got ${key ?? "none"}); not rate limiting such requests`
        );
      }
      return await next();
    }

    const now = Date.now();

    let w = windows.get(key);
    if (!w || w.resetAt <= now) {
      w = { count: 0, resetAt: now + WINDOW_MS };
      windows.set(key, w);
    }
    w.count++;

    const resetSeconds = Math.ceil((w.resetAt - now) / 1000);
    c.header("RateLimit-Limit", String(limit));
    c.header("RateLimit-Remaining", String(Math.max(0, limit - w.count)));
    c.header("RateLimit-Reset", String(resetSeconds));

    if (w.count > limit) {
      if (w.count === limit + 1) {
        reportRateLimitExceeded({ ip: key, origin, path: c.req.path, limit });
      }
      c.header("Retry-After", String(resetSeconds));
      return c.text("Too many requests", 429);
    }

    await next();
  }
);
