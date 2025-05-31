import * as React from "react";
import clsx from "clsx";
import {
  useQueryErrorResetBoundary,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from "recharts";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import PendingRoute from "@/components/PendingRoute";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import useScrollHideNav from "@/lib/hooks/useScrollHideNav";
import { fetchItems, fetchLists } from "@/lib/dashboardFetchers";
import { getMonthlyListActivity, getTopCategories } from "@/lib/utils";
import { listsKey, itemsKey } from "@/lib/queryOptions";

export const Route = createFileRoute("/_auth/stats")({
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
  pendingComponent: PendingRoute,
});

function RouteComponent() {
  const isMobile = useIsMobile();
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const { data: lists } = useSuspenseQuery({
    queryKey: listsKey,
    queryFn: fetchLists,
  });
  const { data: items } = useSuspenseQuery({
    queryKey: itemsKey,
    queryFn: fetchItems,
  });

  const monthlyActivity = React.useMemo(
    () => getMonthlyListActivity(lists),
    [lists]
  );
  const categoryStats = React.useMemo(() => getTopCategories(items), [items]);

  useScrollHideNav(scrollAreaRef);

  return (
    <div
      className={clsx(
        "flex h-screen flex-col",
        isMobile && "h-[calc(100vh-4rem)]"
      )}
    >
      <ScrollArea className="h-full" ref={scrollAreaRef}>
        <main
          className={clsx(
            "flex flex-col items-center gap-6 p-6 pr-10 mt-4",
            !isMobile && "mt-8"
          )}
        >
          <h2 className="text-2xl font-semibold mb-4 md:mb-8">List Activity</h2>
          <div className="w-full md:w-4/5 max-w-4xl h-[500px]">
            <ResponsiveContainer width={"100%"} height={"100%"}>
              <BarChart data={monthlyActivity}>
                <XAxis dataKey="month" />
                <YAxis dataKey="listActivity" />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="listActivity"
                  fill="var(--accent-color)"
                  name="Items added to lists"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <h2 className="text-2xl font-semibold mt-8 mb-4 md:mt-16 md:mb-8">
            Top Categories
          </h2>
          <div className="w-full md:w-4/5 max-w-4xl h-[500px]">
            <ResponsiveContainer width={"100%"} height={"100%"}>
              <BarChart data={categoryStats}>
                <XAxis dataKey="category" />
                <YAxis dataKey="numberItems" />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="numberItems"
                  fill="var(--accent-color)"
                  name="Number of items"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </main>
      </ScrollArea>
    </div>
  );
}
