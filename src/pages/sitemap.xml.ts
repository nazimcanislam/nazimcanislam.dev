import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { profile } from "@data/profile";
import { NAV_LINKS } from "@constants/navigation";

export const GET: APIRoute = async () => {
  const posts = await getCollection("blog", ({ data }) => !data.draft);

  const baseUrl = profile.url;
  const today = new Date().toISOString().split("T")[0];

  const staticPages = ["", ...NAV_LINKS.map((link) => link.href.slice(1))];

  const blogUrls = posts.map(
    (post) => `  <url>
    <loc>${baseUrl}/blog/${post.id}</loc>
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
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
