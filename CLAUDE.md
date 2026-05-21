# CLAUDE.md — hierynomus-site

Personal site and speaker profile for Jeroen van Erp.
Live at **hierynomus.com**, deployed via Cloudflare Pages.

## Stack

- **Astro 5** (Content Layer API with `glob` loader — NOT legacy `src/content/config.ts`)
- **Tailwind CSS v4** (Vite plugin, not PostCSS)
- **MDX** for blog posts
- **Node LTS** via `mise` (`mise.toml` in project root)
- **Cloudflare Pages** — GitHub Actions workflow at `.github/workflows/deploy.yml`

## Commands

```bash
npm run dev       # dev server at localhost:4321
npm run build     # production build → dist/
npm run preview   # preview the build
```

Always run `npm run build` to verify before committing — it catches type errors and content schema violations.

## Design system — "Stage Light"

SUSE brand palette, class-based dark mode (`.dark` on `<html>`):

| Token       | Hex       | Usage                        |
|-------------|-----------|------------------------------|
| Pine        | `#0c322c` | Primary dark background      |
| Midnight    | `#192072` | Secondary dark               |
| Jungle      | `#30ba78` | Primary green accent         |
| Mint        | `#90ebcd` | Light green accent           |
| Persimmon   | `#fe7c3f` | CTA / highlight colour       |
| Fog         | `#efefef` | Light background / text      |

## Project structure

```
src/
├── config/
│   ├── content.ts     # ALL static strings: META, BIO, CTA, HERO, SECTIONS
│   ├── site.ts        # SITE (name, url, email, location), SOCIAL, TOPICS
│   └── talks.ts       # TalkType union + TYPE_CONFIG (label + badge classes)
├── content/
│   ├── blog/          # .md / .mdx — schema: title, date, description, tags, draft, featured
│   ├── talks/         # .md — see talk schema below
│   ├── writing/       # .md — external articles (title, publication, url, date, tags, description)
│   └── projects/      # .md — OSS projects (name, description, url, language, license)
├── components/        # Astro components
├── layouts/Layout.astro
├── lib/
│   ├── og.ts          # OG image generation (satori + resvg, two-pass compositing for images)
│   └── reading-time.ts
└── pages/
    ├── index.astro
    ├── about.astro
    ├── 404.astro
    ├── blog/[slug].astro, blog/index.astro
    ├── talks/[slug].astro, talks/index.astro
    ├── topics/[tag].astro, topics/index.astro
    ├── writing/index.astro
    └── og/            # OG image endpoints (.png.ts files)
public/
├── jeroen-van-erp.jpg # Headshot (from KubeCon sched profile)
├── images/talks/      # Talk images (photos, slides, SVG backgrounds)
└── robots.txt
```

## Content schema — talks

```yaml
---
title: "Talk title"
event: "Event Name"
date: 2026-01-01          # session date
endDate: 2026-01-03       # optional, for multi-day conferences
type: conference          # conference | keynote | meetup | podcast | webinar | workshop
tags: [kubernetes, security]
conference_url: https://...   # optional, link to session page
video_url: https://...        # optional
slides_url: https://...       # optional
image: /images/talks/...      # optional, used in page header + OG image
featured: true                # shows on homepage
bookable: true                # shows "Get in Touch" CTA on talk page
co_presenters:                # optional
  - name: Person Name
    url: https://...          # optional
---
Abstract text in Markdown.
```

## Working conventions

- **Always work on a branch + PR** — never commit directly to `main`
- **Pin GitHub Actions to a commit SHA**, not a tag (e.g. `actions/checkout@abc123 # v4`). Use `gh api repos/{owner}/{repo}/git/refs/tags/{tag} --jq '.object.sha'` to resolve. If the tag points to an annotated tag object rather than a commit, follow the `.object.sha` one level further.
- **Use `mise` for all tool versions** — `mise.toml` in the project root is the single source of truth. Don't add `.nvmrc`, `.node-version`, or `actions/setup-node` alongside it. Pin to specific versions or named tags (e.g. `node = "lts"`, `node = "22.3.0"`) rather than `latest`.
- **Build before committing** — `npm run build` catches type errors and content schema violations at compile time.
- **Prefer `gh` CLI** for all GitHub operations (PRs, releases, API lookups) over browser or raw `curl`.
- **Create PRs with a description** covering what changed, why, and a test plan checklist.
- **Update `## TODO` at the end of every task** — check off completed items, add newly discovered work, keep descriptions current.

## Content conventions

- **Use `.id` not `.slug`** when referencing content entries (Astro 5 Content Layer API)
- **All page strings** (meta descriptions, bio, CTAs, section headings) live in `src/config/content.ts` — don't hardcode them in pages
- **Talk types** — adding a new type requires updating both `src/config/talks.ts` (TYPE_CONFIG) and `src/content.config.ts` (z.enum)
- **No nested `<a>` elements** — invalid HTML, breaks flex layout in browsers
- **OG images** — two-pass compositing: satori renders overlay (no background), resvg composites with `<image>` element. `backgroundImage` CSS in satori produces an SVG `<pattern>` that resvg cannot render — always use the compositing path for real images
- **Podcast talks** — never show slides section; use `🎙 Listen` label instead of `▶ Watch`

## Deployment

