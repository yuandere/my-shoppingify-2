import { useContext, useEffect, useState, useMemo, useRef } from "react";
import clsx from "clsx";
import {
  useSuspenseQuery,
  useQueryErrorResetBoundary,
} from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";

import { SidebarRightContext } from "@/shared/SidebarRightContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSidebar } from "@/components/ui/sidebar";
import PendingRoute from "@/components/PendingRoute";
import { useIsMobile } from "@/hooks/useIsMobile";
import useScrollHideNav from "@/hooks/useScrollHideNav";
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
        <p>Something went wrong</p>
        <Button onClick={() => router.invalidate()}>Try again</Button>
      </div>
    );
  },
  loader: async (options) => {
    return options.context.queryClient.ensureQueryData(itemsQueryOptions());
  },
  pendingComponent: PendingRoute,
});

function ItemsPage() {
  const isMobile = useIsMobile();
  const { toggleSidebar } = useSidebar();
  const { data } = useSuspenseQuery(itemsQueryOptions());
  const [searchTerm, setSearchTerm] = useState<string>("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const displayedItems = useMemo(
    () => sortItems(data, searchTerm),
    [data, searchTerm]
  );
  const sidebarRightContext = useContext(SidebarRightContext);

  const handleItemClick = (item: Item) => {
    if (!sidebarRightContext) return;
    if (isMobile) {
      // sidebarRightContext?.flashCart();
      toggleSidebar();
    }
    if (
      sidebarRightContext.infoPaneOpen &&
      item.id === sidebarRightContext.selectedItem?.id
    )
      return;
    sidebarRightContext.setSelectedItem(item);
    sidebarRightContext.setAddingNewItem(false);
    sidebarRightContext.setInfoPaneOpen(true);
    sidebarRightContext.setOpen(true);
  };

  const handleAddItemClick = () => {
    sidebarRightContext?.handleAddingNewItem();
    if (isMobile) {
      toggleSidebar();
    }
  };

  useScrollHideNav(scrollAreaRef);

  // useEffect(() => {
  //   if (!sidebarRightContext) return;
  //   const root = scrollAreaRef.current;
  //   if (!root) return;

  //   const viewport = root.querySelector(
  //     "div[data-radix-scroll-area-viewport]"
  //   ) as HTMLDivElement;
  //   if (!viewport) return;
  //   let lastScrollY = viewport.scrollTop;
  //   let ticking = false;

  //   const handleScroll = () => {
  //     const currentScrollY = viewport.scrollTop;
  //     if (!ticking) {
  //       window.requestAnimationFrame(() => {
  //         if (currentScrollY > lastScrollY && currentScrollY > 56) {
  //           sidebarRightContext.setIsNavbarVisible(false);
  //         } else {
  //           sidebarRightContext.setIsNavbarVisible(true);
  //         }
  //         lastScrollY = currentScrollY;
  //         ticking = false;
  //       });
  //       ticking = true;
  //     }
  //   };
  //   viewport.addEventListener("scroll", handleScroll);
  //   return () => {
  //     viewport.removeEventListener("scroll", handleScroll);
  //   };
  // }, [sidebarRightContext]);

  return (
    <div
      className={clsx(
        "flex h-screen flex-col",
        isMobile && "h-[calc(100vh-4rem)]"
      )}
    >
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
          onClick={handleAddItemClick}
          size={"icon"}
          disabled={
            sidebarRightContext?.infoPaneOpen &&
            !sidebarRightContext?.addingNewItem &&
            !!sidebarRightContext?.selectedItem
          }
        >
          <Plus />
        </Button>
      </header>
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="h-full p-6">
          <main>
            {displayedItems.length === 0 && (
              <div className="flex flex-col items-center justify-between h-auto rounded-md p-4 space-y-4">
                <p>No items found. Add an item?</p>
                <Button
                  className="w-10 h-10 p-1 grid place-items-center border rounded-full transition-all hover:scale-[125%] hover:text-[var(--accent-color)]"
                  variant="ghost"
                  onClick={handleAddItemClick}
                  disabled={
                    sidebarRightContext?.infoPaneOpen &&
                    !sidebarRightContext?.addingNewItem &&
                    !!sidebarRightContext?.selectedItem
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
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {categoryObj.items.map((item) => (
                    <div
                      className="flex items-center justify-between rounded-md border p-4 transition-colors cursor-pointer hover:bg-accent hover:text-accent-foreground group relative overflow-hidden"
                      data-id={item.id}
                      key={`item-${item.name}`}
                      onClick={() => handleItemClick(item)}
                    >
                      {item.image_url && (
                        <div
                          className="absolute inset-0 opacity-20 bg-cover bg-center bg-no-repeat pointer-events-none"
                          style={{ backgroundImage: `url(${item.image_url})` }}
                        />
                      )}
                      <span className="truncate flex-1 relative z-10">
                        {item.name}
                      </span>
                      <Button
                        className={clsx(
                          "transition-all hover:scale-[125%] hover:text-[var(--accent-color)] relative z-10",
                          !isMobile && "opacity-0 group-hover:opacity-100"
                        )}
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          sidebarRightContext?.handleAddItemToList({
                            itemId: item.id,
                            itemName: item.name,
                            category_name: item.category_name ?? undefined,
                          });
                          if (isMobile) {
                            // sidebarRightContext?.flashCart();
                            toggleSidebar();
                          }
                        }}
                      >
                        <Plus />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {isMobile && <div className="h-8" />}
          </main>
        </div>
      </ScrollArea>
    </div>
  );
}
