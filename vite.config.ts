import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig(({ command }) => ({
  plugins: [cloudflare()],
  base: command === "build" ? (process.env.VITE_BASE_PATH || "/official_checklist/") : "/"
}));
