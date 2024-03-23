import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import topLevelAwait from "vite-plugin-top-level-await";

// https://vitejs.dev/config/
export default defineConfig({
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
