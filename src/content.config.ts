import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
  // Astro 6+ ile eski (legacy) koleksiyon API'si tamamen kaldırıldı.
  // İçerik artık bir "loader" ile yükleniyor; `type: "content"` yok.
  // glob loader, src/content/blog altındaki tüm markdown dosyalarını okur.
  // Üretilen `id` = base'e göre dosya yolu (uzantısız), yani eski `slug` ile
  // aynı değer → mevcut /blog/<id> URL'leri ve canonical yapısı korunur.
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
