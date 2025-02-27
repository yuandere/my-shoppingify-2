import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import clsx from "clsx";

import { NavBar } from "@/components/NavBar";
import {
  SidebarInset,
  SidebarProvider as UISidebarProvider,
} from "@/components/ui/sidebar";
import { SidebarProvider } from "@/shared/sidebarProvider";
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
  pendingComponent: () => <div>Loading...</div>,
});

function AuthLayout() {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <UISidebarProvider>
        <NavBar />
        <SidebarInset>
          <div
            className={clsx(isMobile && "w-screen", !isMobile && "w-[66vw]")}
          >
            <Outlet />
            {isMobile && <div className="h-20" />}
          </div>
        </SidebarInset>
        <SidebarRight />
      </UISidebarProvider>
    </SidebarProvider>
  );
}
