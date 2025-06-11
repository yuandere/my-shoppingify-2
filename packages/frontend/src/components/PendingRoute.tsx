import { clsx } from "clsx";
import { Spinner } from "./Spinner";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

function PendingRoute() {
  const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isMobile = useIsMobile();
  return (
    <div
      className={clsx(
        "flex h-screen items-center justify-center bg-background",
        isDarkMode && "bg-[hsl(0,0%,3.9%)]",
        isMobile && "h-[calc(100vh-4rem)]"
      )}
    >
      <p className={clsx("mr-4", isDarkMode && "text-white")}>Loading...</p>
      <Spinner dark={isDarkMode} />
    </div>
  );
}

export default PendingRoute;
