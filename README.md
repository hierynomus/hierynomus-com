# hierynomus-site

Personal site and speaker profile for [Jeroen van Erp](https://hierynomus.com) — Technology Advocate at SUSE, Cloud Native speaker, and open source contributor.

Live at **[hierynomus.com](https://hierynomus.com)**.

## Stack

- [Astro 5](https://astro.build) — static site generator
- [Tailwind CSS v4](https://tailwindcss.com) — styling
- [MDX](https://mdxjs.com) — content authoring
- [Cloudflare Pages](https://pages.cloudflare.com) — hosting

## Project structure

```
src/
├── components/       # Reusable Astro components
├── config/           # Site-wide config (site.ts, content.ts, talks.ts)
├── content/
│   ├── blog/         # Blog posts (.md / .mdx)
│   ├── talks/        # Talk entries (.md)
│   ├── writing/      # External writing references (.md)
│   └── projects/     # Open source project entries (.md)
├── layouts/          # Page layouts
├── lib/              # Utilities (OG image generation, reading time)
└── pages/            # Routes
public/
├── images/talks/     # Talk images (photos, slides, SVG OG backgrounds)
└── robots.txt
```

## Content

All content lives in `src/content/` as Markdown files with YAML frontmatter. To add a talk, create a new `.md` file in `src/content/talks/` — the schema is defined in `src/content.config.ts`.

## Commands

| Command           | Action                                      |
| :---------------- | :------------------------------------------ |
| `npm install`     | Install dependencies                        |
| `npm run dev`     | Start local dev server at `localhost:4321`  |
| `npm run build`   | Build production site to `./dist/`          |
| `npm run preview` | Preview the production build locally        |
