import { clsx, type ClassValue } from "clsx";
import dayjs from "dayjs";
import { supabase } from "@/shared/supabaseClient";
import { twMerge } from "tailwind-merge";

import type { Item, ListsViewList } from "@/types/dashboard";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function debounce(func: () => void, delay: number) {
  let timeoutId: NodeJS.Timeout;
  return () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func();
    }, delay);
  };
}

export function isDateAtLeast24HoursOld(isoDateString: string): boolean {
  try {
    const date = dayjs(isoDateString);
    if (!date.isValid()) {
      return false;
    }
    const now = dayjs();
    const diffInHours = now.diff(date, "hour");
    return diffInHours >= 24;
  } catch (error) {
    console.error("Error processing date:", error);
    return false;
  }
}

export function isValidURL(str: string) {
  if (/^https?:\/\/([\w-]+\.)+[\w-]{2,}(\/\S*)?$/.test(str)) {
    return true;
  } else {
    return false;
  }
}

export async function loaderDelayFn<T>(
  fn: (...args: Array<unknown>) => Promise<T> | T
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

export type MonthlyActivity = {
  month: string;
  listActivity: number;
};

export type CategoryStats = {
  category: string;
  numberItems: number;
};

export function getMonthlyListActivity(
  lists: ListsViewList[]
): MonthlyActivity[] {
  const now = dayjs();
  const monthsAgo = now.subtract(8, "month");
  const months = Array.from({ length: 9 }, (_, i) => {
    return monthsAgo.add(i, "month");
  });
  const monthCounts = new Map(months.map((month) => [month.format("MMM"), 0]));
  lists.forEach((list) => {
    const listMonth = dayjs(list.created_at).format("MMM");
    if (monthCounts.has(listMonth)) {
      monthCounts.set(listMonth, monthCounts.get(listMonth)! + 1);
    }
  });
  return Array.from(monthCounts.entries()).map(([month, count]) => ({
    month,
    listActivity: count,
  }));
}

export function getTopCategories(items: Item[]): CategoryStats[] {
  const categoryCounts = items.reduce((acc, item) => {
    const category = item.category_name || "Uncategorized";
    acc.set(category, (acc.get(category) || 0) + 1);
    return acc;
  }, new Map<string, number>());

  return Array.from(categoryCounts.entries())
    .map(([category, count]) => ({
      category,
      numberItems: count,
    }))
    .sort((a, b) => b.numberItems - a.numberItems)
    .slice(0, 5);
}
