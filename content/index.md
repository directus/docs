---
title: Directus Documentation
description: Learn how to get started and implement Directus through our developer resources.
navigation: false
---

## Try a Demo

::two-up

#left
:::tabs
  ::::div{class="pr-6"}
  ---
  label: Local Demo
  ---

  Run Docker locally and use the following command to start the project.

  ```
  docker run -p 8055:8055 directus/directus
  ```

  This project has no persistence. All data will be lost when the container is stopped. Read our [Create a Project guide](/getting-started/quickstart) to learn how to create a project with persistence.
  ::::

  ::::div{class="pr-6"}
  ---
  label: Hosted Demo
  ---
  Try our [hosted demo project](https://directus.pizza/?utm_source=directus-docs&utm_campaign=docs-home). This is a public demo project that is occasionally reset but please don't input sensitive data.
  ::::
:::

#right
:video-embed{video-id="96b44cbc-1b14-4bea-87cd-0c4cb34d261d"}

::

## Getting Started

::shiny-grid
  :::shiny-card
  ---
  title: Platform Overview
  description: TK Developer tooling that's super cool
  icon: simple-icons:directus
  to: /getting-started
  class: col-span-6
  ---
  :::
  
  :::shiny-card
  ---
  title: Directus Academy
  description: TK Developer tooling that's super cool
  icon: heroicons-outline:play
  to: https://directus.io/tv/directus-academy
  class: col-span-6
  ---
  :::
::

## Features

::shiny-grid
  :::shiny-card
  ---
  title: Data Engine
  description: APIs and developer tools for your data.
  icon: directus-connect
  class: col-span-6
  ---
  :product-link{product="connect"} :product-link{product="realtime"} :product-link{product="auth"} :product-link{product="automate"}
  :::
  
  :::shiny-card
  ---
  title: Data Studio
  description: A data web app your whole team will love.
  icon: directus-explore
  class: col-span-6
  ---
  :product-link{product="explore"} :product-link{product="editor"} :product-link{product="insights"} :product-link{product="files"}
  :::
::

## Directus APIs

::shiny-grid
  :::shiny-card
  ---
  title: Quickstart
  description: TK Developer tooling that's super cool
  icon: heroicons-outline:star
  to: '/getting-started/connect'
  class: col-span-4
  ---
  :::
  
  :::shiny-card
  ---
  title: API Reference
  description: TK Developer tooling that's super cool
  icon: heroicons-outline:play
  to: '/api'
  class: col-span-4
  ---
  :::
  
  :::shiny-card
  ---
  title: SDK
  description: TK Developer tooling that's super cool
  icon: heroicons-outline:code
  to: '/getting-started/connect/sdk'
  class: col-span-4
  ---
  :::
::

## Tutorials

::shiny-grid
  :::shiny-card
  ---
  title: Directus with Next.js
  description: TK Developer tooling that's super cool
  icon: simple-icons:nextdotjs
  to: '/tutorials?tags=nextjs'
  class: col-span-4
  ---
  :::

  :::shiny-card
  ---
  title: Build Projects with Directus
  description: TK Developer tooling that's super cool
  icon: heroicons-outline:command-line
  to: '/tutorials?tags=nextjs'
  class: col-span-4
  ---
  :::

  :::shiny-card
  ---
  title: Using Directus Auth
  description: TK Developer tooling that's super cool
  icon: heroicons-outline:lock-closed
  to: '/tutorials?tags=directus-auth'
  class: col-span-4
  ---
  :::

  :::shiny-card
  ---
  title: Automate & Integrate
  description: TK Developer tooling that's super cool
  icon: heroicons-outline:adjustments
  to: '/tutorials?tags=directus-automate'
  class: col-span-4
  ---
  :::

  :::shiny-card
  ---
  title: Self-Hosting Guide
  description: TK Developer tooling that's super cool
  icon: heroicons-outline:cloud
  to: '/tutorials/self-hosting'
  class: col-span-4
  ---
  :::

  :::shiny-card
  ---
  title: SEO Best Practices
  description: TK Developer tooling that's super cool
  icon: heroicons-outline:search
  to: '/tutorials/tips-and-tricks/search-engine-optimization-best-practices'
  class: col-span-4
  ---
  :::

  :::callout{icon="heroicons-outline:light-bulb" to="/tutorials" class="col-span-6"}
  See All Tutorials
  :::
::

## Releases

::shiny-grid
  :::shiny-card
  ---
  title: GitHub Releases
  description: TK Developer tooling that's super cool
  icon: simple-icons:github
  to: 'https://github.com/directus/directus/releases'
  class: col-span-4
  ---
  :::

  :::shiny-card
  ---
  title: Breaking Changes
  description: TK Developer tooling that's super cool
  icon: heroicons-outline:exclamation-circle
  to: '/releases/breaking-changes'
  class: col-span-4
  ---
  :::

  :::shiny-card
  ---
  title: Changelog
  description: TK Developer tooling that's super cool
  icon: heroicons-outline:document-text
  to: '/releases/changelog'
  class: col-span-4
  ---
  :::
::

## Community-Maintained Tooling

::shiny-grid
  :::shiny-card
  ---
  title: Python SDK
  description: TK Developer tooling that's super cool
  icon: simple-icons:python
  to: 'https://pypi.org/project/directus-sdk-py/'
  class: col-span-4
  ---
  :::

  :::shiny-card
  ---
  title: Go SDK
  description: TK Developer tooling that's super cool
  icon: simple-icons:go
  to: 'https://pkg.go.dev/github.com/altipla-consulting/directus-go#section-readme'
  class: col-span-4
  ---
  :::

  :::shiny-card
  ---
  title: Dart SDK
  description: TK Developer tooling that's super cool
  icon: simple-icons:dart
  to: 'https://github.com/apstanisic/directus-dart'
  class: col-span-4
  ---
  :::

  :::shiny-card
  ---
  title: Nuxt Module
  description: TK Developer tooling that's super cool
  icon: simple-icons:nuxtdotjs
  to: 'https://nuxt.com/modules/directus'
  class: col-span-4
  ---
  :::
  
  :::shiny-card
  ---
  title: Helm Chart
  description: TK Developer tooling that's super cool
  icon: simple-icons:helm
  to: 'https://github.com/directus-labs/helm-chart'
  class: col-span-4
  ---
  :::

  :::callout{icon="material-symbols:lightbulb-2-outline" class="col-span-6"}
  These are built and maintained by our awesome community. If you are building tooling and want to include it here, please open a [pull request on GitHub](https://github.com/directus/docs).
  :::
::

## Advanced Concepts

::shiny-grid
  :::shiny-card
  ---
  title: Environment Variables
  description: TK Developer tooling that's super cool
  icon: heroicons-outline:cog
  to: '/configuration/general'
  class: col-span-4
  ---
  :::
  
  :::shiny-card
  ---
  title: Building Extensions
  description: TK Developer tooling that's super cool
  icon: heroicons-outline:puzzle
  to: '/guides/extensions/overview'
  class: col-span-4
  ---
  :::
  
  :::shiny-card
  ---
  title: Self-Hosting
  description: TK Developer tooling that's super cool
  icon: heroicons-outline:cloud
  to: '/self-hosting/overview'
  class: col-span-4
  ---
  :::
::
