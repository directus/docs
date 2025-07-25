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

  :doc-cli-snippet{command="npx directus-template-cli@latest init"}

  You can then select a project directory name, a backend template, frontend framework, and whether to install dependencies automatically.
  ::::

  ::::div{class="pr-6"}
  ---
  label: Hosted Demo
  ---
  Try our [hosted demo project](https://sandbox.directus.io). This is a public demo project that is occasionally reset but please don't input sensitive data.
  ::::
:::

#right
:video-embed{video-id="96b44cbc-1b14-4bea-87cd-0c4cb34d261d"}

::

## Getting Started

::shiny-grid{class="lg:grid-cols-2"}
  :::shiny-card
  ---
  title: Platform Overview
  description: Get starting with using Directus.
  icon: simple-icons:directus
  to: /getting-started/overview
  ---
  :::

  :::shiny-card
  ---
  title: Directus Academy
  description: Learn to use Directus in our video series.
  icon: heroicons-outline:play
  to: https://directus.io/tv/directus-academy
  ---
  :::
::

## Features

::shiny-grid{class="lg:grid-cols-2"}
  :::shiny-card
  ---
  title: Data Engine
  description: APIs and developer tools for your data.
  ---
  :product-link{product="connect"} :product-link{product="realtime"} :product-link{product="auth"} :product-link{product="automate"}
  :::

  :::shiny-card
  ---
  title: Data Studio
  description: A data web app your whole team will love.
  ---
  :product-link{product="explore"} :product-link{product="editor"} :product-link{product="insights"} :product-link{product="files"}
  :::
::

## Directus APIs

::shiny-grid
  :::shiny-card
  ---
  title: Quickstart
  description: Learn to connect with Directus.
  icon: heroicons-outline:star
  to: '/getting-started/use-the-api'
  ---
  :::

  :::shiny-card
  ---
  title: API Reference
  description: Learn how to use the Directus API.
  icon: heroicons-outline:play
  to: '/api'
  ---
  :::

  :::shiny-card
  ---
  title: SDK
  description: Official JavaScript and TypeScript library.
  icon: heroicons-outline:code
  to: '/guides/connect/sdk'
  ---
  :::
::

## Tutorials

::shiny-grid
  :::shiny-card
  ---
  title: Integrate Your Frontend
  description: Learn how to build a website using Directus as a Headless CMS using various frameworks.
  icon: material-symbols:web
  to: '/tutorials/getting-started'
  ---
  :::

  :::shiny-card
  ---
  title: Build Projects with Directus
  description: Learn from a variety of different usecases you can build using Directus.
  icon: heroicons-outline:wrench
  to: '/tutorials/projects'
  ---
  :::

  :::shiny-card
  ---
  title: Tips and Tricks
  description: Small concepts and techniques to get the most from Directus.
  icon: heroicons-outline:light-bulb
  to: '/tutorials/tips-and-tricks'
  ---
  :::

  :::shiny-card
  ---
  title: Migrate
  description: Techniques and considerations when migrating from other platforms to Directus.
  icon: carbon:migrate
  to: '/tutorials/migration'
  ---
  :::

  :::shiny-card
  ---
  title: Extensions
  description: Learn to build extensions from examples that amplify Directus' functionality.
  icon: heroicons-outline:puzzle
  to: '/tutorials/extensions'
  ---
  :::

  :::shiny-card
  ---
  title: Workflows
  description: Learn to set up common patterns to build complex workflows and integrations.
  icon: material-symbols:flowchart-outline
  to: '/tutorials/workflows'
  ---
  :::

  :::callout{icon="heroicons-outline:light-bulb" to="/tutorials" class="md:col-span-2 lg:col-span-3"}
  See All Tutorials
  :::
::

## Releases

::shiny-grid
  :::shiny-card
  ---
  title: GitHub Releases
  description: See the complete and latest updates and release notes for Directus.
  icon: simple-icons:github
  to: 'https://github.com/directus/directus/releases'
  ---
  :::

  :::shiny-card
  ---
  title: Breaking Changes
  description: Breaking changes may require action on your part before upgrading.
  icon: heroicons-outline:exclamation-circle
  to: '/releases/breaking-changes'
  ---
  :::

  :::shiny-card
  ---
  title: Changelog
  description: A monthly summary of what's new from the Directus team.
  icon: heroicons-outline:document-text
  to: '/releases/changelog'
  ---
  :::
::

## Community-Maintained Tooling

::shiny-grid
  :::shiny-card
  ---
  title: Python SDK
  description: Interact with Directus using Python.
  icon: simple-icons:python
  to: 'https://pypi.org/project/directus-sdk-py/'
  ---
  :::

  :::shiny-card
  ---
  title: Go SDK
  description: Interact with Directus using Go.
  icon: simple-icons:go
  to: 'https://pkg.go.dev/github.com/altipla-consulting/directus-go#section-readme'
  ---
  :::

  :::shiny-card
  ---
  title: Dart SDK
  description: Interact with Directus using Dart.
  icon: simple-icons:dart
  to: 'https://github.com/apstanisic/directus-dart'
  ---
  :::

  :::shiny-card
  ---
  title: Nuxt Module
  description: Easily connect your Nuxt application to your Directus project.
  icon: simple-icons:nuxtdotjs
  to: 'https://nuxt.com/modules/directus'
  ---
  :::

  :::shiny-card
  ---
  title: Helm Chart
  description: Community-maintained Helm Charts repository for Directus.
  icon: simple-icons:helm
  to: 'https://github.com/directus-labs/helm-chart'
  ---
  :::

  :::shiny-card
  ---
  title: PHP SDK
  description: Interact with Directus using PHP.
  icon: simple-icons:php
  to: 'https://github.com/alantiller/directus-php-sdk'
  ---
  :::

  :::callout{icon="material-symbols:lightbulb-2-outline" class="lg:col-span-3"}
  These are built and maintained by our awesome community. If you are building tooling and want to include it here, please open a [pull request on GitHub](https://github.com/directus/docs).
  :::
::

## Advanced Concepts

::shiny-grid
  :::shiny-card
  ---
  title: Environment Variables
  description: Configure Directus at an advanced level.
  icon: heroicons-outline:cog
  to: '/configuration/general'
  ---
  :::

  :::shiny-card
  ---
  title: Building Extensions
  description: Learn to build Extensions for Directus.
  icon: heroicons-outline:puzzle
  to: '/guides/extensions/overview'
  ---
  :::

  :::shiny-card
  ---
  title: Self-Hosting
  description: Learn to self-host Directus in your infrastructure.
  icon: heroicons-outline:cloud
  to: '/self-hosting/overview'
  ---
  :::
::
