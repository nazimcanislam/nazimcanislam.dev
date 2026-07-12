// @ts-check
import { defineConfig } from "astro/config";
import icon from "astro-icon";
import vercel from "@astrojs/vercel";

import sitemap from "@astrojs/sitemap";
import compress from "astro-compress";

// https://astro.build/config
export default defineConfig({
  site: "https://nazimcanislam-dev.vercel.app",

  output: "static",

  i18n: {
    locales: ["en", "tr"],
    defaultLocale: "en",
    routing: { prefixDefaultLocale: false, fallbackType: "rewrite" },
    fallback: { tr: "en" },
  },

  integrations: [
    icon(),
    sitemap({
      i18n: {
        defaultLocale: "en",
        locales: {
          en: "en-US",
          tr: "tr-TR",
        },
      },
    }),
    compress({ CSS: false }),
  ],

  build: { inlineStylesheets: "auto" },

  adapter: vercel({ imageService: false }),

  markdown: {
    shikiConfig: {
      theme: "catppuccin-macchiato",
      wrap: true,
    },
  },
});
