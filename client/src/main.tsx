import { StrictMode } from "react";

import { BrowserRouter } from "react-router";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { createRoot } from "react-dom/client";

import App from "./app/App";
import useUserStore from "./features/auth/store/userStore";
import "./index.css";
import AppToaster from "./shared/components/app-toaster";
import { setAuthBridge } from "./shared/lib/axiosInstance";

// The shared axios instance cannot import the auth store, so hand it the
// session operations it needs. Registered before render so the very first
// request already carries a token.
setAuthBridge({
  getToken: () => useUserStore.getState().token ?? null,
  setToken: (token) => useUserStore.getState().setUser({ token }),
  clearSession: () => useUserStore.getState().logout(),
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
