# Directus Docs Reorganization Plan v4

Astro-style structure. Concepts inline in guides. Strong Reference section. Frontmatter tags for cross-cutting (frameworks, use cases). Single content collection.

---

## Current Problems

1. **Branded nav** - "Automate", "Insights", "Connect" don't match product UI
2. **Reference hiding in guides** - Filter rules, query params, error codes, extension APIs, panel catalogs all filed under "guides"
3. **No explanation content** - Guides jump to "how" without "why". ~9 explanation pages total, most are thin
4. **Everything is a "tutorial"** - 95 tutorials, zero are true Diataxis tutorials. All are recipes/walkthroughs
5. **No cross-cutting views** - Can't browse by framework or use case
6. **Inconsistent frontmatter** - `technologies` exists but sparse and unstandardized
7. **Major content gaps** - No production patterns, no troubleshooting, no DevOps, no architecture guides

---

## Proposed Structure

```
Getting Started
Guides & Recipes
Reference
Integrations
Hosting
Community & Releases
```

### Full Sidebar Navigation

```
GETTING STARTED
  Overview
  Create a Project
  Build Your Data Model
  Make Your First API Call
  Authenticate a User
  Upload Files
  Create a Flow
  Subscribe to Realtime
  Next Steps
  Migrate to Directus
    From WordPress
    From Notion
    From Nuxt Content

GUIDES & RECIPES
  Data Model
    Collections
    Fields
    Interfaces
    Relationships
    Translations
  Content
    Content Explorer
    Editor
    Layouts
    Import & Export
    Live Preview
    Content Versioning
    Visual Editor
    Collaborative Editing
  Auth & Access Control
    Tokens & Sessions
    Roles & Permissions
    Creating Users
    Email Login
    Two-Factor Auth
    Single Sign-On
    Accountability
  API & SDK
    REST API Overview
    SDK Setup & Usage
    Working with Relations
  Files & Assets
    Upload Files
    Download Files
    Manage Files
    File Access & Permissions
    Image Transformations
  Flows
    Overview
    Triggers
    Operations
    Data Chain
  Realtime
    Authentication
    Subscriptions
    Actions
    Custom Handlers
  Dashboards
    Overview
    Panels
  Extensions
    Overview
    Quickstart
    API Extensions
    App Extensions
    Bundles
    Marketplace
    CLI
  AI
    Assistant
    MCP Server
  Recipes
    (short, focused how-tos - see backlog below)

REFERENCE
  API Reference (OpenAPI)
  SDK Reference
  Filter Operators
  Query Parameters
  Global Query Parameters
  Error Codes
  Configuration
    General
    Database
    Cache
    Email
    Files & Storage
    Logging & Metrics
    Auth & SSO
    Realtime
    Security & Limits
    AI
    Flows
    Translations
    Synchronization
    PM2
  Extensions API
    Hooks API
    Endpoints API
    Operations API
    Services API
    Sandbox API
    Interfaces API
    Displays API
    Layouts API
    Panels API
    Modules API
    Themes API
    UI Components
    Composables
  CLI Reference
  Breaking Changes
    v10
    v11

INTEGRATIONS
  Frameworks
    Next.js
    Nuxt
    SvelteKit
    Astro
    React
    Vue
    Angular
    SolidStart
    Eleventy
    Django
    Flask
    Laravel
    Spring Boot
    Swift (iOS)
    Kotlin (Android)
    Flutter
  Deployment Platforms
    Vercel
    Netlify
    AWS
    Google Cloud
    DigitalOcean
    Docker
  Third-Party Services
    n8n
    Zapier
    Clay
    Stripe
    Algolia
    Elasticsearch
    Twilio
    Crowdin

HOSTING
  Cloud
    Getting Started
    Projects
    Configuration
    Billing
    Migration
  Self-Hosting
    Overview
    Requirements
    Deploying
    Upgrading
    Including Extensions

COMMUNITY & RELEASES
  Community
    Welcome
    Contributing
    Codebase
    Support
    Programs
  Changelog
```

---

## What Moves Where

### Reference material extracted FROM guides

