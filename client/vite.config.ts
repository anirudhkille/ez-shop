import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (
              id.includes("react") ||
              id.includes("react-dom") ||
              id.includes("react-router")
            ) {
              return "vendor-react";
            }
            if (
              id.includes("@tanstack") ||
              id.includes("axios") ||
              id.includes("zustand")
            ) {
              return "vendor-state";
            }
            if (
              id.includes("lucide-react") ||
              id.includes("motion") ||
              id.includes("sonner")
            ) {
              return "vendor-ui";
            }
            return "vendor";
          }
        },
      },
    },
  },
});
