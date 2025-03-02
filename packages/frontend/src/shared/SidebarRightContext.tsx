import { createContext } from "react";

import type { Item } from "@/types/dashboard";

interface IHandleAddItemToList {
  itemId: number;
  itemName: string;
  category_name?: string | null;
}

export interface ISidebarRightContext {
  open: boolean;
  setOpen: (open: boolean) => void;
  infoPaneOpen: boolean;
  setInfoPaneOpen: (open: boolean) => void;
  addingNewItem: boolean;
  setAddingNewItem: (isAddingNewItem: boolean) => void;
  selectedItem: null | Item;
  setSelectedItem: React.Dispatch<React.SetStateAction<null | Item>>;
  selectedListId: null | string;
  setSelectedListId: React.Dispatch<React.SetStateAction<null | string>>;
  handleAddItemToList: (data: IHandleAddItemToList) => void;
  handleAddingNewItem: () => void;
}

export const SidebarRightContext = createContext<ISidebarRightContext | null>(
  null
);
