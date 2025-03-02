import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import {
  createRouter,
  ErrorComponent,
  Link,
  RouterProvider,
} from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";
import { AuthProvider } from "@/shared/authProvider";
import { useAuth } from "./hooks/useAuth";
import { createIDBPersister } from "./lib/createIDBpersister";
import { queryClient } from "./lib/queryClient";
import { Spinner } from "./components/Spinner";

const persister = createIDBPersister();

const router = createRouter({
  routeTree,
  context: {
    auth: undefined!,
    queryClient: queryClient,
  },
  defaultErrorComponent: ({ error }) => <ErrorComponent error={error} />,
  defaultPendingComponent: () => (
    <div className="p-2 text-2xl">
      <Spinner />
    </div>
  ),
  defaultNotFoundComponent: () => (
    <div>
      <p>404 Not Found</p>
      <Link to="/">Go to Home</Link>
    </div>
  ),
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function InnerApp() {
  const auth = useAuth();

  if (auth.isInitializing) {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center">
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen">
      <RouterProvider router={router} context={{ auth }} />
    </div>
  );
}

export function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      <AuthProvider>
        <InnerApp />
      </AuthProvider>
    </PersistQueryClientProvider>
  );
}
