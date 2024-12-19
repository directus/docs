---
id: 38c78e29-8fad-46f8-8855-f18864310d00
slug: promoting-changes-between-environments-in-directus
title: Promoting Changes Between Environments in Directus
authors: 
  - name: Carmen Huidobro
    title: Developer Educator
---
In Directus, different environments (development, staging, production) are managed as separate project instances. This guide explains how to safely promote changes between these environments.

## Schema Changes

Schema changes should originate in your development environment. Use the [Schema API](/api/schema) to promote these changes to other environments. The API provides endpoints for taking snapshots, comparing schemas, and applying changes.

## Content Management

Manage all production content as your single source of truth using:

- Status fields (draft, published, etc.)
- Roles and permissions
- Flows to control publishing process and procedures

### Migration Options
When you need to migrate content as part of schema updates, you have several options:

1. **Data Studio**: Use the built-in interface to export/import data in CSV, JSON, or XML formats.

2. **Import/Export API**: Automate migrations using the [Import and Export](/api/files) endpoints.

3. **Advanced Options**:
   - [Custom extensions migrations](/self-hosting/including-extensions)
   - Direct database operations (being careful with system tables)
   - Using and modifying the [template CLI](https://github.com/directus-community/directus-template-cli) to extract and load of all schema, system collections and content.

::callout{type="info" title="Need help?"}

Visit our [Community Help](https://directus.chat/) channel.

::
