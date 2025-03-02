import { useState } from "react";
import { toast } from "sonner";

import { SidebarRightContext } from "@/shared/SidebarRightContext";
import { queryClient } from "@/lib/queryClient";
import { createListItem } from "@/lib/actions/listItems";
import { listItemsQueryOptions } from "@/lib/queryOptions";
import type { ISidebarRightContext } from "@/shared/SidebarRightContext";
import type { Item } from "@/types/dashboard";

export function SidebarRightProvider({
  children,
}: {
  children: React.ReactNode;
}) {
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
    const listItems = await queryClient.fetchQuery(
      listItemsQueryOptions(selectedListId)
    );
    for (const listItem of listItems) {
      if (listItem.item_id === itemId) {
        toast.error("Item already exists in list");
        setAddingListItem(false);
        return;
      }
    }
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

  const contextValue: ISidebarRightContext = {
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
    <SidebarRightContext.Provider value={contextValue}>
      {children}
    </SidebarRightContext.Provider>
  );
}
