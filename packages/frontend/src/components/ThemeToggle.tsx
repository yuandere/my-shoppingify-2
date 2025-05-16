import { useState, useEffect, forwardRef } from "react";
import clsx from "clsx";
import { useQueryClient } from "@tanstack/react-query";
import { Sun, Moon } from "lucide-react";

type ThemeToggleProps = {
  dropdown?: boolean;
};

const ThemeToggle = forwardRef<HTMLButtonElement, ThemeToggleProps>(
  ({ dropdown }, ref) => {
    const queryClient = useQueryClient();
    const themeInit =
      queryClient.getQueryData(["ui", "theme-dark"]) ??
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const [isDarkMode, setIsDarkMode] = useState<boolean | unknown>(themeInit);

    useEffect(() => {
      if (isDarkMode) {
        document.documentElement.classList.add("dark");
        queryClient.setQueryData(["ui", "theme-dark"], true);
      } else {
        document.documentElement.classList.remove("dark");
        queryClient.setQueryData(["ui", "theme-dark"], false);
      }
    }, [isDarkMode, queryClient]);

    return (
      <button
        ref={ref}
        onClick={() => setIsDarkMode((prevMode: unknown) => !prevMode)}
        // hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400
        className={clsx(
          `p-2 rounded-full transition-colors`,
          dropdown
            ? "flex items-center gap-2 text-sm"
            : "w-9 h-9 grid place-items-center focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
        )}
      >
        {isDarkMode ? (
          <Moon
            className={clsx("text-gray-200", dropdown ? "w-4 h-4" : "w-5 h-5")}
          />
        ) : (
          <Sun
            className={clsx(
              "text-yellow-500",
              dropdown ? "w-4 h-4" : "w-5 h-5"
            )}
          />
        )}
        {dropdown && <span>Toggle Theme</span>}
      </button>
    );
  }
);

export default ThemeToggle;
