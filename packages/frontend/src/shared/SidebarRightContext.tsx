import { createContext } from "react";

import type { Item } from "@/types/dashboard";

export interface ISidebarRightContext {
  open: boolean;
  setOpen: (open: boolean) => void;
  infoPaneOpen: boolean;
  setInfoPaneOpen: (open: boolean) => void;
  addingNewItem: boolean;
  setAddingNewItem: (adding: boolean) => void;
  selectedItem: Item | null;
  setSelectedItem: (item: Item | null) => void;
  selectedListId: string | null;
  setSelectedListId: (id: string | null) => void;
  handleAddItemToList: (params: {
    itemId: number;
    itemName: string;
    category_name?: string | null;
  }) => Promise<void>;
  handleAddingNewItem: () => void;
  handleResetSidebarStates: () => void;
  flashCart: () => void;
  cartCount: number | null;
  setCartCount: (count: number | null) => void;
  isNavbarVisible: boolean;
  setIsNavbarVisible: (visible: boolean) => void;
}

export const SidebarRightContext = createContext<ISidebarRightContext | null>(
  null
);
