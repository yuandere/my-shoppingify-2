import {
  Outlet,
  createFileRoute,
  redirect,
  useRouteContext,
} from "@tanstack/react-router";
import clsx from "clsx";

import { NavBar } from "@/components/NavBar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Spinner } from "@/components/Spinner";
import { SidebarRightProvider } from "@/shared/SidebarRightProvider";
import { SidebarRight } from "@/components/sidebar/SidebarRight";
import { useIsMobile } from "@/hooks/useIsMobile";

export const Route = createFileRoute("/_auth")({
  beforeLoad: ({ context, location }) => {
    if (context.auth.isInitializing) {
      return;
    }
    if (context.auth.isAuthenticated === false) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: AuthLayout,
  pendingComponent: () => {
    const isDarkMode = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    return (
      <div
        className={clsx(
          "w-screen h-screen flex items-center justify-center bg-background",
          isDarkMode && "bg-[hsl(0,0%,3.9%)]"
        )}
      >
        <p className={clsx("mr-4", isDarkMode && "text-white")}>Loading...</p>
        <Spinner dark={isDarkMode} />
      </div>
    );
  },
});

function AuthLayout() {
  const isMobile = useIsMobile();
  const { auth } = useRouteContext({ from: "/_auth" });
  const isDemoUser = auth?.user?.is_anonymous;

  return (
    <>
      <SidebarRightProvider>
        <SidebarProvider>
          <NavBar />
          <SidebarInset className="flex-1">
            <div className={clsx("h-full w-full", isMobile && "w-screen")}>
              <Outlet />
            </div>
          </SidebarInset>
          <SidebarRight />
        </SidebarProvider>
      </SidebarRightProvider>
      {isDemoUser && (
        <div className="fixed inset-0 pointer-events-none">
          <div
            className={clsx(
              "absolute bottom-8 w-fit left-0 right-0 mx-auto",
              isMobile && "bottom-24"
            )}
          >
            <div className="flex items-center gap-2 opacity-50">
              <span className="h-[1px] w-3 bg-muted-foreground"></span>
              <p className="text-lg text-muted-foreground">Demo Mode</p>
              <span className="h-[1px] w-3 bg-muted-foreground"></span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
