---
stableId: 95232655-1013-41bf-9bb6-680b436dcc79
title: Agent Prompt Test
description: Test page for the AgentPrompt MDC component.
navigation: false
---

# AgentPrompt component test

## Slot body

:::agent-prompt{title="Set up Directus SDK in Nuxt" description="A multi-step prompt for scaffolding the SDK in a Nuxt 3 project."}
You are helping me set up @directus/sdk in a Nuxt 3 project.

Start by:
1. Installing the SDK with `pnpm add @directus/sdk`.
2. Creating a Nuxt plugin that exposes a typed client via `useNuxtApp().$directus`.
3. Wiring `DIRECTUS_URL` from runtime config.

Ask me for the collection schema if you need it.
:::

## Prop body

::agent-prompt{title="Quick refactor" description="Single-line prompt via prop." prompt="Refactor this Vue component to use `<script setup>` and the Composition API. Keep the public props identical."}
::

## No description, no icon override

:::agent-prompt{title="Write a Directus extension"}
Build a hook extension for Directus that fires on `items.create` for the `articles` collection and calls a webhook with the new item payload.

Reference the Directus extension docs and use the `@directus/extensions-sdk` scaffolding.
:::

## Title only, long body

:::agent-prompt{title="Migrate from Strapi"}
Help me migrate a Strapi v4 project to Directus.

Step 1 — inventory:
- List Strapi content types and components
- Note media library size
- Note custom controllers/services

Step 2 — schema mapping:
- Map each Strapi content type to a Directus collection
- Map components to relational collections (M2A or O2M)
- Map media to `directus_files`

Step 3 — data transfer:
- Export Strapi data as JSON
- Transform with a Node script
- Import via the Directus SDK using `createItems`

Ask me which Strapi version I'm on and what database I'm using before suggesting a migration script.
:::

## Custom icon

:::agent-prompt{title="Debug a slow query" icon="i-lucide-bug"}
Help me debug a slow query in Directus. The `articles` collection takes 8s to load when filtering by a relational field.

Show me how to:
1. Inspect the generated SQL
2. Identify missing indexes
3. Add the right index via a migration
:::
