import apiClient from "../api-client";
import { tokenHelper } from "../utils";

export interface IMethod {
  method: "prompt" | "image" | "url";
}
export interface IGenerateList {
  method: IMethod["method"];
  prompt: string;
  url?: string;
  image?: File;
}

export const generateList = async ({ ...props }: IGenerateList) => {
  const { method, prompt, url, image } = props;
  if (prompt === "url" && !url) {
    throw new Error("URL is required");
  }
  if (prompt === "image" && !image) {
    throw new Error("Image is required");
  }
  const formData = new FormData();
  formData.append("method", method);
  formData.append("prompt", prompt);
  if (url !== undefined) formData.append("url", url ?? "");
  if (image !== undefined && image !== null) formData.append("image", image);
  try {
    const token = await tokenHelper();
    return apiClient({
      method: "POST",
      url: `/api/v1/generate/${method}`,
      data: formData,
      headers: {
        authorization: "Bearer " + token,
      },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
