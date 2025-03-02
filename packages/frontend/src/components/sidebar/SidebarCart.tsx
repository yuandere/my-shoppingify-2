import { useMemo, useState, useEffect, useCallback, useContext } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useLocation } from "@tanstack/react-router";
import { useDebouncedCallback } from "use-debounce";
import { Check } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarRightContext } from "@/shared/SidebarRightContext";
import CartListItem from "./CartListItem";
import { queryClient } from "@/lib/queryClient";
import { listsQueryOptions, listItemsQueryOptions } from "@/lib/queryOptions";
import { renameList, deleteList, completeList } from "@/lib/actions/lists";
import { deleteListItem, updateListItem } from "@/lib/actions/listItems";
import type { ListItem } from "@/types/dashboard";
import { ScrollArea } from "../ui/scroll-area";

type CategoryObj = { category_name: string; listItems: ListItem[] };

interface ISidebarCart {
  listId: string;
  setInfoPaneOpen: (infoPaneOpen: boolean) => void;
  setAddingNewItem: (addingNewItem: boolean) => void;
}

function SidebarCart({
  listId,
  setInfoPaneOpen,
  setAddingNewItem,
}: ISidebarCart) {
  const sidebarRightContext = useContext(SidebarRightContext);
  const pathname = useLocation({ select: (location) => location.pathname });
  const listQuery = useSuspenseQuery(listsQueryOptions());
  const listQueryData = listQuery.data?.find((list) => list.id === listId);
  const listItemsQuery = useSuspenseQuery(listItemsQueryOptions(listId));
  const listItems = listItemsQuery.data;
  const [expandedItemId, setExpandedItemId] = useState<number | null>(null);
  const [newListName, setNewListName] = useState<string>("");
  const [localQuantities, setLocalQuantities] = useState<
    Record<string, number>
  >({});
  const [localCheckedStates, setLocalCheckedStates] = useState<
    Record<string, boolean>
  >({});
  const [lastSyncedQuantities, setLastSyncedQuantities] = useState<
    Record<string, number>
  >({});
  const [lastSyncedCheckedStates, setLastSyncedCheckedStates] = useState<
    Record<string, boolean>
  >({});
  const [submittingList, setSubmittingList] = useState<boolean>(false);
  const [deletingList, setDeletingList] = useState<boolean>(false);

  useMemo(() => {
    if (listItems) {
      console.log("listItems:", listItems, "Type:", typeof listItems);
      const quantities: Record<number, number> = {};
      const checkedStates: Record<number, boolean> = {};
      listItems.forEach((listItem) => {
        quantities[listItem.id] = listItem.quantity;
        checkedStates[listItem.id] = listItem.checked;
      });
      setLocalQuantities(quantities);
      setLocalCheckedStates(checkedStates);
      setLastSyncedQuantities(quantities);
      setLastSyncedCheckedStates(checkedStates);
    }
  }, [listItems]);

  // Handle list item actions
  const debouncedUpdateQuantity = useDebouncedCallback(
    async (listItemId: number, quantity: number) => {
      const lastSyncedQuantity = lastSyncedQuantities[listItemId];
      if (lastSyncedQuantity === quantity) return;
      try {
        await updateListItem({ listItemId, quantity });
      } catch {
        toast.error("Error updating list item");
        return;
      } finally {
        // console.log("listItemId:", listItemId, " Update quantity", quantity);
        setLastSyncedQuantities((prev) => ({
          ...prev,
          [listItemId]: quantity,
        }));
      }
    },
    1000 // 1 second delay
  );
  const debouncedUpdateChecked = useDebouncedCallback(
    async (listItemId: number, checked: boolean) => {
      const lastSyncedChecked = lastSyncedCheckedStates[listItemId];
      if (lastSyncedChecked === checked) return;
      try {
        await updateListItem({ listItemId, checked });
      } catch {
        toast.error("Error updating list item");
        return;
      } finally {
        // console.log("listItemId:", listItemId, " Update checked", checked);
        setLastSyncedCheckedStates((prev) => ({
          ...prev,
          [listItemId]: checked,
        }));
      }
    },
    1000 // 1 second delay
  );
  const handleChangeChecked = (listItemId: number, checked: boolean) => {
    const currentChecked =
      localCheckedStates[listItemId] ??
      listItems?.find((listItem) => listItem.id === listItemId)?.checked;
    if (currentChecked === checked) return;

    setLocalCheckedStates((prev) => ({ ...prev, [listItemId]: checked }));
    debouncedUpdateChecked(listItemId, checked);
  };
  const handleChangeQuantity = (listItemId: number, quantity: number) => {
    if (quantity < 1 || quantity > 99) return;

    const currentQuantity =
      localQuantities[listItemId] ??
      listItems?.find((listItem) => listItem.id === listItemId)?.quantity;
    if (currentQuantity === quantity) return;

    setLocalQuantities((prev) => ({ ...prev, [listItemId]: quantity }));
    debouncedUpdateQuantity(listItemId, quantity);
  };
  const handleDeleteListItem = async (listItemId: number) => {
    if (deletingList) return;
    setDeletingList(true);
    try {
      await deleteListItem(listItemId);
    } catch {
      toast.error("Error deleting list item");
      return;
    } finally {
      await queryClient.invalidateQueries({ queryKey: ["listItems", listId] });
      setDeletingList(false);
    }
  };

  // Handle list actions
  const handleCompleteList = async () => {
    if (!listQueryData) return;
    try {
      await completeList(listQueryData?.id, !listQueryData?.completed);
    } catch {
      toast.error("Error completing list");
      return;
    } finally {
      await Promise.resolve(
        queryClient.invalidateQueries({ queryKey: ["lists"] })
      );
      toast.success("List completed");
    }
  };
  const handleDeleteList = async () => {
    if (!listQueryData) return;
    try {
      await deleteList(listQueryData?.id);
    } catch {
      toast.error("Error deleting list");
      return;
    } finally {
      await Promise.resolve(
        queryClient.invalidateQueries({ queryKey: ["lists"] })
      );
      sidebarRightContext?.setSelectedListId(null);
      toast.success("List deleted");
    }
  };
  const handleRenameList = async (newListName: string) => {
    if (
      newListName === listQueryData?.name ||
      newListName === "" ||
      !listQueryData
    )
      return;
    if (submittingList) return;
    setSubmittingList(true);
    try {
      await renameList(listQueryData?.id, newListName);
    } catch {
      toast.error("Error renaming list");
      setSubmittingList(false);
      return;
    } finally {
      await Promise.resolve(
        queryClient.invalidateQueries({ queryKey: ["lists"] })
      );
      toast.success("List renamed");
      setSubmittingList(false);
    }
  };

  // Handle click outside of expanded list item to unexpand
  useEffect(() => {
    if (!expandedItemId) return;

    const handleClickOutside = (event: MouseEvent) => {
      // Find the clicked element's closest cart item
      const clickedCartItem = (event.target as Element).closest(
        "[data-cart-item]"
      );

      // If clicked outside all cart items, collapse
      if (!clickedCartItem) {
        setExpandedItemId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [expandedItemId]);

  // Handle list item expansion with animation timing
  const handleItemClick = useCallback(
    (listItemId: number) => {
      if (expandedItemId === listItemId) {
        setExpandedItemId(null);
      } else {
        // If there's already an expanded item, collapse it first and wait before expanding new item
        if (expandedItemId) {
          setExpandedItemId(null);
          setTimeout(() => setExpandedItemId(listItemId), 100);
        } else {
          setExpandedItemId(listItemId);
        }
      }
    },
    [expandedItemId]
  );

  const sortedCartItems = useMemo(() => {
    if (!listItems) return [];
    const res: CategoryObj[] = [];
    const uncategorized: CategoryObj = {
      category_name: "Uncategorized",
      listItems: [],
    };
    const map = new Map();

    for (const listItem of listItems) {
      if (!listItem.category_name) {
        uncategorized.listItems.push({
          ...listItem,
          category_name: "Uncategorized",
        });
      } else {
        if (!map.has(listItem.category_name)) {
          map.set(listItem.category_name, res.length);
          res.push({ category_name: listItem.category_name, listItems: [] });
        }
        res[map.get(listItem.category_name)].listItems.push(listItem);
      }
    }
    res.sort((a, b) => {
      const nameA = a.category_name.toUpperCase();
      const nameB = b.category_name.toUpperCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });

    if (uncategorized.listItems.length > 0) res.push(uncategorized);
    return res;
  }, [listItems]);

  return (
    <div className="p-4">
      <>
        <div className="mb-6 rounded-xl bg-[#8B4F65] p-4 text-white">
          <div className="mb-2 flex items-start justify-between">
            <div className="h-12 w-12">🍾</div>
            <div className="text-right">
              <div className="mb-1">Didn't find what you need?</div>
              <Button
                onClick={() => {
                  setInfoPaneOpen(true);
                  setAddingNewItem(true);
                }}
                size="sm"
                variant="secondary"
              >
                Add item
              </Button>
            </div>
          </div>
        </div>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {listQueryData?.completed && (
              <Check className="h-4 w-4 text-green-500" />
            )}
            <h2
              className={`text-xl font-semibold ${listQueryData?.completed ? "text-muted-foreground" : ""}`}
            >
              {listQueryData?.name || "Shopping List"}
            </h2>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                ✏️
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit list name</DialogTitle>
                <DialogDescription>
                  Rename your list here and click save when done
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    List name
                  </Label>
                  <Input
                    id="name"
                    value={
                      newListName !== "" ? newListName : listQueryData?.name
                    }
                    className="col-span-3"
                    onChange={(e) => setNewListName(e.target.value)}
                    onAbort={() => {
                      setNewListName("");
                    }}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  disabled={submittingList}
                  type="button"
                  onClick={() => handleRenameList(newListName)}
                >
                  Save changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="space-y-6">
          {sortedCartItems.length > 0 && (
            <ScrollArea className="h-[calc(5/8*100dvh)]">
              {sortedCartItems.map((category) => (
                <div key={category.category_name}>
                  <Label className="text-muted-foreground">
                    {category.category_name}
                  </Label>
                  <div className="mt-2 space-y-1">
                    {category.listItems.map((listItem) => {
                      const isExpanded = expandedItemId === listItem.id;
                      const localQuantity =
                        localQuantities[listItem.id] ?? listItem.quantity;
                      const localChecked =
                        localCheckedStates[listItem.id] ?? listItem.checked;
                      return (
                        <CartListItem
                          key={listItem.id}
                          item={listItem}
                          isExpanded={isExpanded}
                          onItemClick={handleItemClick}
                          itemId={listItem.id}
                          handleChangeChecked={handleChangeChecked}
                          handleDeleteListItem={handleDeleteListItem}
                          handleChangeQuantity={handleChangeQuantity}
                          listQueryData={listQueryData}
                          localQuantity={localQuantity}
                          localChecked={localChecked}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </ScrollArea>
          )}

          <div className="space-y-2">
            {sortedCartItems.length === 0 && (
              <div className="h-[calc(5/8*100dvh)] my-4 space-y-2 flex flex-col items-center justify-center">
                <p className="text-muted-foreground">No items in cart</p>
                {pathname !== "/items" && (
                  <Link to={"/items"}>
                    <Button variant="outline" className="w-full">
                      Go To Items
                    </Button>
                  </Link>
                )}
              </div>
            )}
            <Button
              variant="outline"
              onClick={handleCompleteList}
              className="w-full"
            >
              {listQueryData?.completed
                ? "Undo Complete List"
                : "Complete List"}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  Delete List
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Click continue to confirm deletion.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteList}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </>
    </div>
  );
}

export default SidebarCart;
