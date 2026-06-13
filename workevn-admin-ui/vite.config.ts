import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API calls to backend during local development
      "/api": {
        target: process.env.VITE_ADMIN_API_URL ?? "http://localhost:9999",
        changeOrigin: true,
        secure: false,
        ws: false
      }
    }
  }
});
