import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Short commit SHA for the footer "Rev" (Vercel provides VERCEL_GIT_COMMIT_SHA at build time).
const sha = (process.env.VERCEL_GIT_COMMIT_SHA || "").slice(0, 7);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    "import.meta.env.VITE_GIT_SHA": JSON.stringify(sha),
  },
});
