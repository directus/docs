# Contributing to Directus Docs

This guide covers local development, docs authoring, search indexing, deployment, and the optional AI Assistant.

## Running the Docs

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

Update `.env` with the service keys you need for the feature you are working on. Most docs-only changes do not require every optional secret.

### Run Development Server

Start the development server on `http://localhost:3000`:

```bash
pnpm dev
```

### Building Locally

```bash
pnpm build
```

## Authoring Content

Pages live as Markdown files under `content/`. Frontmatter fields are validated by the schema in `content.config.ts`.

### Framework Guides

Framework guides live under `content/frameworks/<framework>/`. The numeric prefix on filenames (`01.`, `02.`, ...) controls sidebar sort order only. It has no semantic meaning; renumber freely.

The `section` frontmatter field controls grouping on the `/frameworks/<framework>` hub page:

- `section: start-here` appears in the "Start Here" block at the top.
- `section: guides` or unset appears in the "Guides" block below.

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

## Repository Tooling

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

Stable IDs give each public docs page a permanent identity. Nuxt Content derives its unique page IDs from file paths, so moving a page changes its built-in ID. Redirect sync compares the current branch to `origin/main`, so moved pages keep their old URLs working.

CI runs `pnpm stable-ids:check` and `pnpm redirects:check` for docs changes.

- New docs page: run `pnpm stable-ids:ensure`, then commit the new `stableId`.
- Moved docs page: keep the existing `stableId`, run `pnpm redirects:sync`, then commit `redirects.json`.
- Deleted, split, or merged docs page: run `pnpm redirects:sync`, review `.docs/redirect-decisions-needed.md`, choose target redirects, then re-run `pnpm redirects:check`.
- Before opening a PR: run `pnpm stable-ids:check` and `pnpm redirects:check`.

Redirect scripts compare against `origin/main` by default. To check a release branch or another target, fetch it first, then pass `--base` directly to the script:

```bash
git fetch origin release/v13
node scripts/redirects-sync.ts --base origin/release/v13 --no-write --fail-on-unresolved
node scripts/redirects-sync.ts --base origin/release/v13 --write-deterministic --fail-on-unresolved
```

## AI Assistant

The in-site AI Assistant is optional. It is disabled unless `OPENROUTER_API_KEY` is present and `ASSISTANT_ENABLED` is not set to `false`.

### Required for Vercel

```bash
OPENROUTER_API_KEY=sk-or-v1-...
ASSISTANT_FP_SECRET=long-random-string
```

`ASSISTANT_FP_SECRET` salts daily fingerprint identifiers. Use a long random value and keep it secret.

### Recommended for Vercel

Use one supported Redis env pair for cross-instance burst and daily limits:

```bash
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
```

or:

```bash
KV_REST_API_URL=https://your-db.upstash.io
KV_REST_API_TOKEN=your_upstash_token
```

Without Redis env vars, limits fall back to per-process memory. That is fine for local development, but not enough for production or preview deployments.

### Optional

```bash
AI_MODEL=google/gemini-3.1-flash-lite
ASSISTANT_ENABLED=true
ASSISTANT_FEEDBACK_SURVEY_ID=019e081e-2c3b-0000-04c3-564ad5dff4ed
GITHUB_TOKEN=github_pat_...
POSTHOG_AI_HOST=https://us.i.posthog.com
```

- `ASSISTANT_ENABLED=false` is the kill switch. Set it before build/deploy to hide the assistant and skip the server route; the server also rejects requests when the flag is false.
- `GITHUB_TOKEN` is required for the assistant's source-code search tool and raises GitHub raw-file rate limits.
- `ASSISTANT_FEEDBACK_SURVEY_ID` enables thumbs up/down feedback on assistant responses.
- `POSTHOG_AI_HOST` only needs to be set when AI telemetry should use a different PostHog host than `POSTHOG_API_HOST`.

### Local Testing

Useful assistant tests:

```bash
pnpm exec vitest run modules/assistant/index.test.ts modules/assistant/runtime/composables/useAssistant.test.ts modules/assistant/runtime/server/utils/admit.test.ts modules/assistant/runtime/server/utils/abuse-gate.test.ts modules/assistant/runtime/server/utils/bind-tools.test.ts modules/assistant/runtime/server/utils/rate-limit.test.ts modules/assistant/runtime/server/utils/request-context.test.ts server/utils/rate-limit.test.ts server/utils/docs-api-limit.test.ts
```

Dev-only helpers:

```bash
ASSISTANT_RESET_TOKEN=change-me
RATE_LIMIT_WINDOW_MS=60000
POSTHOG_AI_DEBUG=true
POSTHOG_AI_SELF_TEST=true
```

The reset/status endpoints are only registered in dev and only respond from a local development context.

## Search

Search is powered by [Typesense](https://typesense.org). The browser palette (`UCommandPalette`-based) lives at `app/components/DocsSearchPalette.vue` and queries Typesense directly via `app/services/typesenseService.ts`. The official `typesense` npm client is used by the indexer only.

### Indexing

The indexer at `scripts/index-docs.ts` walks `/content`, chunks each Markdown page, attaches synonyms, and pushes everything to Typesense. OpenAPI indexing is deferred to a later branch. Run it locally with:

```bash
pnpm index:docs
```

CI runs the same command on every push to `main` (production index) and on every PR commit (per-branch preview index). See `.github/workflows/search-index.yml`.

### Collection Naming

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

### Search-Friendly Content

Write H2s and first paragraphs so they work as standalone search results.

## Deploying the Docs

The documentation automatically deploys to Vercel when changes are merged into the main branch.

1. Open a pull request.
2. Review the deploy preview.
3. Once the PR is approved and merged to `main`, Vercel builds and deploys the updated documentation.
