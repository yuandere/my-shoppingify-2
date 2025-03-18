import { queryOptions } from "@tanstack/react-query";

import {
  fetchCategories,
  fetchItems,
  fetchLists,
  fetchListItems,
} from "./dashboardFetchers";

export const itemsKey = ["items"] as const;
export const listsKey = ["lists"] as const;
export const listItemsKey = (listId: string) => ["listItems", listId] as const;
export const categoriesKey = ["categories"] as const;

export const itemsQueryOptions = () =>
  queryOptions({
    queryKey: itemsKey,
    queryFn: () => fetchItems(),
  });

export const listsQueryOptions = () =>
  queryOptions({
    queryKey: listsKey,
    queryFn: () => fetchLists(),
    staleTime: 1000 * 5,
  });

export const listItemsQueryOptions = (listId: string) =>
  queryOptions({
    queryKey: listItemsKey(listId),
    queryFn: () => fetchListItems(listId),
  });

export const categoriesQueryOptions = () =>
  queryOptions({
    queryKey: categoriesKey,
    queryFn: () => fetchCategories(),
  });
