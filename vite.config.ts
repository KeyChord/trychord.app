import react from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { fumadocsMdx } from "fumadocs-mdx/vite";
import { nitro } from "nitro/vite";

const staging = process.env.VITE_CHORD_CHANNEL === "staging";

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    fumadocsMdx(),
    tailwindcss(),
    tanstackStart({
      prerender: {
        enabled: true,
      },
    }),
    react(),
    nitro({
      preset: "cloudflare_module",
      compatibilityDate: "2026-10-29",
      cloudflare: {
        // Wrangler follows Nitro's generated config, which accepts a single environment.
        wrangler: staging
          ? {
              name: "chord-website-staging",
              workers_dev: false,
              preview_urls: false,
              routes: [{ pattern: "staging.trychord.app", custom_domain: true }],
            }
          : {
              routes: [
                {
                  pattern: "trychord.app/*",
                  zone_id: "be4240cf827fe36e05f3a8cadbd0f892",
                },
              ],
            },
      },
    }),
  ],
  resolve: {
    tsconfigPaths: true,
    alias: {
      tslib: "tslib/tslib.es6.js",
    },
  },
});
