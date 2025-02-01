import axios from "redaxios";
import { tokenHelper } from "../utils";
import type { Category } from "@/types/dashboard";

export const addCategory = async (
  newCategoryName: string
): Promise<{ data: Category }> => {
  try {
    const token = await tokenHelper();
    return axios({
      method: "POST",
      url: import.meta.env.VITE_BACKEND_URL + "/api/v1/categories",
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
    return axios({
      method: "DELETE",
      url:
        import.meta.env.VITE_BACKEND_URL + "/api/v1/categories/" + categoryId,
      headers: {
        authorization: "Bearer " + token,
      },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
