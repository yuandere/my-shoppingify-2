import { Hono } from "hono";
import { createSupabaseServerClient } from "../utils/supabase";
import type { Bindings, Variables } from "../bindings";

const items = new Hono<{ Bindings: Bindings; Variables: Variables }>();

items
  .get("/", async (c) => {
    const token = c.get("token");
    const supabase = createSupabaseServerClient(c.env as any, token);
    const { data: items, error } = await supabase
      .from("items")
      .select(`id, name, image_url, description, category_id, categories(name)`)
      .eq("user_id", c.get("user").id);
    if (error) {
      return c.json({ error: error.message }, 500);
    } else if (items.length === 0) {
      return c.json([]);
    } else {
      //console.log("items: ", items);
      const formattedItems = items.map((item) => ({
        id: item.id,
        name: item.name,
        image_url: item.image_url,
        description: item.description,
        category_id: item.category_id,
        //@ts-ignore
        category_name: item.categories?.name ?? null,
      }));
      return c.json(formattedItems);
    }
  })
  .get("/:id", async (c) => {
    const token = c.get("token");
    const supabase = createSupabaseServerClient(c.env as any, token);
    const { data: items, error } = await supabase
      .from("items")
      .select(`id, name, image_url, description, category_id, categories(name)`)
      .eq("id", c.req.param("id"))
      .eq("user_id", c.get("user").id);
    if (error) {
      //console.log("error: ", error);
      if (error.code === "PGRST100") {
        return c.json({ error: "Item not found" }, 404);
      }
      return c.json({ error: error.message }, 500);
    } else if (items.length === 0) {
      return c.json({ error: "Item not found" }, 404);
    } else {
      const item = items[0];
      //console.log("item: ", item);
      const formattedItem = {
        id: item.id,
        name: item.name,
        image_url: item.image_url,
        description: item.description,
        category_id: item.category_id,
        //@ts-ignore
        category_name: item.categories?.name ?? null,
      };
      return c.json(formattedItem);
    }
  })
  .post("/", async (c) => {
    const { name, description, image_url, category_id } = await c.req.json();
    if (!name) {
      return c.json({ error: "Name is required" }, 400);
    }
    const token = c.get("token");
    const supabase = createSupabaseServerClient(c.env as any, token);
    const { data: items, error } = await supabase
      .from("items")
      .insert({
        name,
        description,
        image_url,
        category_id,
        user_id: c.get("user").id,
      })
      .select()
      .single();
    if (error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json(items, 201);
  })
  .put("/:id", async (c) => {
    const { name, description, image_url, category_id } = await c.req.json();
    if (!name) {
      return c.json({ error: "Name is required" }, 400);
    }
    const token = c.get("token");
    const supabase = createSupabaseServerClient(c.env as any, token);
    const { data: items, error } = await supabase
      .from("items")
      .update({
        name,
        description,
        image_url,
        category_id,
      })
      .eq("id", c.req.param("id"))
      .select()
      .single();
    if (error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json(items, 201);
  })
  .delete("/:id", async (c) => {
    const token = c.get("token");
    const supabase = createSupabaseServerClient(c.env as any, token);
    const { data: items, error } = await supabase
      .from("items")
      .delete()
      .eq("id", c.req.param("id"))
      .select()
      .single();
    if (error) {
      if (error.code === "PGRST100") {
        return c.json({ error: "Item not found" }, 404);
      }
      return c.json({ error: error.message }, 500);
    }
    return c.json({ message: "Item deleted" }, 200);
  });

export default items;
