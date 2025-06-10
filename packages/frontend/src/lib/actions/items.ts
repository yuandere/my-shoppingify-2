import axios from "axios";
import { tokenHelper } from "../utils";
import { ItemFormValues } from "@/types/schema";

export const addItem = async (newItemData: ItemFormValues) => {
  try {
    const token = await tokenHelper();
    if (newItemData.category_id === 0) newItemData.category_id = null;
    if (newItemData.image_url === "") newItemData.image_url = null;
    return axios({
      method: "POST",
      url: import.meta.env.VITE_BACKEND_URL + "/api/v1/items",
      data: newItemData,
      headers: {
        authorization: "Bearer " + token,
      },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export const deleteItem = async (itemId: number) => {
  try {
    const token = await tokenHelper();
    return axios({
      method: "DELETE",
      url: import.meta.env.VITE_BACKEND_URL + "/api/v1/items/" + itemId,
      headers: {
        authorization: "Bearer " + token,
      },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export const updateItem = async (
  itemId: number,
  updatedItemData: ItemFormValues
) => {
  try {
    const token = await tokenHelper();
    if (updatedItemData.category_id === 0) updatedItemData.category_id = null;
    if (updatedItemData.image_url === "") updatedItemData.image_url = null;
    return axios({
      method: "PUT",
      url: import.meta.env.VITE_BACKEND_URL + "/api/v1/items/" + itemId,
      data: updatedItemData,
      headers: {
        authorization: "Bearer " + token,
      },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
