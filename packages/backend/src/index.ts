import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { createClient } from "@supabase/supabase-js";

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
    origin: ["http://localhost:5173", "https://my-shoppingify-2.netlify.app"],
  })
);
app.use("/api/*", authMiddleware);

app.delete("/api/v1/auth/delete", async (c) => {
  const token = c.get("token");
  const supabase = createClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_SERVICE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);
    if (userError) throw userError;
    if (!user) throw new Error("User not found");
    const { error: deleteError } = await supabase.auth.admin.deleteUser(
      user.id
    );
    if (deleteError) throw deleteError;

    return c.json({
      success: true,
      message: "User account deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return c.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      400
    );
  }
});

app.route("/api/v1/items", items);
app.route("/api/v1/listItems", listItems);
app.route("/api/v1/categories", categories);
app.route("/api/v1/lists", lists);

export default app;