| Current Location | Moves To | Why |
|---|---|---|
| `guides/connect/filter-rules.md` | `reference/filter-operators.md` | Pure operator reference table |
| `guides/connect/query-parameters.md` | `reference/query-parameters.md` | Pure parameter reference |
| `guides/connect/errors.md` | `reference/error-codes.md` | Pure error code table |
| `guides/automate/triggers.md` | `reference/` (linked from guides/flows) | Trigger type catalog |
| `guides/automate/operations.md` | `reference/` (linked from guides/flows) | Operation type catalog |
| `guides/insights/panels.md` | `reference/` (linked from guides/dashboards) | Panel type catalog |
| `guides/data-model/interfaces.md` | `reference/` (linked from guides/data-model) | Interface catalog |
| `guides/extensions/api-extensions/*` | `reference/extensions-api/` | Extension API reference |
| `guides/extensions/app-extensions/*` | `reference/extensions-api/` | Extension API reference |
| `guides/extensions/cli.md` | `reference/cli.md` | CLI command reference |
| `configuration/*` | `reference/configuration/` | All config is reference material |
| `guides/connect/sdk.md` | `reference/sdk.md` | SDK reference |
| `guides/connect/authentication.md` | `reference/` or merge into guides/auth | Just a partial include |

### Content relocated between sections

| Current Location | Moves To | Why |
|---|---|---|
| `guides/connect/relations.md` | `guides/api/working-with-relations.md` | Rename section |
| `guides/11.integrations/*` | `integrations/third-party/` | Proper section |
| `tutorials/getting-started/*` | `integrations/frameworks/` | Framework quickstarts |
| `tutorials/tips-and-tricks/*` | `guides/recipes/` or dissolve | Short how-tos |
| `tutorials/workflows/*` | `guides/recipes/` or `integrations/` | Per-article evaluation |
| `tutorials/migration/*` | `getting-started/migrate/` | Onboarding context |
| `tutorials/self-hosting/*` | `integrations/deployment/` | Deployment guides |
| `tutorials/projects/*` | Keep, better tagged | Add frontmatter |
| `tutorials/extensions/*` | Keep or merge into guides/extensions | Evaluate per-article |
| `cloud/*` | `hosting/cloud/` | Grouped |
| `self-hosting/*` | `hosting/self-hosting/` | Grouped |

---

## Naming Changes

| Current | New | Reason |
|---|---|---|
| Connect | **API & SDK** | What devs search for |
| Automate | **Flows** | Matches product UI |
| Insights | **Dashboards** | What users build |
| "Create an Automation" | **"Create a Flow"** | Consistency |
| "Directus Automate" in prose | **"Flows"** | Kill marketing names |

---

## Inline Explanation Approach

No standalone `/concepts/` section. Each guide section opens with a conceptual intro that covers the "why" before the "how". Pattern:

```markdown
# Roles & Permissions

Directus uses a layered access control model. Every user is assigned a role.
Roles contain one or more policies. Each policy defines permissions on
specific collections and actions (create, read, update, delete). Permissions
can include dynamic filters that restrict access to specific items - for
example, users only see items they created.

[diagram: user -> role -> policy -> permission -> filter]

This model supports everything from simple role-based access (admin/editor/viewer)
to complex multi-tenant isolation where each organization only sees their own data.

## Create a Role

1. Navigate to **Settings > Roles & Permissions**.
2. Click **Create Role**.
...
```

### Guides that need conceptual intros written (currently missing)

- Data Model: How Directus maps to your database (introspection, system tables)
- Relationships: When to use M2O vs O2M vs M2M vs M2A (decision guide)
- Auth: Token lifecycle (session vs static vs standard, refresh patterns)
- Roles & Permissions: Evaluation chain (user -> role -> policy -> permission -> filter)
- Flows: How the data chain pipeline works, trigger/operation mental model
- Realtime: WebSocket connection lifecycle, subscription model
- Extensions: How extensions load, app vs API lifecycle, sandbox model
- Files: Storage adapter architecture, transformation pipeline
- Dashboards: Panel data query model

---

## Frontmatter Taxonomy

Three fields added to the shared schema:

