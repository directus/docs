# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Directus documentation site built with Nuxt 3 and `@nuxt/content`. Markdown files in `/content` are rendered as pages. Deployed to Vercel on merge to main, served at `https://directus.io/docs` (note the `/docs` base URL in `nuxt.config.ts`).

## Commands

```bash
pnpm install        # Install dependencies (requires Node.js 22, pnpm 9.15.4)
pnpm dev            # Dev server at http://localhost:3000/docs
pnpm build          # Production build
pnpm generate       # Static site generation (used for Vercel deploy)
pnpm preview        # Preview production build locally
```

There is no test runner configured. Linting is via `@nuxt/eslint` (run through Nuxt's built-in integration).

## Architecture

### Content System

All documentation lives in `/content` as Markdown with YAML frontmatter. Two collections defined in `content.config.ts`:
- `landing` — just `index.md`
- `content` — everything else, with schema requiring `title` (and optional `description`, `authors`, `technologies`, `links`, `icon`)

Reusable content fragments live in `/content/_partials/` and are included via the `Partial` component.

### Routing

- `app/pages/[...slug].vue` — catch-all for content pages
- `app/pages/api/[tag].vue` — OpenAPI-generated API reference (reads `/public/oas.yaml`)
- `app/pages/tutorials/` — tutorial section with nested routes

### Custom Markdown Components

12 Vue components in `app/components/content/` are available in markdown via MDC syntax:

| Component | MDC Usage |
|---|---|
| `TwoUp` | `::two-up` |
| `ShinyGrid` | `::shiny-grid` |
| `ShinyCard` | `:::shiny-card` |
| `Example` | `:::example` |
| `Faq` | `:::faq` |
| `Chat` | `:::chat` |
| `VideoEmbed` | `:video-embed{video-id="..."}` |
| `DocCliSnippet` | `:doc-cli-snippet{command="..."}` |
| `Partial` | `:partial{content="path/to/partial"}` |
| `CtaCloud` | `:cta-cloud` |
| `ProductLink` | `:product-link` |
| `ProseImg` | Overrides default `<img>` in prose |

### Key Config Files

- `nuxt.config.ts` — modules, prerendering rules, ESLint config, base URL
- `content.config.ts` — content collection schemas (Zod)
- `app/app.config.ts` — navigation structure, UI theme (purple primary), footer links
- `.env.example` — required env vars: Algolia, Directus URL, GTM, Nuxt UI Pro license, PostHog

### Modules & Integrations

Nuxt modules: `@nuxt/ui-pro`, `@nuxt/content`, `@nuxtjs/seo`, `@nuxtjs/algolia` (conditional on env vars), `@vueuse/nuxt`, `@nuxt/scripts`. Custom PostHog module in `/modules/posthog/`.

## Code Style

- Tabs for indentation (spaces for `.md` and `.yml` — see `.editorconfig`)
- Semicolons required
- ESLint stylistic rules enforced via `@nuxt/eslint` config in `nuxt.config.ts`
- TypeScript throughout
