import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/marblegame/" : "/",
  server: { host: true },
  optimizeDeps: { exclude: ["@babylonjs/havok"] },
}));
