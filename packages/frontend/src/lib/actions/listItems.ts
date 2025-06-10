import axios from "axios";
import { tokenHelper } from "../utils";

interface ICreateListItem {
  itemId: number;
  itemName: string;
  listId: string;
  category_name?: string | null;
}
export const createListItem = async ({
  itemId,
  itemName,
  listId,
  category_name,
}: ICreateListItem) => {
  try {
    const token = await tokenHelper();
    const { data } = await axios({
      method: "POST",
      url: import.meta.env.VITE_BACKEND_URL + "/api/v1/listItems",
      data: { itemId, itemName, category_name, listId },
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteListItem = async (listItemId: number) => {
  try {
    const token = await tokenHelper();
    const { data } = await axios({
      method: "DELETE",
      url: import.meta.env.VITE_BACKEND_URL + `/api/v1/listItems/${listItemId}`,
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

interface IUpdateListItem {
  listItemId: number;
  quantity?: number;
  checked?: boolean;
}
export const updateListItem = async ({
  listItemId,
  quantity,
  checked,
}: IUpdateListItem) => {
  try {
    const token = await tokenHelper();
    const { data } = await axios({
      method: "PUT",
      url: import.meta.env.VITE_BACKEND_URL + `/api/v1/listItems/${listItemId}`,
      headers: { Authorization: `Bearer ${token}` },
      data: { quantity, checked },
    });
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
