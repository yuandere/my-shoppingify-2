import { Link, useNavigate } from "@tanstack/react-router";
import {
  ChartLine,
  ListCheck,
  Settings,
  SquareMousePointer,
  LogOut,
  UserRound,
  WandSparkles,
  type LucideIcon,
} from "lucide-react";
import clsx from "clsx";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import ThemeToggle from "./ThemeToggle";
import CartButton from "./CartButton";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  title: string;
  to: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  {
    title: "Generate",
    to: "/generate",
    icon: WandSparkles,
  },
  {
    title: "Items",
    to: "/items",
    icon: SquareMousePointer,
  },
  {
    title: "Lists",
    to: "/lists",
    icon: ListCheck,
  },
  {
    title: "Stats",
    to: "/stats",
    icon: ChartLine,
  },
];

export function NavBar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const isMobile = useIsMobile();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate({ to: "/" });
    } catch (error) {
      console.error("Error logging out: ", error);
      const err = error as Error;
      const message = err.message || "Something went wrong";
      toast.error(message);
    }
  };

  return (
    <Sidebar
      collapsible="none"
      className={clsx(
        "flex flex-col",
        !isMobile && "w-14 h-screen border-r shrink-0",
        isMobile &&
          "absolute z-20 left-0 bottom-0 w-screen h-14 border-t flex-row"
      )}
      {...props}
    >
      <SidebarHeader
        className={clsx(
          "flex items-center justify-center",
          isMobile && "flex-row"
        )}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer grid place-items-center border-2 border-muted-foreground/50">
              {/* <AvatarImage src="" /> */}
              <AvatarFallback className="text-3xl"><UserRound /></AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isMobile && (
              <DropdownMenuItem asChild>
                <ThemeToggle />
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild>
              <Link to="/settings" className="flex items-center gap-2">
                <Settings className="size-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-2 text-destructive focus:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="size-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {!isMobile && <ThemeToggle />}
      </SidebarHeader>

      <SidebarContent
        className={clsx(
          "flex flex-col items-center justify-center justify-items-center gap-4 [&_li]:list-none",
          isMobile && "flex-row"
        )}
      >
        {navItems.map((item) => (
          <SidebarMenuItem key={item.to}>
            <SidebarMenuButton asChild className="relative h-10 w-10">
              <Link
                to={item.to}
                activeProps={{
                  className: "bg-primary/10 text-primary",
                }}
                className={
                  "grid place-items-center h-10 w-10 rounded-md text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                }
              >
                {({ isActive }) => (
                  <div className="flex items-center justify-items-center">
                    <item.icon className="h-5 w-5" />
                    <span className="sr-only">{item.title}</span>
                    {isActive && (
                      <span className="absolute inset-x-0 -bottom-px h-[2px] bg-primary" />
                    )}
                  </div>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarContent>

      <SidebarFooter
        className={clsx(
          "pb-4 flex items-center justify-center",
          isMobile && "flex-row"
        )}
      >
        <CartButton />
      </SidebarFooter>
    </Sidebar>
  );
}
