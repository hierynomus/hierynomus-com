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

## Person

**Jeroen van Erp** — Technology Advocate at SUSE, Cloud Native speaker, open source contributor.
Location: Netherlands. Speaks: Dutch & English.
GitHub: hierynomus · LinkedIn: jvanerp · Email: speaking@hierynomus.com
Mini-farm owner (sheep).

## TODO

Items to implement or investigate. Check them off as they are done.

### SEO / discoverability
- [ ] Favicon set — `apple-touch-icon`, `favicon.ico`, 16/32/192px PNGs from the SVG. Currently only `favicon.svg`.
- [ ] Twitter / X card meta — `twitter:site`, `twitter:creator` tags in Layout.astro.

### Performance
- [ ] Image optimisation — Susecon keynote image is ~4.5 MB JPEG; convert to WebP/AVIF or resize at source. Consider Astro `<Image>` component for automatic optimisation.
- [ ] View Transitions — add Astro's `<ViewTransitions />` for smooth page-to-page navigation (drops in with one import).

### Content
- [ ] Cloud Native London abstract — the meetup page is JS-rendered; fetch/extract the real abstract and update `cloud-native-london-2026.md`.
- [ ] Press kit / media page — headshot downloads, bio blurbs, logo files, past coverage links.
- [ ] Testimonials — quotes from event organisers; add a section to the home page and/or about page.

### Features
- [ ] Calendar / booking link — Calendly or equivalent embedded or linked from the "Get in Touch" CTA.
- [ ] Newsletter / mailing list — small sign-up form or Buttondown/ConvertKit embed; optional but drives repeat visits.
- [ ] Social sharing buttons — on blog posts and talk detail pages.
- [ ] Speaking topics page — dedicated `/topics` page already exists; consider richer content (full descriptions, audience takeaways, sample slides).

### Quality
- [ ] Accessibility pass — verify keyboard navigation, ARIA labels on icon-only buttons, colour contrast ratios (Persimmon on white, Mint on Pine).
- [x] Lighthouse audit — **100 / 95 / 100 / 100** (Perf / A11y / Best Practices / SEO). See findings below.
- [ ] Imprint / legal page — required for some European events and sponsor decks.

### Lighthouse findings (run 2026-05-20, against production build)

| Category       | Score |
|----------------|-------|
| Performance    | 100   |
| Accessibility  | 95    |
| Best Practices | 100   |
| SEO            | 100   |

**Accessibility (score: 95) — colour contrast failures:**
Lighthouse flagged many elements with insufficient contrast ratio. All in light mode (dark mode was not tested):
- Hero CTA buttons — semi-transparent text (`text-white/60`, `text-white/70`) on gradient background
- TalkCard date/type pill (`text-pine/45`, `text-pine/50`) on white card background
- Writing section publication name and date (`text-xs text-pine/50`) on light card background
- Contact section LinkedIn button — `border-mint/30 text-fog` on pine gradient
- Footer copyright and links (`text-sm text-pine/...`) on white background

Fix: bump opacity on the worst offenders — `/45` → `/60`, `/50` → `/65`, `/30` → `/50` in the relevant components.

**Performance — render-blocking resource (est. 720 ms savings):**
Google Fonts stylesheet is render-blocking. Fix: swap to `font-display: optional` or self-host Inter (already available via `@fontsource/inter`; `og.ts` already loads it from there).

**LCP (image not preloaded):**
The hero headshot `jeroen-van-erp.jpg` is the LCP element but is not preloaded. Add `<link rel="preload" as="image" href="/jeroen-van-erp.jpg" />` in `Layout.astro` when on the home page (or unconditionally — it's small).

**Image delivery:**
Hero headshot is a JPEG; convert to WebP/AVIF for ~20–40% savings. (Same applies to the Susecon keynote image at ~4.5 MB.)
