import { Hono } from "hono";
import { createSupabaseServerClient } from "../utils/supabase";

import type { Bindings, Variables } from "../bindings";

const lists = new Hono<{ Bindings: Bindings; Variables: Variables }>();

lists
  .get("/", async (c) => {
    const token = c.get("token");
    const supabase = createSupabaseServerClient(c.env as any, token);
    const { data: lists, error } = await supabase
      .from("lists")
      .select(`id, name, completed, created_at, updated_at`)
      .eq("user_id", c.get("user").id);
    if (error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json(lists);
  })
  .post("/", async (c) => {
    const token = c.get("token");
    const supabase = createSupabaseServerClient(c.env as any, token);
    const { data: listsCount, error: listsCountError } = await supabase
      .from("lists")
      .select("*")
      .like("name", "%New List%")
      .eq("user_id", c.get("user").id);
    if (listsCountError) {
      return c.json({ error: listsCountError.message }, 500);
    }
    const match = listsCount[listsCount.length - 1].name.match(/\((\d+)\)/);
    const newCount = match ? parseInt(match[1]) + 1 : 1;
    const { data: lists, error } = await supabase
      .from("lists")
      .insert({
        name: `New List (${newCount})`,
        user_id: c.get("user").id,
      })
      .select("*")
      .single();
    if (error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json(lists);
  })
  .put("/:id", async (c) => {
    const { name, completed } = await c.req.json();
    if (name !== undefined && completed !== undefined) {
      return c.json({ error: "Name or completed bool is required" }, 400);
    }
    const token = c.get("token");
    const supabase = createSupabaseServerClient(c.env as any, token);
    const { data: lists, error } = await supabase
      .from("lists")
      .update({ name, completed })
      .eq("id", c.req.param("id"))
      .select("*");
    if (error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json(lists);
  })
  .delete("/:id", async (c) => {
    const token = c.get("token");
    const supabase = createSupabaseServerClient(c.env as any, token);
    const { data: lists, error } = await supabase
      .from("lists")
      .delete()
      .eq("id", c.req.param("id"))
      .select("*");
    if (error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ message: "List deleted" }, 200);
  });

export default lists;
