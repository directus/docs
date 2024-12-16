---
title: Directus Documentation
description: Learn how to get started and implement Directus through our developer resources.
navigation: false
---

## Try a Demo

::tabs
  ::div
  ---
  label: Local Demo
  ---

  Run Docker locally and use the following command to start the project.

  ```
  docker run -p 8055:8055 directus/directus
  ```

  This project has no persistence. All data will be lost when the container is stopped. Read our [Create a Project guide](/getting-started/create-a-project) to learn how to create a project with persistence.
  ::

  ::div
  ---
  label: Hosted Demo
  ---
  Try our [hosted demo project](https://directus.pizza/?utm_source=directus-docs&utm_campaign=docs-home). This is a public demo project that is occasionally reset but please don't input sensitive data.
  ::
::

<div style="margin-bottom: 4rem;"></div>

:video-embed{video-id="96b44cbc-1b14-4bea-87cd-0c4cb34d261d"}

## Getting Started

:article-cards{:show-description=false :paths='[{"title": "Platform Overview", "_path": "/getting-started/platform-overview"}, "/getting-started/create-a-project", { "title": "Directus Academy", "_path": "https://directus.io/tv/directus-academy"}]'}

## Features

:engine-studio-box

## Directus APIs

:article-cards{:show-description=false :paths='["/connect/quickstart", { "title": "API Reference", "_path": "/api"}, "/connect/sdk"]'}

## Tutorials

:article-cards{:show-description=false :paths='[{ "title": "Directus with Next.js", "_path": "/tutorials?tags=nextjs"}, { "title": "Build Projects with Directus", "_path": "/tutorials/projects"}, { "title": "Using Directus Auth", "_path": "/tutorials?tags=directus-auth"}, { "title": "Automate & Integrate", "_path": "/tutorials?tags=directus-automate"}, { "title": "Self-Hosting Guides", "_path": "/tutorials/self-hosting"}, { "title": "SEO Best Practices", "_path": "/tutorials/tips-and-tricks/search-engine-optimization-best-practices"}]'}

<a href="https://directus.io/tutorials" style="margin-top: 1rem; display: block; text-align: center;">See All Tutorials</a>

## Releases

:article-cards{:show-description=false :paths='[{"title":"GitHub Releases", "_path": "https://github.com/directus/directus/releases"},"/releases/breaking-changes", { "title": "The Changelog", "_path": "/releases/changelog"}]'}

## Community-Maintained Tooling

These are built and maintained by our awesome community. If you are building tooling and want to include it here, please open a [pull request on GitHub](https://github.com/directus/docs).

:article-cards{:show-description=false :paths='[{"title":"Python SDK", "_path": "https://pypi.org/project/directus-sdk-py/"}, { "title": "Go SDK", "_path": "https://pkg.go.dev/github.com/altipla-consulting/directus-go#section-readme"}, { "title": "Dart SDK", "_path": "https://github.com/apstanisic/directus-dart"}, { "title": "Nuxt Module", "_path": "https://nuxt.com/modules/directus"}, { "title": "Helm Charts", "_path": "https://github.com/directus-labs/helm-chart"}]'}

## Advanced Concepts

:article-cards{:show-description=false :paths='[{"title":"Environment Variables", "_path": "/configuration/general"}, { "title": "Building Extensions", "_path": "/extensions/overview"},{ "title": "Self-Hosting", "_path": "/self-hosting/overview"}]'}
