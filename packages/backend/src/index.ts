import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { authMiddleware } from "./middleware/authMiddleWare";
import { rateLimiterMiddleware } from "./middleware/rateLimiterMiddleware";
import { Bindings, Variables } from "./bindings";
import { RateLimiter } from "./utils/rateLimiter";
import items from "./routes/items";
import categories from "./routes/categories";
import generate from "./routes/generate";
import lists from "./routes/lists";
import listItems from "./routes/list-items";
import auth from "./routes/auth";

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();
app.use(logger());

app.use(
  "/api/v1/*",
  cors({
    origin: ["http://localhost:5173", "https://my-shoppingify-2.netlify.app"],
  })
);
app.use("/api/*", rateLimiterMiddleware);
app.use("/api/*", authMiddleware);

app.route("/api/v1/items", items);
app.route("/api/v1/listItems", listItems);
app.route("/api/v1/categories", categories);
app.route("/api/v1/lists", lists);
app.route("/api/v1/generate", generate);
app.route("/api/v1/auth", auth);

export default app;
export { RateLimiter };
