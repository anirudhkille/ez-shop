import { Toaster } from "sonner";

/** `richColors` stays off so the custom properties in index.css win. */
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
