import apiClient from "../api-client";
import { tokenHelper } from "../utils";
import type { Item } from "@/types/dashboard";

export const completeList = async (listId: string, completed: boolean) => {
  try {
    const token = await tokenHelper();
    const { data } = await apiClient({
      method: "PUT",
      url: `/api/v1/lists/${listId}`,
      headers: { Authorization: `Bearer ${token}` },
      data: { completed: completed },
    });
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export const createList = async (item?: Item) => {
  try {
    const token = await tokenHelper();
    const { data } = await apiClient({
      method: "POST",
      url: "/api/v1/lists",
      headers: { Authorization: `Bearer ${token}` },
      data: { item: item || null },
    });
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export const deleteList = async (listId: string) => {
  try {
    const token = await tokenHelper();
    const { data } = await apiClient({
      method: "DELETE",
      url: `/api/v1/lists/${listId}`,
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export const renameList = async (listId: string, newListName: string) => {
  try {
    const token = await tokenHelper();
    const { data } = await apiClient({
      method: "PUT",
      url: `/api/v1/lists/${listId}`,
      headers: { Authorization: `Bearer ${token}` },
      data: { name: newListName },
    });
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
