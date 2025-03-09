import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 5, // 5 minutes
      staleTime: 0,
      refetchOnWindowFocus: false,
    },
  },
});

queryClient.setQueryDefaults(["ui", "theme-dark"], {
  gcTime: Infinity,
  staleTime: Infinity,
  refetchOnWindowFocus: false,
});
