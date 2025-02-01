export type Item = {
  id: number;
  name: string;
  image_url: string | null;
  description: string | null;
  category_id: number | null;
  // joined
  category_name: string | null;
};

export type ListItem = {
  id: number;
  name: string;
  list_id: string;
  item_id: string;
  checked: boolean;
  quantity: number;
  // joined
  category_name: string | null;
};

export type ListsViewList = {
  id: string;
  name: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
  created_at_formatted?: string;
  updated_at_formatted?: string;
};

export type List = ListsViewList & {
  // joined
  list_items: ListItem[];
};

export type Category = {
  name: string;
  id: number;
};
