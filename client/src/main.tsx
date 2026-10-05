import { StrictMode } from "react";

import { createRoot } from "react-dom/client";

import { App } from "./app/App";
import { AppProviders } from "./app/providers/app-providers";
import { initSessionBridge } from "./app/providers/session-bridge";
import "./index.css";
import { AppToaster } from "./shared/components/app-toaster";

initSessionBridge();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
    <AppToaster />
  </StrictMode>
);
