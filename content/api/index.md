---
title: Directus API Reference
description: Learn how to use our API
---

Each Directus project comes with an integrated RESTful API that adapts as you work on your project.

Authentication is achieved via [access tokens, cookies or sessions](/guides/auth/tokens-cookies).

You can also interact with the API using GraphQL or the [Directus SDK](/guides/connect/sdk).

This API reference is generated from our OpenAPI specification. Found an error? Please open a PR on the [directus/openapi](https://github.com/directus/openapi) repo!

## Registering and Logging in Users

::shiny-grid{class="mt-6"}
  ::shiny-card
  ---
  title: Register
  class: col-span-6
  to: '/api/users#register-a-new-user'
  ---
  ::
  
  ::shiny-card
  ---
  title: Login
  class: col-span-6
  to: '/api/authentication#login'
  ---
  ::
::

## Working with Files and Items

::shiny-grid{class="mt-6"}
  ::shiny-card
  ---
  title: Upload a File
  class: col-span-6
  to: '/api/files#upload-a-file'
  ---
  ::

  ::shiny-card
  ---
  title: Retrieve an Item
  class: col-span-6
  to: '/api/items#retrieve-an-item'
  ---
  ::
::

## Relational Data

::shiny-grid{class="mt-6"}
  ::shiny-card
  ---
  title: Working With Relational Data
  class: col-span-6
  to: '/guides/connect/relations'
  ---
  ::

::

## Dynamic API

The platform's API uses database mirroring to dynamically generate
REST endpoints and a GraphQL schema based on the connected database's architecture. Since these endpoints return data
based on your specific schema and configured permissions, the input/output of the API differs greatly for individual
installations.
