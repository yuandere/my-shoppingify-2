import { Hono } from "hono";
import { cors } from "hono/cors";
import { decode, sign, verify } from "hono/jwt";
import { logger } from "hono/logger";
import { zValidator } from "@hono/zod-validator";
import { createClient, SupabaseClient, User } from "@supabase/supabase-js";
import { z } from "zod";

import { authMiddleware } from "./middleware/auth";
import { Bindings, Variables } from "./bindings";
import items from "./routes/items";
import categories from "./routes/categories";
import lists from "./routes/lists";
import listItems from "./routes/list-items";

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();
app.use(logger());

app.use(
  "/api/v1/*",
  cors({
    origin: "*",
  })
);
app.use("/api/*", authMiddleware);
app.get("/test", (c) => {
  return c.json({
    message: "test",
  });
});
// app.get(
// 	'/hello',
// 	zValidator(
// 		'query',
// 		z.object({
// 			name: z.string(),
// 		})
// 	),
// 	(c) => {
// 		const { name } = c.req.valid('query');
// 		return c.json({
// 			message: `Hello! ${name}`,
// 		});
// 	}
// );

app.route("/api/v1/items", items);
app.route("/api/v1/listItems", listItems);
app.route("/api/v1/categories", categories);
app.route("/api/v1/lists", lists);

export default app;
