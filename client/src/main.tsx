import { StrictMode } from "react";

import { BrowserRouter } from "react-router";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { createRoot } from "react-dom/client";

import App from "./App";
import "./index.css";
import AppToaster from "./shared/components/app-toaster";

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
