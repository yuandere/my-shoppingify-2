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
  // if no item is provided, we just return the new list
  .post("/", async (c) => {
    const token = c.get("token");
    const body = await c.req.json();
    const item = body?.item ?? null;
    let newList = null;
    const supabase = createSupabaseServerClient(c.env as any, token);
    try {
      const { data: listsCount, error: listsCountError } = await supabase
        .from("lists")
        .select("*")
        .like("name", "%New List%")
        .eq("user_id", c.get("user").id);
      if (listsCountError) {
        console.error("Error fetching lists count:", listsCountError);
        return c.json({ error: listsCountError.message }, 500);
      }
      console.log("listsCount: ", listsCount);
      
      // Handle empty array case - start with "New List (1)"
      let newCount = 1;
      if (listsCount.length > 0) {
        const lastList = listsCount[listsCount.length - 1];
        const match = lastList.name.match(/\((\d+)\)/);
        if (match) {
          newCount = parseInt(match[1]) + 1;
        }
      }

      const { data: lists, error } = await supabase
        .from("lists")
        .insert({
          name: `New List (${newCount})`,
          user_id: c.get("user").id,
        })
        .select("*")
        .single();
      
      if (error) {
        console.error("Error creating new list:", error);
        throw error;
      }
      
      newList = lists;
      console.log("newList: ", newList);
    } catch (error: any) {
      console.error("Caught error in lists POST:", error);
      return c.json({ error: error.message }, 500);
    } finally {
      if (!item) return c.json(newList);
    }
    // if an item was provided, create a new list item then return the new list
    const { data: listItems, error } = await supabase
      .from("list_items")
      .insert({
        name: item.name,
        item_id: item.id,
        user_id: c.get("user").id,
        list_id: newList.id,
        ...(item.category_name && { category_name: item.category_name }),
      })
      .select("*")
      .single();
    if (error) {
      console.error("error: ", error);
      return c.json({ error: error.message }, 500);
    }
    return c.json(newList);
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
