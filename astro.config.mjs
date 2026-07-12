// @ts-check
import { defineConfig } from "astro/config";
import icon from "astro-icon";
import vercel from "@astrojs/vercel";

import sitemap from "@astrojs/sitemap";
import compress from "astro-compress";

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

  // NOT: astro-compress'in CSS motoru (csso), Astro 7'nin yerel minify'ının
  // ürettiği modern aralık sözdizimini -- ör. @media (width<=640px) -- tanımıyor
  // ve bu media bloklarını sessizce SİLİYOR. Sonuç: build/preview'da genişlik
  // tabanlı media query'ler kaybolup mobil düzen bozuluyor (dev'de sorun yok,
  // çünkü compress yalnızca build'de çalışır). Astro 7 zaten CSS'i kendisi
  // minify ettiği için bu ikinci geçiş hem gereksiz hem yıkıcı; CSS'i kapatıyoruz.
  integrations: [icon(), sitemap({
    i18n: {
      defaultLocale: "en",
      locales: {
        en: "en-US",
        tr: "tr-TR"
      }
    }
  }), compress({ CSS: false })],

  build: { inlineStylesheets: "auto" },

  // Adapter'ı tutuyoruz ama imageService'i KAPATIYORUZ: görseller build
  // sırasında (sharp ile) optimize edilip statik servis edilsin; böylece
  // runtime'da görsel için çalışan bir fonksiyon da kalmaz.
  adapter: vercel({ imageService: false }),

  markdown: {
    shikiConfig: {
      theme: "catppuccin-macchiato",
      wrap: true,
    },
  },
});
