---
title: "Astro ile Kişisel Portfolio Nasıl Yapılır"
description: "Astro, SSR ve TypeScript kullanarak kişisel bir portfolio sitesi geliştirirken öğrendiğim şeyler — performans, i18n ve deployment notları."
pubDate: 2025-01-15
tags: ["astro", "typescript", "web", "portfolio"]
draft: false
---

Bu siteyi yaparken Astro hakkında çok şey öğrendim. Başlangıçta basit bir statik site gibi görünen şey, SSR, i18n ve optimizasyon detaylarıyla birlikte gerçek bir mühendislik problemine dönüştü.

## Neden Astro?

Next.js veya Vite ile başlamayı düşünmüştüm. Ama Astro'nun "zero JS by default" yaklaşımı beni çekti — bir portfolio için gereksiz JavaScript yüklemek istemiyordum. Island Architecture sayesinde sadece ihtiyaç duyulan yerlerde (mesela API Explorer gibi interaktif bileşenler) JS çalışıyor.

## SSR vs Static

Astro varsayılan olarak statik üretir, ama `output: "server"` ile SSR moduna geçmek mümkün. Ben bu siteyi SSR ile kurdum çünkü:

- `Accept-Language` header'ından dil tespiti yapmam gerekiyordu
- Vercel adapter ile deploy çok kolay
- Gelecekte dinamik içerik (blog, GitHub API) için hazır olmak istedim

## Performans ve Lighthouse

Lighthouse'da tüm kategorilerde 100 almak düşündüğümden zor olmadı, ama birkaç detay var:

```astro
<Picture
  src={me}
  formats={["avif", "webp", "jpeg"]}
  loading="eager"
  fetchpriority="high"
/>
```

`astro:assets`'in `Picture` bileşeni formatları otomatik convert ediyor. AVIF + WebP + JPEG fallback — bunu manuel yapmak zorunda değilsiniz.

## Sonuç

Bir sonraki yazıda Canvas ile bubble animasyonu yaparken karşılaştığım `OffscreenCanvas` ve Web Worker sorunlarından bahsedeceğim.
