import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";

import apiClient from "./api-client";
import { tokenHelper } from "./utils";
import type {
  Item,
  ListsViewList,
  Category,
  ListItem,
} from "@/types/dashboard";

dayjs.extend(localizedFormat);

export const fetchCategories = async () => {
  const token = await tokenHelper();
  const { data } = await apiClient({
    method: "GET",
    url: "/api/v1/categories",
    headers: { Authorization: `Bearer ${token}` },
  });
  return [{ id: 0, name: "Uncategorized" }, ...(data as Category[])];
};

export const fetchItems = async () => {
  const token = await tokenHelper();
  const { data } = await apiClient({
    method: "GET",
    url: "/api/v1/items",
    headers: { Authorization: `Bearer ${token}` },
  });
  return data as Item[];
};

export const fetchLists = async () => {
  const token = await tokenHelper();
  const { data } = await apiClient({
    method: "GET",
    url: "/api/v1/lists",
    headers: { Authorization: `Bearer ${token}` },
  });
  const lists = data as ListsViewList[];
  return lists.map((list: ListsViewList) => ({
    ...list,
    created_at_formatted: dayjs(list.created_at).format("ll"),
    updated_at_formatted: dayjs(list.updated_at).format("ll"),
  })) as ListsViewList[];
};

export const fetchListItems = async (listId: string) => {
  const token = await tokenHelper();
  const { data } = await apiClient({
    method: "GET",
    url: `/api/v1/listItems/${listId}`,
    headers: { Authorization: `Bearer ${token}` },
  });
  return data as ListItem[];
};
