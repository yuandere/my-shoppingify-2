import { clsx } from "clsx";
import { Spinner } from "./Spinner";

function PendingComponent() {
  const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
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
}

export default PendingComponent;
