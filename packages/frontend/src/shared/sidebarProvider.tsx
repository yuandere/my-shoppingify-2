import { useState } from "react";
import { toast } from "sonner";

import { SidebarContext } from "@/shared/SidebarContext";
import { queryClient } from "@/lib/queryClient";
import { createListItem } from "@/lib/actions/listItems";
import type { ISidebarContext } from "@/shared/SidebarContext";
import type { Item } from "@/types/dashboard";

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [infoPaneOpen, setInfoPaneOpen] = useState<boolean>(false);
  const [addingNewItem, setAddingNewItem] = useState(false);
  const [selectedItem, setSelectedItem] = useState<null | Item>(null);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [addingListItem, setAddingListItem] = useState<boolean>(false);

  const handleAddItemToList = async ({
    itemId,
    itemName,
    category_name,
  }: {
    itemId: number;
    itemName: string;
    category_name?: string | null;
  }) => {
    if (addingListItem) return;
    if (!selectedListId) {
      toast.error("No list selected");
      return;
    }
    setAddingListItem(true);
    // TODO: add check for existing list item
    try {
      await createListItem({
        itemId,
        itemName,
        category_name,
        listId: selectedListId,
      });
    } catch (e) {
      console.error(e);
      toast.error("Failed to add item to list");
      return;
    } finally {
      setAddingListItem(false);
      queryClient.invalidateQueries({
        queryKey: ["listItems", selectedListId],
      });
      toast.success("Item added to list");
    }
  };

  const handleAddingNewItem = () => {
    setAddingNewItem(true);
    setInfoPaneOpen(true);
    setOpen(true);
  };

  const contextValue: ISidebarContext = {
    open,
    setOpen,
    infoPaneOpen,
    setInfoPaneOpen,
    addingNewItem,
    setAddingNewItem,
    selectedItem,
    setSelectedItem,
    selectedListId,
    setSelectedListId,
    handleAddItemToList,
    handleAddingNewItem,
  };
  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  );
}
