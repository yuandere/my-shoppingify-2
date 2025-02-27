import { useContext, useEffect, useState, useMemo } from "react";
import {
  useSuspenseQuery,
  useQueryErrorResetBoundary,
} from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";

import { SidebarContext } from "@/shared/SidebarContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { sortItems } from "@/lib/utils";
import { itemsQueryOptions } from "@/lib/queryOptions";
import { Item } from "@/types/dashboard";

export const Route = createFileRoute("/_auth/items")({
  component: ItemsPage,
  errorComponent: ({ error }) => {
    const router = useRouter();
    const queryErrorResetBoundary = useQueryErrorResetBoundary();

    useEffect(() => {
      queryErrorResetBoundary.reset();
    }, [queryErrorResetBoundary]);

    return (
      <div>
        <p>{error.message}</p>
        <button onClick={() => router.invalidate()}>Try again</button>
      </div>
    );
  },
  loader: async (options) => {
    return options.context.queryClient.ensureQueryData(itemsQueryOptions());
  },
});

function ItemsPage() {
  const { data } = useSuspenseQuery(itemsQueryOptions());
  const [searchTerm, setSearchTerm] = useState<string>("");
  const displayedItems = useMemo(
    () => sortItems(data, searchTerm),
    [data, searchTerm]
  );
  const sidebarContext = useContext(SidebarContext);

  const handleItemClick = (item: Item) => {
    if (!sidebarContext) return;
    if (
      sidebarContext.infoPaneOpen &&
      item.id === sidebarContext.selectedItem?.id
    )
      return;
    sidebarContext.setSelectedItem(item);
    sidebarContext.setAddingNewItem(false);
    sidebarContext.setInfoPaneOpen(true);
    sidebarContext.setOpen(true);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <header className="flex items-center gap-4 border-b p-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search items"
          />
        </div>
        <Button
          className="p-1 grid place-items-center border rounded-md transition-all hover:scale-[125%] hover:text-[var(--accent-color)]"
          variant="ghost"
          onClick={sidebarContext?.handleAddingNewItem}
          size={"icon"}
          disabled={
            sidebarContext?.infoPaneOpen &&
            !sidebarContext?.addingNewItem &&
            !!sidebarContext?.selectedItem
          }
        >
          <Plus />
        </Button>
      </header>
      <ScrollArea className="flex-1">
        <div className="h-full p-6">
          <main>
            {displayedItems.length === 0 && (
              <div className="flex flex-col items-center justify-between h-auto rounded-md p-4 space-y-4">
                <p>No items found. Add an item?</p>
                <Button
                  className="w-10 h-10 p-1 grid place-items-center border rounded-full transition-all hover:scale-[125%] hover:text-[var(--accent-color)]"
                  variant="ghost"
                  onClick={sidebarContext?.handleAddingNewItem}
                  disabled={
                    sidebarContext?.infoPaneOpen &&
                    !sidebarContext?.addingNewItem &&
                    !!sidebarContext?.selectedItem
                  }
                >
                  <Plus />
                </Button>
              </div>
            )}
            {displayedItems.map((categoryObj) => (
              <div
                key={`category-${categoryObj.category_name}`}
                className="mb-8"
              >
                <h2 className="mb-4 text-2xl font-semibold">
                  {categoryObj.category_name}
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {categoryObj.items.map((item) => (
                    <div
                      className="flex items-center justify-between h-auto rounded-md border p-4 transition-colors cursor-pointer hover:bg-accent hover:text-accent-foreground"
                      //inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-9 w-9
                      data-id={item.id}
                      key={`item-${item.name}`}
                      onClick={() => handleItemClick(item)}
                    >
                      <span>{item.name}</span>
                      <Button
                        className="transition-all hover:scale-[150%] hover:text-[var(--accent-color)]"
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          sidebarContext?.handleAddItemToList({
                            itemId: item.id,
                            itemName: item.name,
                            category_name: item.category_name ?? undefined,
                          });
                        }}
                      >
                        <Plus />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </main>
        </div>
      </ScrollArea>
    </div>
  );
}
