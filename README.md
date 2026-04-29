# nazimcanislam.dev

> My personal corner of the internet — built to last, not to impress.

![Astro](https://img.shields.io/badge/Astro-BC52EE?style=flat-square&logo=astro&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

---

## What is this?

A personal portfolio site. Not a template, not a boilerplate — built from scratch with opinions.

The goal was simple: a fast, accessible, and honest representation of who I am as a developer. No unnecessary JavaScript, no bloated dependencies, no dark patterns. Just clean markup, good semantics, and a few interactive touches that earn their place.

Pages: **Home · About · Projects · Blog · Contact**

Live at → **[nazimcanislam.dev](https://nazimcanislam.dev)**

---

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Astro (SSR) | Zero-JS by default, island architecture |
| Language | TypeScript | Type safety without the boilerplate |
| Deployment | Vercel | Free tier, edge network, painless CI/CD |
| Styling | Vanilla CSS + CSS Variables | No build step, full control |
| Icons | astro-icon + MDI | Tree-shakeable, accessible |
| Blog | Astro Content Collections | `.md` files, no database needed |
| Images | astro:assets | AVIF/WebP auto-conversion |

---

## Project Structure

```
src/
├── components/
│   ├── layout/        # Header, Footer
│   ├── sections/      # Hero, ApiExplorer, FeaturedProjects...
│   └── ui/            # Button, Badges
├── content/
│   └── blog/          # .md files → blog posts
├── i18n/              # TR/EN translations
├── layouts/           # Base HTML layout
├── pages/             # File-based routing
└── styles/            # base.css, typography.css, utilities.css
```

---

## Getting Started

```sh
# Install dependencies
npm install

# Start dev server (localhost:4321)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

---

## Deployment

This project runs on **Vercel** with the `@astrojs/vercel` adapter.

```sh
# One-time setup
npm i -g vercel
vercel login

# Deploy
vercel
```

Or connect the repo to [vercel.com](https://vercel.com) for automatic deployments on every push — no configuration needed, it picks up `astro.config.mjs` automatically.

For the custom domain, add it under **Project Settings → Domains** in the Vercel dashboard.

---

## Adding a Blog Post

Create a new `.md` file in `src/content/blog/`:

```md
---
title: "Your Post Title"
description: "A short summary."
pubDate: 2025-06-01
tags: ["astro", "typescript"]
draft: false
---

Your content here.
```

That's it. No CMS, no database, no admin panel. Git is the version control, the filesystem is the database. It sounds too simple — until you realize it's the right tool for the job.

---

## A Note on Simplicity

There's a tendency in web development to reach for complexity before it's needed. A personal blog doesn't need authentication, a database, or a content management system. It needs words and a way to render them.

This project leans into that. Every dependency was a deliberate decision. Every feature exists because it had to, not because it was fun to add. The result is a site that builds in seconds, scores 100 on Lighthouse, and can be maintained by opening a text editor.

Simple systems age well. Complex ones don't.

---

## License

MIT — do whatever you want, just don't copy it wholesale and call it yours. 🙂
