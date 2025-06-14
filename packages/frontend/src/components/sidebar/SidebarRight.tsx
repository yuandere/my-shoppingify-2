import { useContext, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

import { SidebarRightContext } from "@/shared/SidebarRightContext";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { queryClient } from "@/lib/queryClient";
import { createList } from "@/lib/actions/lists";
import SidebarCart from "./SidebarCart";
import SidebarInfoPane from "./SidebarInfoPane";
import type { ListsViewList } from "@/types/dashboard";

// TODO: hookup context open state to mobile display

export function SidebarRight({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const [isCreatingList, setIsCreatingList] = useState(false);
  const sideBarRightContext = useContext(SidebarRightContext);
  //const open = sideBarRightContext?.open || false;
  const setOpen = sideBarRightContext?.setOpen || (() => {});
  const infoPaneOpen = sideBarRightContext?.infoPaneOpen || false;
  const setInfoPaneOpen = sideBarRightContext?.setInfoPaneOpen || (() => {});
  const addingNewItem = sideBarRightContext?.addingNewItem || false;
  const setAddingNewItem = sideBarRightContext?.setAddingNewItem || (() => {});
  const selectedItem = sideBarRightContext?.selectedItem || null;
  const selectedListId = sideBarRightContext?.selectedListId || null;
  const [listId, setListId] = useState<string | null>(selectedListId);
  const setSelectedListId =
    sideBarRightContext?.setSelectedListId || (() => {});
  const handleAddingNewItem =
    sideBarRightContext?.handleAddingNewItem || (() => {});

  useEffect(() => {
    setListId(selectedListId);
  }, [selectedListId]);

  const handleCreateList = async () => {
    if (isCreatingList) return;
    setIsCreatingList(true);
    let newList = null;
    try {
      const data = await createList();
      // console.log(data);
      newList = data as ListsViewList;
    } catch (e) {
      console.error(e);
      toast.error("Error creating list");
      return;
    } finally {
      await Promise.resolve(
        queryClient.invalidateQueries({ queryKey: ["lists"] })
      );
      setOpen(true);
      setInfoPaneOpen(false);
      setSelectedListId(newList?.id ?? null);
      setIsCreatingList(false);
      toast.success("List created");
    }
  };

  return (
    <Sidebar
      className="border-l shrink-0"
      side="right"
      collapsible="offcanvas"
      variant="inset"
      {...props}
    >
      {infoPaneOpen ? (
        selectedItem || addingNewItem ? (
          <SidebarContent>
            <SidebarInfoPane
              selectedItem={selectedItem}
              addingNewItem={addingNewItem}
            />
          </SidebarContent>
        ) : (
          <div className="flex h-[calc(100vh-2rem)] flex-col items-center justify-center space-y-4">
            <h2 className="text-xl font-semibold text-muted-foreground">
              No item selected
            </h2>
            <div className="flex flex-col gap-2">
              <Button
                className="w-[200px]"
                onClick={() => setAddingNewItem(true)}
              >
                Add a new item
              </Button>
            </div>
          </div>
        )
      ) : (
        <SidebarContent>
          {listId ? (
            <>
              <SidebarCart
                listId={listId}
                setInfoPaneOpen={setInfoPaneOpen}
                setAddingNewItem={setAddingNewItem}
              />
            </>
          ) : (
            <div className="flex h-[calc(100vh-2rem)] flex-col items-center justify-center space-y-4">
              <h2 className="mb-4 text-xl font-semibold text-muted-foreground">
                No list selected
              </h2>
              <div className="flex flex-col gap-2 space-y-2">
                <Link to="/lists">
                  <Button variant="outline" className="w-[200px]">
                    View lists
                  </Button>
                </Link>
                <Button className="w-[200px]" onClick={handleCreateList}>
                  Create list
                </Button>
                <hr className="my-2 self-center w-2/3 border-t-1 border-muted-foreground" />
                <Button className="w-[200px]" onClick={handleAddingNewItem}>
                  Add an item
                </Button>
              </div>
            </div>
          )}
        </SidebarContent>
      )}
    </Sidebar>
  );
}
