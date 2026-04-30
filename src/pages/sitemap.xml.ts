import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const GET: APIRoute = async () => {
  const posts = await getCollection("blog");

  const baseUrl = "https://nazimcanislam-dev.vercel.app";
  const today = new Date().toISOString().split("T")[0];

  const staticPages = ["", "about", "projects", "blog", "contact"];

  const blogUrls = posts.map(
    (post) => `  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${post.data.pubDate.toISOString().split("T")[0]}</lastmod>
  </url>`,
  );

  const staticUrls = staticPages.map(
    (page) => `  <url>
    <loc>${baseUrl}/${page}</loc>
    <lastmod>${today}</lastmod>
  </url>`,
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...blogUrls].join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
};
