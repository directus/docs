---
stableId: 04c88d97-65b0-4cf0-a5eb-1a046f034207
title: Mermaid Playground
description: Test the themed Mermaid component, navigation controls, and diagram exports.
navigation: false
---

Use the toolbar to zoom, reset the view, or download each diagram as PNG or SVG. Drag the canvas to pan. With the canvas focused, use the arrow keys to pan, `+` and `-` to zoom, and `0` to reset.

## Flowchart

::mermaid{title="Directus request flow" filename="directus-request-flow"}
```mermaid
flowchart LR
  App[Client application] --> SDK[Directus SDK]
  SDK --> Auth{Authenticated?}
  Auth -->|Yes| API[Directus API]
  Auth -->|No| Login[Sign in]
  Login --> API
  API --> Access[Access control]
  Access --> Database[(Database)]
  Access --> Storage[(File storage)]
  Access --> Flows[Event flows]
```
::

## Sequence diagram

::mermaid{title="Item creation" filename="item-creation"}
```mermaid
sequenceDiagram
  Client->>Directus: POST /items/articles
  Directus->>Policy: Check create access
  Policy-->>Directus: Allowed fields
  Directus->>Database: Insert article
  Database-->>Directus: Created item
  Directus-->>Client: 200 OK
```
::

## State diagram

::mermaid{title="Content workflow" filename="content-workflow"}
```mermaid
stateDiagram-v2
  [*] --> Draft
  Draft --> InReview: submit
  InReview --> Draft: request changes
  InReview --> Published: approve
  Published --> Archived: archive
  Archived --> Draft: restore
```
::

## XY chart

Hover over the bars or line points to test interactive tooltips.

::mermaid{title="API requests" filename="api-requests"}
```mermaid
xychart-beta
  title "API requests"
  x-axis [Mon, Tue, Wed, Thu, Fri]
  y-axis "Requests" 0 --> 500
  bar [240, 320, 280, 410, 390]
  line [210, 270, 310, 360, 430]
```
::
