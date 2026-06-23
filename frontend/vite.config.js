import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Suprimimos el warning de chunk > 500 KB; los chunks grandes ya están
    // code-split por feature (graph + exporter lazy loaded).
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Vendor chunk dedicado para React. Permite cachear React entre
        // deploys aunque cambie el código de la app (mejor first-load para
        // usuarios recurrentes).
        manualChunks(id) {
          if (id.includes("node_modules/react/") ||
              id.includes("node_modules/react-dom/") ||
              id.includes("node_modules/scheduler/")) {
            return "react";
          }
        },
      },
    },
  },
});
