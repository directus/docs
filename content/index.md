---
title: Directus Documentation
description: The AI-ready backend for your whole team.
navigation: false
---

## Key features

Everything you need in one platform.

:home-features

## Get started

The fastest way to try Directus is to spin up a local instance with our template CLI. It scaffolds a Directus project plus a frontend in under a minute — no signup required.

:doc-cli-snippet{command="npx directus-template-cli@latest init"}

Once you're ready to commit, pick how you want to run Directus:

::u-page-grid{class="lg:grid-cols-3"}
  :::u-page-card
  ---
  title: Directus Cloud
  description: Spin up a managed instance in seconds. No infrastructure to run.
  icon: i-lucide-cloud
  to: https://directus.cloud
  ---
  :::

  :::u-page-card
  ---
  title: Self-Hosted
  description: Run Directus on your own infrastructure with Docker or your platform of choice.
  icon: simple-icons:docker
  to: /self-hosting/overview
  ---
  :::

  :::u-page-card
  ---
  title: Local Demo
  description: Try Directus locally in one command.
  icon: i-lucide-terminal
  to: /getting-started/overview
  ---
  :::
::

## Pick your framework

Connect your preferred frontend to Directus. Each guide covers data fetching, authentication, and live preview.

:framework-links

## Who's it for

Directus is a flexible backend, but here's how teams typically use it.

::u-page-grid{class="lg:grid-cols-2"}
  :::u-page-card
  ---
  title: Developers
  description: APIs, SDKs, extensions, and self-hosting on your own terms.
  icon: i-lucide-code
  ---
  :::

  :::u-page-card
  ---
  title: Product teams
  description: Ship features without waiting for a backend rebuild.
  icon: i-lucide-rocket
  ---
  :::

  :::u-page-card
  ---
  title: Agencies
  description: One backend, every project, every framework.
  icon: i-lucide-briefcase-business
  ---
  :::

  :::u-page-card
  ---
  title: Publishers
  description: Headless CMS for content-driven sites at any scale.
  icon: i-lucide-newspaper
  ---
  :::
::

## How it works

Three concepts power everything in Directus. Start here to build your mental model.

::u-page-grid{class="lg:grid-cols-3"}
  :::u-page-card
  ---
  title: Data model
  description: Collections and fields map directly to your database schema.
  icon: i-lucide-database
  to: /guides/data-model/collections
  ---
  :::

  :::u-page-card
  ---
  title: Permissions
  description: Define who can do what, down to the field level.
  icon: i-lucide-shield-check
  to: /guides/auth/access-control
  ---
  :::

  :::u-page-card
  ---
  title: Flows
  description: Trigger logic on events, schedules, or webhooks.
  icon: i-lucide-zap
  to: /guides/flows/operations
  ---
  :::
::
