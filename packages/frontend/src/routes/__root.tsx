import { QueryClient } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
// import { TanStackRouterDevtools } from "@tanstack/router-devtools";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { Toaster } from "@/components/ui/sonner";
import { IAuthContext } from "@/shared/AuthContext";

interface MyRouterContext {
  auth: IAuthContext;
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <Outlet />
      <Toaster />
      {/* <TanStackRouterDevtools position="bottom-right" initialIsOpen={false} />
      <ReactQueryDevtools
        buttonPosition="bottom-right"
        initialIsOpen={false}
      ></ReactQueryDevtools> */}
    </>
  ),
});
