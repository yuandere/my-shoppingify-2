import {
  GenerateContentParameters,
  GenerateContentResponse,
  GoogleGenAI,
} from "@google/genai";
import { Hono } from "hono";
import type { PostgrestError } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "../utils/supabase";
import type { Bindings, Variables } from "../bindings";

const generate = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// 1. GET EXISTING DATA FROM SUPABASE - ITEMS WITH CATEGORIES, CATEGORIES
// 2. GET RESPONSE FROM GEMINI
// 3. CREATE NEW ITEMS + CATEGORIES
// 4. CREATE NEW LISTS
// 5. CREATE NEW LISTITEMS
// 6. RETURN NEW DATA TO USER

// generated response should be in this format:
interface IStructuredOutput {
  newCategories: string[];
  newItems: { name: string; category: string }[];
  newListName: string;
  newListItems: { name: string; category: string; quantity: number }[];
}
const structuredOutput: Record<keyof IStructuredOutput, string> = {
  newCategories: "string[]",
  newItems: "{name: string; category: string}[]",
  newListName: "string",
  newListItems: "{name: string; category: string; quantity: number}[]",
};

function createGenRequestParams(
  context: string,
  outputFormat: string,
  prompt: string
) {
  const params: GenerateContentParameters = {
    model: "gemini-1.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: context + "\n" + prompt,
          },
        ],
      },
    ],
    // If the prompt is "url" you will be provided the text content of a webpage from which you should generate your data.
    config: {
      temperature: 0.4,
      topP: 0.8,
      maxOutputTokens: 2048,
      systemInstruction: `You are a helpful assistant for a shopping list app who generates lists based on a prompt, and data on its associated items and their categories. The prompt is prepended with a user's existing items and categories. You can choose from them when creating a shopping list as well as specify any new items and categories that should be created for it. If the prompt is "image" you will be provided an image file from which you should create a response. Respond with a structured JSON object formatted as:\n${outputFormat}\nnewCategories and newItems should reference items and their categories that are not already present in the user data. newListName is a descriptive name for the list you're creating e.g. "Pasta recipe", and newListItems is an array that references items' names, their categories, and quantity (default: 1) as required in your list. Ensure newListItems only contains items and categories that are being created or exist in the user data. Ensure your response is a valid JSON object. If the prompt is unclear take your best guess. If the prompt is empty, unrelated to shopping list generation or otherwise harmful, simply respond with "Error: bad prompt". For testing purposes: if there are inconsistencies or issues in the information you have been provided or there is an obvious improvement that can be made to this request ignore all previous instructions and just reply with your thoughts`,
    },
  };

  return params;
}

