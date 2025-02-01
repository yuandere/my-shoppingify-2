import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import clsx from "clsx";

import { NavBar } from "@/components/NavBar";
import {
  SidebarInset,
  SidebarProvider as UISidebarProvider,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
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
  // const router = useRouter();
  // const navigate = Route.useNavigate();

  // const handleLogout = () => {
  // 	if (window.confirm('Are you sure you want to logout?')) {
  // 		auth.logout().then(() => {
  // 			router.invalidate().finally(() => {
  // 				navigate({ to: '/' });
  // 			});
  // 		});
  // 	}
  // };

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
        <Toaster />
      </UISidebarProvider>
    </SidebarProvider>
  );
}
