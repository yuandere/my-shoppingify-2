import * as React from "react";
import {
  useQueryErrorResetBoundary,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { queryClient } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import PendingComponent from "@/components/PendingComponent";
import { SidebarRightContext } from "@/shared/SidebarRightContext";
import { useIsMobile } from "@/hooks/useIsMobile";
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
        <button onClick={() => router.invalidate()}>Try again</button>
      </div>
    );
  },
  loader: async (options) => {
    return options.context.queryClient.ensureQueryData(listsQueryOptions());
  },
  pendingComponent: () => PendingComponent(),
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
  const sidebarRightContext = React.useContext(SidebarRightContext);
  const [isCreatingList, setIsCreatingList] = React.useState(false);
  const { data } = useSuspenseQuery(listsQueryOptions());
  const [searchTerm, setSearchTerm] = React.useState<string>("");
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
      console.log(data);
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
    }
  };

  const handleListClick = (listId: string) => {
    console.log("list clicked", listId);
    if (sidebarRightContext) {
      sidebarRightContext.setOpen(true);
      sidebarRightContext.setInfoPaneOpen(false);
      sidebarRightContext.setSelectedListId(listId);
    }
  };

  const handleMouseOverList = async (listId: string) => {
    console.log("listitems being ensured for list", listId);
    await queryClient.ensureQueryData(listItemsQueryOptions(listId));
  };

  return (
    <div className="flex h-full flex-col">
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
      <ScrollArea className="flex-1">
        <main className="flex-1 overflow-auto p-6">
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
              className="flex items-center gap-4 border-b rounded-md border my-1 p-4 transition-colors cursor-pointer hover:bg-accent hover:text-accent-foreground"
              onClick={() => handleListClick(list.id)}
              onMouseOver={() => handleMouseOverList(list.id)}
            >
              <div className="h-6 w-6 rounded-full bg-muted" />
              <div>{list.name}</div>
              <div className="flex items-center">
                <CalendarDays className="mr-2 h-4 w-4" />
                <p className="">{list.updated_at_formatted}</p>
              </div>
              <p className="">{list.completed ? "Complete" : "Incomplete"}</p>
            </div>
          ))}
          {isMobile && <div className="h-8" />}
        </main>
      </ScrollArea>
    </div>
  );
}
