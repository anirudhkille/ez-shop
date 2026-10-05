import { Suspense } from "react";

import { ScrollToTop } from "@/shared/components/scroll-to-top";

import { ErrorBoundary } from "./error-boundary";
import { AppRoutes } from "./routes";

export function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div className="min-h-screen" />}>
        <ScrollToTop />
        <AppRoutes />
      </Suspense>
    </ErrorBoundary>
  );
}
