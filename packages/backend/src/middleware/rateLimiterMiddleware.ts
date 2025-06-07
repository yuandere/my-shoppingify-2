import { Context, Next } from "hono";
import { RateLimiter } from "../utils/rateLimiter";

export async function rateLimiterMiddleware(c: Context, next: Next) {
  let ip =
    c.req.header("CF-Connecting-IP") ||
    c.req.header("x-forwarded-for") ||
    "127.0.0.1";
  if (ip && ip.includes(",")) {
    ip = ip.split(",")[0].trim();
  }
  if (!ip) {
    return c.text("Could not determine client IP", 400);
  }
  // Determine the Durable Object ID name based on the route
  const isGenerateRoute = c.req.path.includes("/api/v1/generate");
  const doIdName = isGenerateRoute
    ? ip + RateLimiter.GENERATE_ROUTE_SUFFIX
    : ip;

  const id = c.env.RATE_LIMITER.idFromName(doIdName);

  try {
    const stub = c.env.RATE_LIMITER.get(id);
    const milliseconds_to_next_request =
      await stub.getMillisecondsToNextRequest();
    // console.log("DO ID, MS TO NEXT REQ: ", id, milliseconds_to_next_request);
    if (milliseconds_to_next_request > 0) {
      return new Response("Rate limit exceeded", {
        status: 429,
        headers: {
          "Retry-After": Math.ceil(
            milliseconds_to_next_request / 1000
          ).toString(),
        },
      });
    }
  } catch (error) {
    console.error("Rate limiter error:", error);
    return new Response("Could not connect to rate limiter", { status: 502 });
  }

  await next();
}
