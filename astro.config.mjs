// @ts-check
import { defineConfig } from "astro/config";
import icon from "astro-icon";
import vercel from "@astrojs/vercel";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://nazimcanislam-dev.vercel.app",
  integrations: [icon(), sitemap()],
  output: "server",
  adapter: vercel({
    imageService: true,
  }),
  markdown: {
    shikiConfig: {
      theme: "catppuccin-macchiato",
      wrap: true,
    },
  },
});
