import {
  GenerateContentParameters,
  GenerateContentResponse,
  GoogleGenAI,
} from "@google/genai";
import { Hono } from "hono";
import type { PostgrestError } from "@supabase/supabase-js";
import getUrlTextContent from "../utils/getUrlTextContent";
import { createSupabaseServerClient } from "../utils/supabase";
import type { Bindings, Variables } from "../bindings";

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

const systemInstructions = {
  prompt: [
    `You are a helpful assistant for a shopping list app who generates lists based on a prompt, and data on associated items and their categories. The prompt is prepended with a user's existing items and categories. You can choose from them when creating a shopping list as well as specify any new items and categories that should be created for it. Respond with a structured JSON object formatted as:\n`,
    `\nnewCategories and newItems should reference items and their categories that are not already present in the user data. newListName is a descriptive name for the list you're creating e.g. "Pasta recipe", and newListItems is an array that references items' names, their categories, and quantity (integer, default: 1) as required in your list. If you are referencing a user's existing item, use the exact same name in the newListItem. newItem names should be unique and identify any details or measurements e.g. "Salt (2 tsp)". If the detail can be expressed in whole numbers between 0 and 100 such as quantity of a fruit, instead specify it as a newListItem quantity and leave it out of the newItem name. Limit the number of items and categories you create to 25. Ensure newListItems only contains items and categories that are being created or exist in the user data. Ensure your response is a valid JSON object. If the prompt is unclear take your best guess. If the prompt is empty, unrelated to shopping list generation or otherwise harmful or abusive, simply respond with "Error: bad prompt"`,
  ],
  url: [
    `You are a helpful assistant for a shopping list app who analyzes recipe instructions from user-provided webpage content and generates a list and data on associated items and their categories. The content is mostly unprocessed so you must determine the page subject and extract relevant information i.e. ingredients on a pizza recipe page. The text content is prepended with a user's existing items and categories. You can choose from them when creating a shopping list as well as specify any new items and categories that should be created for it. Respond with a structured JSON object formatted as:\n`,
    `\nnewCategories and newItems should reference items and their categories that are not already present in the user data. newListName is a descriptive name for the list you're creating e.g. "Pasta recipe", and newListItems is an array that references items' names, their categories, and quantity (integer, default: 1) as required in your list. If you are referencing a user's existing item, use the exact same name in the newListItem. newItem names should be unique and identify any details or measurements e.g. "Salt (2 tsp)". If the detail can be expressed in whole numbers between 0 and 100 such as quantity of a fruit, instead specify it as a newListItem quantity and leave it out of the newItem name. Limit the number of items and categories you create to 25. Ensure newListItems only contains items and categories that are being created or exist in the user data. Ensure your response is a valid JSON object. If the webpage content is unclear take your best guess. If the webpage content is empty, unrelated to items in a list or otherwise harmful or abusive, simply respond with "Error: bad prompt"`,
  ],
  image: [
    `You are a helpful assistant for a shopping list app who generates lists based on content from user-submitted images, and data on associated items and their categories. Attached should be an image file you should analyze and use to create a response, as well as a user's existing items and categories. You can choose from them when creating a shopping list as well as specify any new items and categories that should be created for it. Respond with a structured JSON object formatted as:\n`,
    `\nnewCategories and newItems should reference items and their categories that are not already present in the user data. newListName is a descriptive name for the list you're creating e.g. "Pasta recipe", and newListItems is an array that references items' names, their categories, and quantity (integer, default: 1) as required in your list. If you are referencing a user's existing item, use the exact same name in the newListItem. newItem names should be unique and identify any details or measurements e.g. "Salt (2 tsp)". If the detail can be expressed in whole numbers between 0 and 100 such as quantity of a fruit, instead specify it as a newListItem quantity and leave it out of the newItem name. Limit the number of items and categories you create to 25. Ensure newListItems only contains items and categories that are being created or exist in the user data. Ensure your response is a valid JSON object. If the image is unclear take your best guess. If the image is missing, unrelated to items in a list or otherwise harmful or abusive, simply respond with "Error: bad prompt"`,
  ],
};

