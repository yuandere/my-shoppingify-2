import { queryOptions } from "@tanstack/react-query";

// import queryClient from "./queryClient";
import {
  fetchCategories,
  fetchItems,
  fetchLists,
  fetchListItems,
} from "./dashboardFetchers";

export const itemsQueryOptions = () =>
  queryOptions({
    queryKey: ["items"],
    queryFn: () => fetchItems(),
  });

export const listsQueryOptions = () =>
  queryOptions({
    queryKey: ["lists"],
    queryFn: () => fetchLists(),
    staleTime: 1000 * 5,
  });

export const listItemsQueryOptions = (listId: string) =>
  queryOptions({
    queryKey: ["listItems", listId],
    queryFn: () => fetchListItems(listId),
  });

export const categoriesQueryOptions = () =>
  queryOptions({
    queryKey: ["categories"],
    queryFn: () => fetchCategories(),
  });

// export const useCreateInvoiceMutation = () => {
//   return useMutation({
//     // mutationKey: ['invoices', 'create'],
//     mutationFn: postInvoice,
//     onSuccess: () => queryClient.invalidateQueries(),
//   })
// }
