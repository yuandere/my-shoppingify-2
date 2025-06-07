import { Hono } from "hono";
import { createClient } from "@supabase/supabase-js";
import type { Bindings, Variables } from "../bindings";

const auth = new Hono<{ Bindings: Bindings; Variables: Variables }>();

auth.delete("/delete", async (c) => {
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

export default auth;