const instructionsConstructor = (
  method: "prompt" | "url" | "image",
  outputFormat: string
) => {
  return systemInstructions[method].join(outputFormat);
};

interface ICreateGenRequestParams {
  method: "prompt" | "url" | "image";
  context: string;
  outputFormat: string;
  prompt: string;
  image?: string;
}

function createGenRequestParams({
  method,
  context,
  outputFormat,
  prompt,
  image,
}: ICreateGenRequestParams) {
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
        ...(image && {
          inlineData: {
            mimeType: "image/jpeg",
            data: image,
          },
        }),
      },
    ],
    config: {
      temperature: 0.4,
      topP: 0.8,
      maxOutputTokens: 2048,
      systemInstruction: instructionsConstructor(method, outputFormat),
    },
  };

  return params;
}

const generate = new Hono<{ Bindings: Bindings; Variables: Variables }>();

generate.post("/:method", async (c) => {
  const method = c.req.param("method");
  const formData = await c.req.formData();
  let prompt = formData.get("prompt") as string;
  const url = formData.has("url") ? (formData.get("url") as string) : undefined;
  const image = formData.has("image") ? formData.get("image") : undefined;
  if (!prompt || prompt === "") return c.json({ error: "Empty prompt" }, 400);
  if (method === "image" && !image)
    return c.json({ error: "Image is required" }, 400);

  // fetch url here
  let urlContent = "";
  if (method === "url") {
    if (!url) return c.json({ error: "URL is required" }, 400);
    const test = await getUrlTextContent(url);
    // console.log("TEXT_BLOCKS:", test);
    urlContent = test;
  }

  const genAI = new GoogleGenAI({
    apiKey: c.env.GEMINI_API_KEY,
  });
  const token = c.get("token");
  const supabase = createSupabaseServerClient(c.env as any, token);

  // Get existing data from supabase
  let context = null;
  const itemMap: Record<string, { id: number; category_name: string }> = {};
  const categoryMap: Record<string, { name: string; id: number }> = {};
  try {
    const { data: items, error } = await supabase
      .from("items")
      .select("id, name, category_name")
      .eq("user_id", c.get("user").id);
    if (error) throw error;
    const { data: categories, error: error2 } = await supabase
      .from("categories")
      .select("id, name")
      .eq("user_id", c.get("user").id);
    if (error2) throw error2;
    context = {
      items: items ? items.map((item) => item.name) : [],
      categories: categories ? categories.map((category) => category.name) : [],
    };
    // console.log("context", context);
    if (items?.length) {
      for (const item of items) {
        itemMap[item.name] = {
          id: item.id,
          category_name: item.category_name,
        };
      }
    }
    if (categories?.length) {
      for (const category of categories) {
        categoryMap[category.name] = category.id;
      }
    }
  } catch (e) {
    const error = e as PostgrestError;
    console.error(error);
    return c.json({ success: false, error: error.message }, 500);
  }

  let newData: IStructuredOutput | null = null;
  let response: GenerateContentResponse;

  // Get response from Gemini
  switch (method) {
    case "prompt":
      const params = createGenRequestParams({
        method: "prompt",
        context: JSON.stringify(context),
        outputFormat: JSON.stringify(structuredOutput),
        prompt: prompt,
      });
      response = await genAI.models.generateContent(params);
      break;
    case "url":
      const urlParams = createGenRequestParams({
        method: "url",
        context: JSON.stringify(context),
        outputFormat: JSON.stringify(structuredOutput),
        prompt: "Page content:" + urlContent,
      });
      response = await genAI.models.generateContent(urlParams);
      break;
    case "image":
      const imageParams = createGenRequestParams({
        method: "image",
        context: JSON.stringify(context),
        outputFormat: JSON.stringify(structuredOutput),
        prompt: "Image",
        image: JSON.stringify(image),
      });
      response = await genAI.models.generateContent(imageParams);
      break;
    default:
      return c.json({ error: "Invalid method" }, 400);
  }

  if (!response)
    return c.json({ success: false, message: "No response from Gemini API" });
  if (!response.candidates) {
    return c.json({ success: false, message: response.promptFeedback });
  }
  // if (response.candidates[0].content?.parts) {
  //   console.log("text", response.candidates[0].content?.parts[0].text);
  // }
  if (
    !response.candidates[0].content?.parts ||
    typeof response.candidates[0].content?.parts[0].text !== "string"
  ) {
    return c.json({
      success: false,
      message: "Gemini did not return valid JSON",
    });
  }

  // Parse and validate gemini response
  // TODO: handle finish reasons
  try {
    const rawText = response.candidates[0].content?.parts[0].text;
    // console.log("Raw response:", rawText);
    // Strip markdown code blocks if present, handle various markdown code block formats
    const jsonText = rawText
      .replace(/^```(?:json)?\r?\n/m, "")
      .replace(/\r?\n```$/m, "")
      .trim();
    if (jsonText === "Error: bad prompt") {
      return c.json({ success: false, message: "Invalid prompt" });
    }
    newData = JSON.parse(jsonText);
    // console.log("parsed json", newData);
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
    console.error(e);
    return c.json({ success: false, message: "Invalid JSON response" });
  }

  if (newData.newListItems.some((item) => item.name === "Error: bad prompt")) {
    return c.json({ success: false, message: "Invalid prompt" });
  }

  // Send new data to supabase
  let newListId: string | null = null;
  try {
    const uid = c.get("user").id;
    // TODO: examine and handle edge cases- 1. items and categories but no listItems
    if (newData?.newCategories.length) {
      const { data: addedCategories, error } = await supabase
        .from("categories")
        .insert(
          newData?.newCategories.map((category) => ({
            name: category,
            user_id: uid,
          }))
        )
        .select("id, name");
      if (error) {
        throw error;
      }
      for (const addedCategory of addedCategories) {
        categoryMap[addedCategory.name] = addedCategory.id;
      }
      // console.log("categoryMap", categoryMap);
    }
    if (newData?.newItems.length) {
      const { data: addedItems, error } = await supabase
        .from("items")
        .insert(
          newData?.newItems.map((item) => ({
            name: item.name,
            category_id: categoryMap[item.category] ?? null,
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
    // console.log("itemMap", itemMap);
    if (newData?.newListName && newData?.newListItems.length) {
      // console.log("newListItems", newData.newListItems);
      const { data: addedList, error } = await supabase
        .from("lists")
        .insert({ name: newData.newListName, user_id: uid })
        .select()
        .single();
      if (error) {
        throw error;
      }
      const listId = addedList.id;
      newListId = listId;
      const newListItemsMap = newData.newListItems.map((listItem) => ({
        list_id: listId,
        item_id: itemMap[listItem.name]?.id,
        name: listItem.name,
        quantity: listItem.quantity,
        user_id: uid,
        category_name:
          listItem.category !== "Uncategorized" ? listItem.category : null,
      }));
      // console.log("newListItemsMap", newListItemsMap);
      const { error: error2 } = await supabase
        .from("list_items")
        .insert(newListItemsMap);
      if (error2) {
        throw error2;
      }
    }
  } catch (e) {
    const error = e as PostgrestError;
    console.error(error);
    return c.json({
      success: false,
      message: error.message,
    });
  }

  const message =
    newData?.newListItems.length < newData?.newItems.length
      ? "List length mismatch, please double-check for accuracy"
      : "List generated successfully";
  return c.json({
    success: true,
    message: message,
    newListId: newListId ?? null,
  });
});

export default generate;
