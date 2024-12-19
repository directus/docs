---
title: Directus Documentation
description: Learn how to get started and implement Directus through our developer resources.
links:
  - label: Get Started
    size: 'lg'
    to: '/getting-started'
navigation: false
---

## Try a Demo

::two-up

#left
:::tabs
  ::::div
  ---
  label: Local Demo
  ---

  Run Docker locally and use the following command to start the project.

  ```
  docker run -p 8055:8055 directus/directus
  ```

  This project has no persistence. All data will be lost when the container is stopped. Read our [Create a Project guide](/getting-started/create-a-project) to learn how to create a project with persistence.
  ::::

  ::::div
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

::u-landing-grid{class="gap-4"}
  :::u-landing-card
  ---
  icon: simple-icons:directus
  title: Platform Overview
  to: /getting-started/platform-overview
  class: col-span-6
  ---
  :::
  
  :::u-landing-card
  ---
  icon: material-symbols:live-tv
  title: Directus Academy
  to: https://directus.io/tv/directus-academy
  class: col-span-6
  ---
  :::
::

## Features

::u-landing-grid{class="gap-4"}
  :::u-landing-card
  ---
  icon: directus-connect
  title: Data Engine
  description: APIs and developer tools for your data.
  class: col-span-6
  color: purple
  ---
  :product-link{product="connect"} :product-link{product="realtime"} :product-link{product="auth"} :product-link{product="automate"}
  :::
  
  :::u-landing-card
  ---
  icon: directus-explore
  title: Data Studio
  description: A data web app your whole team will love.
  class: col-span-6
  color: pink
  ---
  :product-link{product="explore"} :product-link{product="editor"} :product-link{product="insights"} :product-link{product="files"}
  :::
::

## Directus APIs

::u-landing-grid{class="gap-4"}
  :::u-landing-card
  ---
  title: Quickstart
  to: '/connect/quickstart'
  class: col-span-4
  color: pink
  ---
  :::
  
  :::u-landing-card
  ---
  title: API Reference
  to: '/api'
  class: col-span-4
  color: green
  ---
  :::
  
  :::u-landing-card
  ---
  title: SDK
  to: '/connect/sdk'
  class: col-span-4
  color: blue
  ---
  :::
::

## Tutorials

::u-landing-grid{class="gap-4"}
  :::u-landing-card
  ---
  title: Directus with Next.js
  to: '/tutorials?tags=nextjs'
  class: col-span-4
  color: black
  ---
  :::

  :::u-landing-card
  ---
  title: Build Projects with Directus
  to: '/tutorials?tags=nextjs'
  class: col-span-4
  color: purple
  ---
  :::

  :::u-landing-card
  ---
  title: Using Directus Auth
  to: '/tutorials?tags=directus-auth'
  class: col-span-4
  color: amber
  ---
  :::

  :::u-landing-card
  ---
  title: Automate & Integrate
  to: '/tutorials?tags=directus-automate'
  class: col-span-4
  color: yellow
  ---
  :::

  :::u-landing-card
  ---
  title: Self-Hosting Guide
  to: '/tutorials/self-hosting'
  class: col-span-4
  color: cyan
  ---
  :::

  :::u-landing-card
  ---
  title: SEO Best Practices
  to: '/tutorials/tips-and-tricks/search-engine-optimization-best-practices'
  class: col-span-4
  color: lime
  ---
  :::

  :::callout{icon="i-heroicons-light-bulb" to="/tutorials" class="col-span-8"}
  See All Tutorials
  :::
::

## Releases

::u-landing-grid{class="gap-4"}
  :::u-landing-card
  ---
  icon: simple-icons:github
  title: GitHub Releases
  to: 'https://github.com/directus/directus/releases'
  class: col-span-4
  color: black
  ---
  :::

  :::u-landing-card
  ---
  icon: material-symbols:error-med
  title: Breaking Changes
  to: '/releases/breaking-changes'
  class: col-span-4
  color: red
  ---
  :::

  :::u-landing-card
  ---
  icon: material-symbols:list-alt-add-outline
  title: Changelog
  to: '/releases/changelog'
  class: col-span-4
  color: yellow
  ---
  :::
::

## Community-Maintained Tooling

These are built and maintained by our awesome community. If you are building tooling and want to include it here, please open a [pull request on GitHub](https://github.com/directus/docs).

::u-landing-grid{class="gap-4"}
  :::u-landing-card
  ---
  icon: simple-icons:python
  title: Python SDK
  to: 'https://pypi.org/project/directus-sdk-py/'
  class: col-span-4
  color: blue
  ---
  :::

  :::u-landing-card
  ---
  icon: simple-icons:go
  title: Go SDK
  to: 'https://pkg.go.dev/github.com/altipla-consulting/directus-go#section-readme'
  class: col-span-4
  color: cyan
  ---
  :::

  :::u-landing-card
  ---
  icon: simple-icons:dart
  title: Dart SDK
  to: 'https://github.com/apstanisic/directus-dart'
  class: col-span-4
  color: orange
  ---
  :::

  :::u-landing-card
  ---
  icon: simple-icons:nuxtdotjs
  title: Nuxt Module
  to: 'https://nuxt.com/modules/directus'
  class: col-span-4
  color: green
  ---
  :::
  
  :::u-landing-card
  ---
  icon: simple-icons:helm
  title: Helm Chart
  to: 'https://github.com/directus-labs/helm-chart'
  class: col-span-4
  color: red
  ---
  :::
::

## Advanced Concepts

::u-landing-grid{class="gap-4"}
  :::u-landing-card
  ---
  title: Environment Variables
  to: '/configuration/general'
  class: col-span-4
  color: red
  ---
  :::
  
  :::u-landing-card
  ---
  title: Building Extensions
  to: '/guides/extensions/overview'
  class: col-span-4
  color: violet
  ---
  :::
  
  :::u-landing-card
  ---
  title: Self-Hosting
  to: '/self-hosting/overview'
  class: col-span-4
  color: emerald
  ---
  :::
::