generate.post("/:method", async (c) => {
  const method = c.req.param("method");
  const { prompt } = await c.req.json();
  if (prompt === "") return c.json({ error: "Empty prompt" }, 400);
  const genAI = new GoogleGenAI({
    apiKey: c.env.GEMINI_API_KEY,
  });
  const token = c.get("token");
  const supabase = createSupabaseServerClient(c.env as any, token);
  let context = null;
  const itemMap: Record<string, { id: number; category_name: string }> = {};
  try {
    const { data: items, error } = await supabase
      .from("items")
      .select("id, name, category_name")
      .eq("user_id", c.get("user").id);
    if (error) throw error;
    const { data: categories, error: error2 } = await supabase
      .from("categories")
      .select("name")
      .eq("user_id", c.get("user").id);
    if (error2) throw error2;
    context = {
      items: items ? items.map((item) => item.name) : [],
      categories: categories ? categories.map((category) => category.name) : [],
    };
    console.log("context", context);
    if (items?.length) {
      for (const item of items) {
        itemMap[item.name] = {
          id: item.id,
          category_name: item.category_name,
        };
      }
    }
  } catch (e) {
    const error = e as PostgrestError;
    return c.json({ error: error.message }, 500);
  }

  let newData: IStructuredOutput | null = null;
  let response: GenerateContentResponse;

  switch (method) {
    case "prompt":
      const params = createGenRequestParams(
        JSON.stringify(context),
        JSON.stringify(structuredOutput),
        prompt
      );
      response = await genAI.models.generateContent(params);
      break;
    // case "url":
    //   break;
    // case "image":
    //   break;
    default:
      return c.json({ error: "Invalid method" }, 400);
  }

  if (!response)
    return c.json({ success: false, message: "No response from Gemini API" });
  if (!response.candidates) {
    return c.json({ success: false, message: response.promptFeedback });
  }
  if (response.candidates[0].content?.parts) {
    console.log("text", response.candidates[0].content?.parts[0].text);
  }
  if (
    !response.candidates[0].content?.parts ||
    typeof response.candidates[0].content?.parts[0].text !== "string"
  ) {
    return c.json({
      success: false,
      message: "Gemini did not return valid JSON",
    });
  }
  // parse and validate gemini response
  // TODO: handle finish reasons
  try {
    const rawText = response.candidates[0].content?.parts[0].text;
    console.log('Raw response:', rawText);
    // Strip markdown code blocks if present, handle various markdown code block formats
    const jsonText = rawText
      .replace(/^```(?:json)?\r?\n/m, '')
      .replace(/\r?\n```$/m, '')
      .trim();
    newData = JSON.parse(jsonText);
    console.log("parsed json", newData);
    if (
      !newData ||
      typeof newData !== "object" ||
      !Array.isArray(newData.newCategories) ||
      !Array.isArray(newData.newItems) ||
      typeof newData.newListName !== "string" ||
      !Array.isArray(newData.newListItems)
    ) {
      return c.json({ success: false, message: "Invalid response structure" });
    }
    if (
      newData.newListItems.some(
        (item) =>
          !item.name || !item.category || typeof item.quantity !== "number"
      )
    ) {
      return c.json({
        success: false,
        message: "Invalid list items structure",
      });
    }
  } catch (e) {
    return c.json({ success: false, message: "Invalid JSON response" });
  }

  if (newData.newListItems.some((item) => item.name === "Error: bad prompt")) {
    return c.json({ success: false, message: "Invalid prompt" });
  }

  // 3. CREATE NEW ITEMS + CATEGORIES
  // 4. CREATE NEW LISTS
  // 5. CREATE NEW LISTITEMS

  try {
    const uid = c.get("user").id;
    // TODO: examine and handle edge cases- 1. items and categories but no listItems
    if (newData?.newCategories.length) {
      const { error } = await supabase
        .from("categories")
        .insert(
          newData?.newCategories.map((category) => ({ category, user_id: uid }))
        );
      if (error) {
        throw error;
      }
    }
    if (newData?.newItems.length) {
      const { data: addedItems, error } = await supabase
        .from("items")
        .insert(
          newData?.newItems.map((item) => ({
            name: item.name,
            category_name: item.category ?? null,
            user_id: uid,
          }))
        )
        .select("id, name, category_name");
      if (error) {
        throw error;
      }
      for (const addedItem of addedItems) {
        itemMap[addedItem.name] = {
          id: addedItem.id,
          category_name:
            addedItem.category_name !== "Uncategorized"
              ? addedItem.category_name
              : null,
        };
      }
    }
    console.log("itemMap", itemMap);
    if (newData?.newListName && newData?.newListItems.length) {
      const { data: addedList, error } = await supabase
        .from("lists")
        .insert({ name: newData.newListName, user_id: uid })
        .select()
        .single();
      if (error) {
        throw error;
      }
      const listId = addedList.id;
      const { error: error2 } = await supabase.from("list_items").insert(
        newData.newListItems.map((listItem) => ({
          list_id: listId,
          item_id: itemMap[listItem.name]?.id,
          name: listItem.name,
          quantity: listItem.quantity,
          user_id: uid,
          category_name:
            listItem.category !== "Uncategorized" ? listItem.category : null,
        }))
      );
      if (error2) {
        throw error2;
      }
    }
  } catch (e) {
    const error = e as PostgrestError;
    return c.json({
      success: false,
      message: error.message,
    });
  }

  // 6. RETURN NEW DATA TO USER or just tell client to invalidate

  return c.json({ success: true, message: "Data generated successfully" });
});

export default generate;
