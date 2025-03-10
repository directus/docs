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

## Dynamic API

The platform's API uses database mirroring to dynamically generate
REST endpoints and a GraphQL schema based on the connected database's architecture. Since these endpoints return data
based on your specific schema and configured permissions, the input/output of the API differs greatly for individual
installations.

## Relational Data

By default, Directus only retrieves the reference value of a relational field in your items. To also retrieve nested data of a relational field, [the `fields` parameter](/guides/connect/query-parameters) in REST can be used, or regular nested
queries in GraphQL. This allows you to retrieve the author of your article included in the articles data, or fetch
related log entry points for your app's analytics data, for example.