```yaml
---
title: "Build a Blog with Next.js and Directus"
description: "..."
technologies: ["nextjs", "typescript", "directus-sdk"]
difficulty: beginner | intermediate | advanced
tags: ["cms", "blog", "authentication", "ssr"]
---
```

### Canonical `technologies` values

**Frontend frameworks:** `nextjs`, `nuxt`, `sveltekit`, `astro`, `react`, `vue`, `angular`, `solidstart`, `eleventy`
**Backend frameworks:** `django`, `flask`, `laravel`, `spring-boot`
**Mobile:** `swift`, `kotlin`, `flutter`
**Directus features:** `directus-sdk`, `directus-flows`, `directus-realtime`, `directus-auth`, `directus-extensions`, `directus-mcp`
**Infrastructure:** `docker`, `vercel`, `netlify`, `aws`, `gcp`, `digitalocean`
**Third-party:** `stripe`, `twilio`, `algolia`, `elasticsearch`, `openai`, `redis`, `nginx`, `caddy`

---

## Collections (Minimal)

```ts
// content.config.ts
import { defineContentConfig, defineCollection, z } from '@nuxt/content';

export default defineContentConfig({
  collections: {
    landing: defineCollection({
      type: 'page',
      source: 'index.md',
    }),
    content: defineCollection({
      type: 'page',
      source: {
        include: '**',
        exclude: ['index.md', '_partials/**'],
      },
      schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        headline: z.string().optional(),
        authors: z.array(z.object({
          name: z.string(),
          title: z.string(),
        })).optional(),
        icon: z.string().optional(),
        technologies: z.array(z.string()).optional(),
        difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
        tags: z.array(z.string()).optional(),
        links: z.array(z.object({
          label: z.string(),
          icon: z.string(),
          to: z.string(),
          target: z.string().optional(),
        })).optional(),
        rawbody: z.string(),
      }),
    }),
    partials: defineCollection({
      type: 'page',
      source: '_partials/**',
      schema: z.object({
        title: z.string().optional(),
        rawbody: z.string(),
      }),
    }),
  },
});
```

Integration hub pages (e.g., `/integrations/frameworks/nextjs`) use the same `content` collection, queried dynamically:

```ts
// All content tagged with this framework
queryCollection('content')
  .where('technologies', 'LIKE', `%${slug}%`)
  .select('title', 'description', 'path', 'difficulty', 'tags')
  .all()
```

---

## Implementation Phases

### Phase 1: Labels, Frontmatter, Quick Wins
- [ ] Rename nav labels in `app.config.ts` (Connect -> API & SDK, Automate -> Flows, Insights -> Dashboards)
- [ ] Rename getting-started "Create an Automation" -> "Create a Flow"
- [ ] Add `technologies`, `tags`, `difficulty` to content.config.ts schema
- [ ] Backfill frontmatter on all ~95 tutorials (standardize technologies values)
- [ ] Find/replace branded names in prose ("Directus Automate" -> "Flows", etc.)

