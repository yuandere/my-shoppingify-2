import { Hono } from "hono";
import { createSupabaseServerClient } from "../utils/supabase";

import type { Bindings, Variables } from "../bindings";

const listItems = new Hono<{ Bindings: Bindings; Variables: Variables }>();

listItems
  .get("/:id", async (c) => {
    const token = c.get("token");
    const supabase = createSupabaseServerClient(c.env as any, token);
    const { data: listItems, error } = await supabase
      .from("list_items")
      .select(`id, name, list_id, item_id, checked, quantity, category_name`)
      .eq("list_id", c.req.param("id"));
    if (error) {
      console.error("error: ", error);
      return c.json({ error: error.message }, 500);
    }
    return c.json(listItems);
  })
  .post("/", async (c) => {
    const { itemId, itemName, category_name, listId } = await c.req.json();
    if (!itemId || !itemName || !listId) {
      return c.json({ error: "Item id, name, and list id are required" }, 400);
    }
    const token = c.get("token");
    const supabase = createSupabaseServerClient(c.env as any, token);
    const { data: listItems, error } = await supabase
      .from("list_items")
      .insert({
        name: itemName,
        item_id: itemId,
        category_name: category_name ?? null,
        user_id: c.get("user").id,
        list_id: listId,
      })
      .select("*")
      .single();
    if (error) {
      console.error("error: ", error);
      return c.json({ error: error.message }, 500);
    }
    return c.json(listItems);
  })
  .put("/:id", async (c) => {
    const { checked, quantity } = await c.req.json();
    if (checked === undefined && quantity === undefined) {
      return c.json({ error: "Checked or quantity is required" }, 400);
    }
    const token = c.get("token");
    const supabase = createSupabaseServerClient(c.env as any, token);
    const { data: listItems, error } = await supabase
      .from("list_items")
      .update({ checked, quantity })
      .eq("id", c.req.param("id"))
      .select("*");
    if (error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json(listItems);
  })
  .delete("/:id", async (c) => {
    const token = c.get("token");
    const supabase = createSupabaseServerClient(c.env as any, token);
    const { data: listItems, error } = await supabase
      .from("list_items")
      .delete()
      .eq("id", Number(c.req.param("id")));
    if (error) {
      console.error("error: ", error);
      return c.json({ error: error.message }, 500);
    }
    return c.json({ message: "List item deleted" }, 200);
  });

export default listItems;