GitHub Actions (`deploy.yml`) builds and deploys on push to `main` and on PRs.
- Uses `cloudflare/wrangler-action` (NOT the deprecated `pages-action`)
- `gitHubToken` passed to wrangler-action to create GitHub deployment status on PRs
- Cleanup job deletes preview deployments when a PR is closed
- Cloudflare Pages project name: `hierynomus-speaking-site`
- Production domain: `hierynomus.com`
- **Analytics**: enabled via Cloudflare Web Analytics automatic injection — no script tag in the codebase. Enable/manage at dash.cloudflare.com → Web Analytics.
- **GitHub project loader**: fetches live star/fork counts from the GitHub API at build time. Repos listed in `src/config/projects.ts`. Unauthenticated limit is 60 req/hr (fine for 3 repos). Set `GITHUB_TOKEN` secret in GitHub Actions / Cloudflare Pages env vars to raise to 5 000 req/hr.

## Person

**Jeroen van Erp** — Technology Advocate at SUSE, Cloud Native speaker, open source contributor.
Location: Netherlands. Speaks: Dutch & English.
GitHub: hierynomus · LinkedIn: jvanerp · Twitter: @hierynomus · Email: speaking@hierynomus.com
Mini-farm owner (sheep).

## TODO

Items to implement or investigate. Check them off as they are done.

### SEO / discoverability
- [x] Favicon set — SVG + ICO (32 px) + apple-touch-icon (180 px) + 192 px + 512 px PNGs. Generated via `scripts/generate-favicons.js` (satori + resvg). All link tags in Layout.astro. (PR #9)
- [x] Twitter / X card meta — `twitter:site` and `twitter:creator` tags added to Layout.astro. Handle in `SOCIAL.twitterHandle`. (PR #10)

### Performance
- [ ] Image optimisation — Susecon keynote image is ~4.5 MB JPEG; convert to WebP/AVIF or resize at source. Consider Astro `<Image>` component for automatic optimisation.
- [X] Self-host Inter — Google Fonts stylesheet is render-blocking (~720 ms savings). Swap to `@fontsource/inter` (already installed for OG/favicon pipeline) with `font-display: optional`.
- [x] Preload hero headshot — `<link rel="preload" as="image" fetchpriority="high">` + `fetchpriority="high"` on the `<img>`, scoped to `index.astro` head slot. (PR #12)

### Content
- [ ] Cloud Native London abstract — the meetup page is JS-rendered; fetch/extract the real abstract and update `cloud-native-london-2026.md`.
- [ ] Press kit / media page — headshot downloads, bio blurbs, logo files, past coverage links.
- [ ] Testimonials — quotes from event organisers; add a section to the home page and/or about page.

### Features
- [x] View Transitions — Astro `ClientRouter` added to Layout.astro for smooth page-to-page navigation. (PR #10)
- [x] Social sharing buttons — `ShareButtons.astro` component (X, LinkedIn, copy-link) on blog posts and talk detail pages. (PR #10)
- [ ] Calendar / booking link — Calendly or equivalent embedded or linked from the "Get in Touch" CTA.
- [ ] Newsletter / mailing list — small sign-up form or Buttondown/ConvertKit embed; optional but drives repeat visits.
- [ ] Speaking topics page — dedicated `/topics` page already exists; consider richer content (full descriptions, audience takeaways, sample slides).

### Quality
- [x] Accessibility pass — WCAG AA colour contrast fixes across all pages + brand-colour overrides in global.css. (PR #13)
- [x] Lighthouse audit — **100 / 95 / 100 / 100** (Perf / A11y / Best Practices / SEO) — now **100 / 100 / 100 / 100** after PR #13. See findings below.
- [ ] Imprint / legal page — required for some European events and sponsor decks.

### Lighthouse findings (run 2026-05-21, against local build)

| Category       | Score (before PR #13) | Score (after PR #13) |
|----------------|-----------------------|----------------------|
| Performance    | 100                   | 100                  |
| Accessibility  | 95                    | **100** (light + dark) |
| Best Practices | 100                   | 100                  |
| SEO            | 100                   | 100                  |

**Accessibility — all colour contrast failures resolved (PR #13):**
- Removed all `dark:bg-midnight` card backgrounds → `dark:bg-white/8` (warm teal overlay on pine)
- Brand colours: `text-jungle` darkened to `#1a7a4a` in light mode via `global.css` override (4.9:1 on white); CTA button text swapped from white to pine on `bg-jungle`/`bg-persimmon` (5.4:1 / 5.2:1)
- All secondary text bumped from `/40–/55` to `/65–/75` across every component and page

**Performance — render-blocking resource (est. 720 ms savings):**
Google Fonts stylesheet is render-blocking. Fix: swap to `font-display: optional` or self-host Inter (already available via `@fontsource/inter`; `og.ts` already loads it from there).

**LCP (image not preloaded):**
The hero headshot `jeroen-van-erp.jpg` is the LCP element but is not preloaded. Add `<link rel="preload" as="image" href="/jeroen-van-erp.jpg" />` in `Layout.astro` when on the home page (or unconditionally — it's small).

**Image delivery:**
Hero headshot is a JPEG; convert to WebP/AVIF for ~20–40% savings. (Same applies to the Susecon keynote image at ~4.5 MB.)