### Phase 2: Extract Reference Section
- [ ] Create `content/reference/` directory
- [ ] Move filter-rules, query-parameters, errors -> reference/
- [ ] Move extension API docs (api-extensions/*, app-extensions/*) -> reference/extensions-api/
- [ ] Move interfaces catalog -> reference/
- [ ] Move triggers catalog, operations catalog, panels catalog -> reference/
- [ ] Move configuration/ -> reference/configuration/
- [ ] Move SDK docs -> reference/sdk/
- [ ] Move CLI reference -> reference/
- [ ] Add links from guides back to moved reference pages
- [ ] Set up redirects

### Phase 3: Restructure Guides
- [ ] Rename `guides/04.connect/` -> `guides/04.api/`
- [ ] Rename `guides/06.automate/` -> `guides/06.flows/`
- [ ] Rename `guides/08.insights/` -> `guides/08.dashboards/`
- [ ] Dissolve tips-and-tricks -> recipes
- [ ] Move migration tutorials -> getting-started/migrate/
- [ ] Set up redirects
- [ ] Update all internal cross-references

### Phase 4: Build Integrations Section
- [ ] Create `content/integrations/` directory structure
- [ ] Create framework hub pages (one .md per framework)
- [ ] Build `app/pages/integrations/frameworks/[slug].vue` with dynamic queries
- [ ] Move deployment tutorials -> `integrations/deployment/`
- [ ] Move `guides/integrations/` -> `integrations/third-party/`
- [ ] Move workflow tutorials to recipes or integrations as appropriate
- [ ] Set up redirects

### Phase 5: Group Hosting
- [ ] Create `content/hosting/` with cloud/ and self-hosting/ subdirs
- [ ] Move existing cloud/ and self-hosting/ content
- [ ] Set up redirects

### Phase 6: Write Missing Content (ongoing)
- [ ] Add conceptual intros to all guide sections (see list above)
- [ ] Write recipes from backlog (prioritized below)
- [ ] Write troubleshooting guides
- [ ] Write architecture/journey guides
- [ ] Ensure Algolia search re-crawl works
- [ ] Verify all redirects

---

## Content Backlog

### P0: Conceptual Intros (write into existing guides)

These are the "aha moment" explanations currently missing. Each is 2-4 paragraphs + a diagram added to the top of an existing guide page.

- [ ] How Directus maps to your database (introspection, system vs user tables)
- [ ] Permissions evaluation chain (user -> role -> policy -> permission -> filter)
- [ ] When to use which relationship type (M2O vs O2M vs M2M vs M2A decision tree)
- [ ] Token lifecycle (session vs static vs standard, when to use each, refresh flow)
- [ ] Flows data chain pipeline (how data passes between operations)
- [ ] WebSocket connection lifecycle and subscription model
- [ ] Extension loading and execution (app vs API, sandbox, lifecycle hooks)
- [ ] Storage adapter architecture and transformation pipeline
- [ ] API request lifecycle (how a request flows through Directus)

### P1: Recipes (short, focused how-tos)

#### Data Modeling
- [ ] Model a blog with authors, categories, tags, and SEO metadata
- [ ] Model an e-commerce catalog (products, variants, pricing)
- [ ] Model a tree/hierarchy (nested categories, org charts)
- [ ] Model polymorphic content (pages with different block types via M2A)
- [ ] Model a user profile system extending directus_users
- [ ] Set up soft deletes with status and archived patterns
- [ ] Handle schema migrations across environments with `directus schema`
- [ ] Seed a project with initial data programmatically
- [ ] Model multi-tenant data with org-scoped collections
- [ ] Model an event/booking system with recurring events

#### API & SDK
- [ ] Paginate with cursor-based vs offset pagination
- [ ] Deep filter by nested relationship fields
- [ ] Aggregate, group, and summarize data via the API
- [ ] Batch create, update, and delete items
- [ ] Upload files with metadata from the browser
- [ ] Fetch singleton collections (settings, homepage config)
- [ ] Use `fields` parameter for efficient minimal payloads
- [ ] Handle SDK errors and retry failed requests
- [ ] Use GraphQL subscriptions for realtime
- [ ] Generate TypeScript types from your Directus schema

#### Auth
- [ ] Add Google OAuth login end-to-end
- [ ] Add GitHub OAuth login end-to-end
- [ ] Implement magic link / passwordless login
- [ ] Manage JWTs in a SPA (storage, refresh, silent renewal)
- [ ] Manage sessions in SSR frameworks (cookies, middleware)
- [ ] Build multi-tenant permissions (users see only their org's data)
- [ ] Configure public read access for a headless CMS frontend
- [ ] Restrict field-level access per role
- [ ] Implement row-level security with dynamic filters ($CURRENT_USER)

#### Flows
- [ ] Send a Slack notification on item creation
- [ ] Send a transactional email on status change
- [ ] Auto-generate a slug from a title field
- [ ] Resize and optimize images on upload
- [ ] Build a content approval workflow (draft -> review -> published)
- [ ] Schedule content publishing at a future date
- [ ] Validate complex business rules before save
- [ ] Chain operations with error handling and rollback
- [ ] Sync data to an external system via webhook

#### Files
- [ ] Configure S3-compatible storage (AWS S3, Cloudflare R2, MinIO)
- [ ] Configure Google Cloud Storage
- [ ] Put a CDN in front of the assets endpoint
- [ ] Set up image transformation presets for responsive images
- [ ] Bulk import files from URLs
- [ ] Serve private files with expiring signed URLs

#### Extensions
- [ ] Debug extensions locally with hot reload
- [ ] Test extensions with unit and integration tests
- [ ] Build a custom interface for a specific field type
- [ ] Build a custom theme for the Data Studio
- [ ] Add a custom validation rule via hooks

### P2: DevOps & Production Guides

- [ ] Deploy with Docker Compose and Traefik
- [ ] Deploy on Railway
- [ ] Deploy on Fly.io
- [ ] Deploy on AWS ECS/Fargate
- [ ] Deploy on Google Cloud Run
- [ ] Set up a CI/CD pipeline for schema migrations
- [ ] Automate schema snapshot diffing in pull requests
- [ ] Back up Postgres/MySQL and files on a schedule
- [ ] Restore from backup (database + files + schema)
- [ ] Set up health check monitoring and alerting
- [ ] Configure structured logging for production
- [ ] Tune performance (Redis caching, connection pooling, indexing)
- [ ] Set up Nginx or Caddy as a reverse proxy with SSL
- [ ] Run behind Cloudflare with proper cache rules
- [ ] Scale horizontally (multiple instances + shared cache/storage)
- [ ] Manage environment variables across dev/staging/prod
- [ ] Harden a production instance (CSP headers, CORS, disable public registration)
- [ ] Upgrade across major versions without downtime
- [ ] Profile and fix slow queries

### P3: Architecture / Journey Guides

These are longer-form guides that walk through building a real system end-to-end.

- [ ] Production headless CMS with Next.js (ISR, preview, drafts, cache invalidation)
- [ ] Production headless CMS with Nuxt (SSR, preview, on-demand revalidation)
- [ ] Production headless CMS with Astro (static + hybrid rendering)
- [ ] Multi-tenant SaaS backend (signup, org isolation, billing hooks)
- [ ] E-commerce storefront backend (products, cart, orders, Stripe)
- [ ] Mobile app backend (auth, offline sync, push notifications)
- [ ] Internal admin panel for a support team
- [ ] Customer portal with self-service data access
- [ ] Multi-site management from a single Directus instance
- [ ] IoT data ingestion pipeline

### P4: Troubleshooting

- [ ] Debug "You don't have permission to access this"
- [ ] Debug CORS errors from a frontend
- [ ] Debug INVALID_PAYLOAD errors
- [ ] Debug broken relationships after schema changes
- [ ] Debug flows that silently fail
- [ ] Debug slow API responses (N+1 queries, missing indexes)
- [ ] Debug file upload failures
- [ ] Debug authentication failures (expired tokens, SSO misconfig)
- [ ] Fix "schema out of sync" after manual DB changes
- [ ] Recover from a failed upgrade
- [ ] Debug WebSocket/realtime connection issues
- [ ] Debug extension loading failures
- [ ] Common Docker deployment issues (permissions, networking, env vars)

---

## Resolved Decisions

| Question | Decision | Rationale |
|---|---|---|
| Rename dirs or just labels? | **Rename dirs** | URLs should match what users see |
| /configuration/ location? | **Move to /reference/configuration/** | Config is reference material |
| Dashboards vs Insights? | **Dashboards** | Match the product UI |
| Collection count? | **3 (landing, content, partials)** | One collection + frontmatter + path queries |
| Routing? | **Catch-all + specific pages for dynamic views** | `/integrations/frameworks/[slug]` gets its own page component |
| Redirects? | **Nuxt routeRules** | Portable, colocated |
| SDK docs? | **Under Reference** | Next to API reference |
| Concepts section? | **No. Inline in guides.** | Each guide opens with "why" before "how" |
| Framework/use-case views? | **Dynamic queries from frontmatter tags** | No manually maintained link lists |
| Tutorials section? | **Dissolve.** Recipes -> guides. Projects -> keep. Framework quickstarts -> integrations. | Current "tutorials" are misnamed. Call things what they are. |
