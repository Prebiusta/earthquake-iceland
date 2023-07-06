import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/earthquakes": {
        target:
          "https://en.vedur.is/earthquakes-and-volcanism/earthquakes#view=table",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/earthquakes/, ""),
      },
    },
  },
});
