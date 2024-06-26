import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";
import topLevelAwait from "vite-plugin-top-level-await";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/mina-connector/",
  plugins: [
    svelte({
      onwarn: (warning, handler) => {
        const { code, filename } = warning;
        if (code === "css-unused-selector") {
          return;
        }
        handler?.(warning);
      },
    }),
    topLevelAwait(),
  ],
});
