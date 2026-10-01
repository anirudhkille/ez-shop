import { StrictMode } from "react";

import { BrowserRouter } from "react-router";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { createRoot } from "react-dom/client";

import App from "./app/App";
import { setSentryUser } from "./app/sentry";
import { useUserStore } from "./features/auth";
import "./index.css";
import AppToaster from "./shared/components/app-toaster";
import { setAuthBridge } from "./shared/lib/axiosInstance";

setAuthBridge({
  getToken: () => useUserStore.getState().token ?? null,
  setToken: (token) => useUserStore.getState().setUser({ token }),
  clearSession: () => useUserStore.getState().logout(),
});

useUserStore.subscribe((state) => {
  setSentryUser(state.token ? { id: state.email ?? "unknown" } : null);
});

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000 } },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
    <AppToaster />
  </StrictMode>
);
