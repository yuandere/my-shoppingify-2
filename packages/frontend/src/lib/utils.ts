import { clsx, type ClassValue } from "clsx";
import { supabase } from "@/shared/supabaseClient";
import { twMerge } from "tailwind-merge";

import type { Item } from "@/types/dashboard";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function loaderDelayFn<T>(
  fn: (...args: Array<any>) => Promise<T> | T
) {
  const delay = Number(sessionStorage.getItem("loaderDelay") ?? 0);
  const delayPromise = new Promise((r) => setTimeout(r, delay));

  await delayPromise;
  const res = await fn();

  return res;
}

type CategoryObj = { category_name: string; items: Item[] };

export const sortItems = (itemsData: Item[], searchTerm: string) => {
  const res: CategoryObj[] = [];
  const uncategorized: CategoryObj = {
    category_name: "Uncategorized",
    items: [],
  };
  const map = new Map();
  for (const item of itemsData) {
    if (
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      if (!item.category_name) {
        uncategorized.items.push({
          ...item,
          category_name: "Uncategorized",
        });
      } else {
        if (!map.has(item.category_name)) {
          map.set(item.category_name, res.length);
          res.push({ category_name: item.category_name, items: [] });
        }
        res[map.get(item.category_name)].items.push(item);
      }
    }
  }
  res.sort((a, b) => {
    const nameA = a.category_name.toUpperCase();
    const nameB = b.category_name.toUpperCase();
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  });
  if (uncategorized.items[0]) res.push(uncategorized);
  return res;
};

export const tokenHelper = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  return data.session?.access_token;
};
