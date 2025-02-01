import { Hono } from "hono";
import { createSupabaseServerClient } from "../utils/supabase";
import type { Bindings, Variables } from "../bindings";

const categories = new Hono<{ Bindings: Bindings; Variables: Variables }>();

categories
  .get("/", async (c) => {
    const token = c.get("token");
    const supabase = createSupabaseServerClient(c.env as any, token);
    const { data: categories, error } = await supabase
      .from("categories")
      .select("id, name")
      .eq("user_id", c.get("user").id);
    if (error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json(categories);
  })
  .post("/", async (c) => {
    const { name } = await c.req.json();
    if (!name) {
      return c.json({ error: "Name is required" }, 400);
    }
    const token = c.get("token");
    const supabase = createSupabaseServerClient(c.env as any, token);
    const { data: categories, error } = await supabase
      .from("categories")
      .insert({ name, user_id: c.get("user").id })
      .select("id, name")
      .single();
    if (error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json(categories);
  })
  .delete("/:id", async (c) => {
    const token = c.get("token");
    const supabase = createSupabaseServerClient(c.env as any, token);
    const { data: categories, error } = await supabase
      .from("categories")
      .delete()
      .eq("id", c.req.param("id"));
    if (error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ message: "Category deleted" }, 200);
  });

export default categories;
