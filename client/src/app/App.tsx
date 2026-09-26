import { Suspense } from "react";

import ErrorBoundary from "@/shared/components/error-boundary";
import { ScrollToTop } from "@/shared/components/scroll-to-top";

import AppRoutes from "./routes";

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div className="min-h-screen" />}>
        <ScrollToTop />
        <AppRoutes />
      </Suspense>
    </ErrorBoundary>
  );
}
