import apiClient from "../api-client";
import { tokenHelper } from "../utils";
import type { Category } from "@/types/dashboard";

export const addCategory = async (
  newCategoryName: string
): Promise<{ data: Category }> => {
  try {
    const token = await tokenHelper();
    return apiClient({
      method: "POST",
      url: "/api/v1/categories",
      data: { name: newCategoryName },
      headers: {
        authorization: "Bearer " + token,
      },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export const deleteCategory = async (categoryId: number) => {
  try {
    const token = await tokenHelper();
    return apiClient({
      method: "DELETE",
      url: "/api/v1/categories/" + categoryId,
      headers: {
        authorization: "Bearer " + token,
      },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
