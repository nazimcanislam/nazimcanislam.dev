// @ts-check
import { defineConfig } from "astro/config";
import icon from "astro-icon";
import vercel from "@astrojs/vercel";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://nazimcanislam-dev.vercel.app",

  // STATİK çıktı: her sayfa build sırasında bir kez HTML'e dönüşür ve
  // Vercel'in CDN'inden anında servis edilir. Artık istek başına çalışan
  // serverless fonksiyon (ve onun cold-start beyaz ekranı) yok.
  output: "static",

  // URL tabanlı çok dillilik. Varsayılan dil (en) ön eksiz kök URL'lerde,
  // Türkçe ise /tr altında yayınlanır. İçerik tek dosyadan (t(lang)) geldiği
  // için sayfaları dil başına KOPYALAMAYA gerek yok; fallback "rewrite" ile
  // Astro /tr/* rotalarını aynı sayfa dosyalarından üretir.
  i18n: {
    locales: ["en", "tr"],
    defaultLocale: "en",
    routing: { prefixDefaultLocale: false, fallbackType: "rewrite" },
    fallback: { tr: "en" },
  },

  integrations: [icon(), sitemap()],

  // Adapter'ı tutuyoruz ama imageService'i KAPATIYORUZ: görseller build
  // sırasında (sharp ile) optimize edilip statik servis edilsin; böylece
  // runtime'da görsel için çalışan bir fonksiyon da kalmaz.
  adapter: vercel(),

  markdown: {
    shikiConfig: {
      theme: "catppuccin-macchiato",
      wrap: true,
    },
  },
});
