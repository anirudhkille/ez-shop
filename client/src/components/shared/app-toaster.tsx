import { Toaster } from "sonner";

/**
 * Sonner reads its colours from the `--normal-*` / `--success-*` / `--error-*`
 * custom properties, which are themed in index.css. `richColors` stays off so
 * those win, and the theme is pinned to dark to match the app's single dark
 * palette.
 */
export default function AppToaster() {
  return (
    <Toaster
      position="top-center"
      theme="dark"
      toastOptions={{
        classNames: {
          toast: "font-body text-foreground",
          title: "font-body",
          description: "font-body",
        },
      }}
    />
  );
}
