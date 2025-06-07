import { Context, Next } from "hono";
import { createSupabaseServerClient } from "../utils/supabase";

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Missing or invalid Authorization header" }, 401);
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return c.json({ error: "Invalid authorization header" }, 401);
  }
  c.set("token", token);
  const supabase = createSupabaseServerClient(c.env as any, token);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user) {
    return c.json({ error: "Invalid access token" }, 401);
  }
  c.set("user", user);
  await next();
}
