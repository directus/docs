<p align="center"><img alt="Directus Logo" src="https://user-images.githubusercontent.com/522079/158864859-0fbeae62-9d7a-4619-b35e-f8fa5f68e0c8.png"></p>

---

## 🐰 Introduction

Welcome! This is the repo for [Directus' documentation](https://directus.com/docs).

**[Learn more about Directus](https://directus.com)**


## 🖥️ Running the Docs

### Requirements

- Node.js 22.18 or later
- pnpm

### Install Dependencies

```bash
pnpm install
```

### Setup Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Update the environment variables in the `.env` file with proper secret keys for the different
services.

### Run Development Server

Start the development server on `http://localhost:3000`:

```bash
pnpm dev
```

### Building Locally

```bash
pnpm build
```

### Repository Tooling

The repository includes scripts that keep docs routes stable when files move and that index the docs into Typesense.

```bash
pnpm stable-ids:ensure  # Add missing stableId frontmatter
pnpm stable-ids:check   # Validate stableId frontmatter
pnpm redirects:sync     # Update redirects.json for moved pages
pnpm redirects:check    # Check redirect coverage without writing files
pnpm index:docs         # Build the search index in Typesense
pnpm typesense:cleanup-preview # Delete stale Typesense preview indexes
pnpm typecheck:scripts  # Type check repository scripts
```

Stable IDs give each public docs page a permanent identity. Nuxt Content derives
its unique page IDs from file paths, so moving a page changes its built-in ID.
Redirect sync compares the current branch to `origin/main`, so moved pages keep
their old URLs working.

CI runs `pnpm stable-ids:check` and `pnpm redirects:check` for docs changes.

- New docs page: run `pnpm stable-ids:ensure`, then commit the new `stableId`.
- Moved docs page: keep the existing `stableId`, run `pnpm redirects:sync`, then commit `redirects.json`.
- Deleted, split, or merged docs page: run `pnpm redirects:sync`, review `.docs/redirect-decisions-needed.md`, choose target redirects, then re-run `pnpm redirects:check`.
- Before opening a PR: run `pnpm stable-ids:check` and `pnpm redirects:check`.

Redirect scripts compare against `origin/main` by default. To check a release branch
or another target, fetch it first, then pass `--base` directly to the script:

```bash
git fetch origin release/v13
node scripts/redirects-sync.ts --base origin/release/v13 --no-write --fail-on-unresolved
node scripts/redirects-sync.ts --base origin/release/v13 --write-deterministic --fail-on-unresolved
```

## ✍️ Authoring Content

Pages live as Markdown files under `content/`. Frontmatter fields are validated by the schema in `content.config.ts`.

### Framework Guides

Framework guides live under `content/frameworks/<framework>/`. The numeric prefix on filenames (`01.`, `02.`, …) controls sidebar sort order only — it has no semantic meaning, renumber freely.

The `section` frontmatter field controls grouping on the `/frameworks/<framework>` hub page:

- `section: start-here` — appears in the "Start Here" block at the top.
- `section: guides` (or unset) — appears in the "Guides" block below.

Minimal frontmatter for a new framework guide:

```yaml
---
title: Fetch Data from Directus with Foo
description: Learn how to integrate Directus in your Foo app.
section: start-here
technologies:
  - foo
navigation:
  title: Data Fetching
---
```

## ☁️ Deploying the Docs

The documentation automatically deploys to Vercel when changes are merged into the main branch. Simply:

1. Open a Pull Request with your changes
2. This should trigger a deploy preview as well.
3. Once PR is approved and merged to main, Vercel will automatically build and deploy the updated documentation

## 🚀 Contributing

- [Code of Conduct](https://directus.com/docs/community/overview/conduct)
- [Contributing and authoring guidelines](https://directus.com/docs/community/contribution/documentation)

<br />

## 🤔 Community Help

- [Community Platform](https://community.directus.io) (Questions, Live Discussions)
- [GitHub Issues](https://github.com/directus/docs/issues) (Report Bugs)
- [Roadmap](https://roadmap.directus.io) (Roadmap & Feature Requests)

## 🔍 Search

Search is powered by [Typesense](https://typesense.org). The browser palette (`UCommandPalette`-based) lives at `app/components/DocsSearchPalette.vue` and queries Typesense directly via `app/services/typesenseService.ts`. The official `typesense` npm client is used by the indexer only.

### Indexing

The indexer at `scripts/index-docs.ts` walks `/content`, chunks each Markdown page, attaches synonyms, and pushes everything to Typesense. OpenAPI indexing is deferred to a later branch. Run it locally with:

```bash
pnpm index:docs
```

CI runs the same command on every push to `main` (production index) and on every PR commit (per-branch preview index). See `.github/workflows/search-index.yml`.

### Collection naming

Indexes use a blue/green slot pattern with a stable alias:

- `main` -> alias `directus-docs`, slots `directus-docs-a` / `directus-docs-b`
- Branch `bry/foo` -> alias `directus-docs-preview-bry-foo`, slots `...-a` / `...-b`
- Local branch runs use the same branch-derived alias as CI

Each indexer run writes to whichever slot the alias is not currently pointing at, swaps the alias, then deletes the previous slot.

For one-off writes, override the index target with `TYPESENSE_INDEX_TARGET=...`.

The browser reads from `TYPESENSE_COLLECTION` when set. Otherwise it derives the same branch alias as the indexer. The app reads the alias, never the `-a` / `-b` slot name.

### Preview Cleanup

PR preview indexes are deleted when same-repo PRs close. The cleanup job deletes the branch alias and both fixed slots:

```bash
pnpm typesense:cleanup-preview --branch bry/foo
```

For one-time cleanup of accumulated preview indexes, run a dry run first:

```bash
pnpm typesense:cleanup-preview --stale --dry-run
pnpm typesense:cleanup-preview --stale
```

Stale cleanup keeps preview aliases for currently open PR branches and deletes the rest. It requires `TYPESENSE_URL`, `TYPESENSE_PRIVATE_API_KEY`, and authenticated `gh`.

### Ranking

Section boosts and personalization live in `buildPersonalizedSortBy` in `app/composables/useDocsSearch.ts`. The same `sectionPriority` array drives both the Typesense `_eval` boost order and the chip-bar render order in the palette.

### Synonyms

Search synonyms live in `server/data/synonyms.ts` and are pushed to Typesense on every indexer run. Two formats: `multiway` (equivalent terms) and `oneway` (directional shorthand -> canonical, e.g. `db -> database`). Header comment in the file explains both.

### Search-friendly content

Write H2s and first paragraphs so they work as standalone search results.

<br />

© 2004-2024, Monospace, Inc.
