import * as React from "react";
import clsx from "clsx";
import {
  useQueryErrorResetBoundary,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Check, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSidebar } from "@/components/ui/sidebar";
import { queryClient } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import PendingRoute from "@/components/PendingRoute";
import { SidebarRightContext } from "@/shared/SidebarRightContext";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import useScrollHideNav from "@/lib/hooks/useScrollHideNav";
import { listsQueryOptions, listItemsQueryOptions } from "@/lib/queryOptions";
import { createList } from "@/lib/actions/lists";
import type { ListsViewList } from "@/types/dashboard";

export const Route = createFileRoute("/_auth/lists")({
  component: RouteComponent,
  errorComponent: ({ error }) => {
    const router = useRouter();
    const queryErrorResetBoundary = useQueryErrorResetBoundary();

    React.useEffect(() => {
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
    return options.context.queryClient.ensureQueryData(listsQueryOptions());
  },
  pendingComponent: PendingRoute,
});

const sortLists = (lists: ListsViewList[], searchTerm: string) => {
  return lists
    .filter((list) =>
      list.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.updated_at);
      const dateB = new Date(b.updated_at);
      return dateB.getTime() - dateA.getTime();
    });
};

function RouteComponent() {
  const isMobile = useIsMobile();
  const { toggleSidebar } = useSidebar();
  const sidebarRightContext = React.useContext(SidebarRightContext);
  const [isCreatingList, setIsCreatingList] = React.useState(false);
  const { data } = useSuspenseQuery(listsQueryOptions());
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const displayedLists = React.useMemo(
    () => sortLists(data, searchTerm),
    [data, searchTerm]
  );

  const handleCreateList = async () => {
    if (isCreatingList) return;
    setIsCreatingList(true);
    let newList = null;
    try {
      const data = await createList();
      // console.log(data);
      newList = data as ListsViewList;
      await Promise.resolve(
        queryClient.invalidateQueries({ queryKey: ["lists"] })
      );
      sidebarRightContext?.setOpen(true);
      sidebarRightContext?.setInfoPaneOpen(false);
      sidebarRightContext?.setSelectedListId(newList?.id ?? null);
      toast.success("List created");
    } catch (e) {
      console.error("Error in handleCreateList:", e);
      toast.error(e instanceof Error ? e.message : "Error creating list");
    } finally {
      setIsCreatingList(false);
      if (isMobile) {
        // sidebarRightContext?.flashCart();
        toggleSidebar();
      }
    }
  };

  const handleListClick = (listId: string) => {
    if (sidebarRightContext) {
      sidebarRightContext.setOpen(true);
      sidebarRightContext.setInfoPaneOpen(false);
      sidebarRightContext.setSelectedListId(listId);
      if (isMobile) {
        // sidebarRightContext?.flashCart();
        toggleSidebar();
      }
    }
  };

  const handleMouseOverList = async (listId: string) => {
    // console.log("listitems being ensured for list", listId);
    await queryClient.ensureQueryData(listItemsQueryOptions(listId));
  };

  useScrollHideNav(scrollAreaRef);

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
            placeholder="Search lists"
          />
        </div>
        <Button
          className="p-1 grid place-items-center border rounded-md transition-all hover:scale-[125%] hover:text-[var(--accent-color)]"
          variant="ghost"
          size={"icon"}
          onClick={handleCreateList}
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
        <main
          className={clsx(
            "flex-1 overflow-auto p-6 xl:flex xl:flex-col xl:items-center xl:pt-10 2xl:pt-24",
            isMobile && "w-screen"
          )}
        >
          {displayedLists.length === 0 && (
            <div className="flex flex-col items-center justify-between h-auto rounded-md p-4 space-y-4">
              <p>No lists found. Create a list?</p>
              <Button
                className="w-10 h-10 p-1 grid place-items-center border rounded-full transition-all hover:scale-[125%] hover:text-[var(--accent-color)]"
                variant="ghost"
                onClick={handleCreateList}
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
          {displayedLists.map((list) => (
            <div
              key={`list-${list.id}`}
              data-list-id={list.id}
              className="flex items-center gap-4 border-b rounded-md border my-1 p-4 transition-colors cursor-pointer w-full xl:w-[800px] 2xl:w-[1024px] hover:bg-accent hover:text-accent-foreground"
              onClick={() => handleListClick(list.id)}
              onMouseOver={() => handleMouseOverList(list.id)}
            >
              <div className="h-6 w-6 rounded-full bg-muted grid place-items-center overflow-visible">
                {list.completed && (
                  <Check className="h-8 w-8 -translate-y-[5px]" />
                )}
              </div>
              {isMobile ? (
                <div className="flex flex-col flex-1 min-w-0 w-full align-start mr-2">
                  <div className="flex-1 min-w-0">
                    <p className="truncate">{list.name}</p>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    <p className="">{list.updated_at_formatted}</p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="truncate max-w-20 min-[900px]:max-w-none">
                    {list.name}
                  </p>
                  <div className="flex items-center ml-auto">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    <p className="">{list.updated_at_formatted}</p>
                  </div>
                </>
              )}

              {!isMobile && (
                <p
                  className={clsx(
                    "w-24",
                    list.completed ? "text-green-600" : "text-red-700",
                    isMobile && "ml-auto"
                  )}
                >
                  {list.completed ? "Complete" : "Incomplete"}
                </p>
              )}
            </div>
          ))}
          {isMobile && <div className="h-8" />}
        </main>
      </ScrollArea>
    </div>
  );
}
