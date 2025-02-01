import { Context, Next } from "hono";

interface RateLimitEntry {
  count: number;
  expiry: number;
}

const requestCache = new Map<string, RateLimitEntry>();

export function rateLimitMiddleware(limit: number, windowSeconds: number) {
  return async function (c: Context, next: Next) {
    const ip = c.req.header("CF-Connecting-IP") as string;
    if (!ip) {
      return c.text("Rate limit can only be performed for users with IP", 400);
    }
    const cacheKey = `rateLimit:${ip}`;
    const now = Date.now();
    let entry = requestCache.get(cacheKey);
    if (entry) {
      if (entry.expiry <= now) {
        requestCache.delete(cacheKey);
        entry = undefined;
      }
    }
    if (entry && entry.count >= limit) {
      return c.json({ error: "Too many requests, try again later" }, 429);
    }
    if (!entry) {
      requestCache.set(cacheKey, {
        count: 1,
        expiry: now + windowSeconds * 1000,
      });
    } else {
      entry.count++;
      requestCache.set(cacheKey, entry);
    }

    await next();
  };
}
