import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Static deployments such as Cloudflare Pages/custom domains serve from '/'.
  // GitHub Pages overrides this in its workflow with VITE_BASE_PATH=/official_checklist/.
  base: command === "build" ? (process.env.VITE_BASE_PATH || "/") : "/"
}));
