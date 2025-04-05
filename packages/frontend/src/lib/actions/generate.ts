import axios from "redaxios";
import { tokenHelper } from "../utils";

export interface IMethod {
  method: "prompt" | "image" | "url";
}

export const generateList = async (method: IMethod["method"], prompt: string) => {
  try {
    const token = await tokenHelper();
    return axios({
      method: "POST",
      url:
        import.meta.env.VITE_BACKEND_URL + `/api/v1/generate/${method}`,
      data: {
        prompt: prompt,
      },
      headers: {
        authorization: "Bearer " + token,
      },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
