---
id: 38c78e29-8fad-46f8-8855-f18864310d00
slug: promoting-changes-between-environments-in-directus
title: Promoting Changes Between Environments in Directus
authors:
  - name: Carmen Huidobro
    title: Developer Educator
description: Learn the options to migrate schema and data between Directus projects.
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


## Migrate Your Schema

Directus' schema migration endpoints allow users to retrieve a project's data model and apply changes to another
project.

This is useful if you make changes to a data model in a development project and need to apply them to a production
project, or to move from a self-hosted project to Directus Cloud.

### How-To Guide

::callout{icon="material-symbols:info-outline"}

**Permissions**<br/>

You must be an admin user to use these endpoints and follow this guide.

::

You should have two Directus projects - this guide will refer to them as the "base" and the "target".

::tabs
    ::div{class="pr-6"}
    ---
    label: Node.js
    ---
    #### Set Up Project

    Open a new empty directory in your code editor. In your terminal, navigate to the directory and install dependencies
    with `npm install @directus/sdk`.

    Create a new `index.js` file and set it up:

    ```js
    import { createDirectus, authentication, rest, schemaSnapshot, schemaDiff, schemaApply } from '@directus/sdk';
    const BASE_DIRECTUS_URL = 'https://your-base-project.directus.app';

    const TARGET_DIRECTUS_URL = 'https://your-target-project.directus.app';

    const baseDirectus = createDirectus(BASE_DIRECTUS_URL).with(rest());
    const targetDirectus = createDirectus(TARGET_DIRECTUS_URL).with(rest());

    await baseDirectus.login('base_email', 'base_password');
    await targetDirectus.login('target_email', 'target_password');

    async function main() {}

    main();
    ```

    #### Retrieve Data Model Snapshot From Base Project

    At the bottom of `index.js`, create a `getSnapshot()` function:

    ```js
    async function getSnapshot() {
      return await baseDirectus.request(schemaSnapshot());
    }
    ```

    Note that the data property is destructured from the response and returned. In the `main()` function, call
    `getSnapshot()`:

    ```js
    async function main() {
      const snapshot = await getSnapshot(); // [!code ++]
      console.log(snapshot); // [!code ++]
    }
    ```

    Get your snapshot by running `node index.js`.

    #### Retrieve Data Model Diff

    This section will create a "diff" that describes all differences between your base and target project's data models.

    At the bottom of `index.js`, create a `getDiff()` function which accepts a `snapshot` parameter:

    ```js
    async function getDiff(snapshot) {
      return await targetDirectus.request(schemaDiff(snapshot));
    }
    ```

    Update your `main()` function:

    ```js
    async function main() {
      const snapshot = await getSnapshot();
      console.log(snapshot); // [!code --]
      const diff = await getDiff(snapshot); // [!code ++]
      console.log(diff); // [!code ++]
    }
    ```

    Get your diff by running `node index.js`.

    #### Apply Diff To Target Project

    At the bottom of `index.js`, create a `applyDiff()` function which accepts a `diff` parameter:

    ```js
    async function applyDiff(diff) {
      return await targetDirectus.request(schemaApply(diff));
    }
    ```

    Update your `main()` function:

    ```js
    async function main() {
      const snapshot = await getSnapshot();
      const diff = await getDiff(snapshot);
      console.log(diff); // [!code --]
      await applyDiff(diff); // [!code ++]
    }
    ```

    Apply the diff by running `node index.js`.

    ### Handling Different Directus Versions

    The diff endpoint does not allow different Directus versions and database vendors by default. This is to avoid any
    unintentional diffs from being generated. You can opt in to bypass these checks by adding a second query parameter
    called `force` with the value of `true`.

    The hash property in the diff is based on the target instance's schema and version. It is used to safeguard against
    changes that may happen after the current diff was generated which can potentially incur unexpected side effects when
    applying the diffs without this safeguard. In case the schema has been changed in the meantime, the diff must be
    regenerated.

    The complete and final code is available below.

    ```js
    import { createDirectus, authentication, rest, schemaSnapshot, schemaDiff, schemaApply } from '@directus/sdk';
    const BASE_DIRECTUS_URL = 'https://your-base-project.directus.app';

    const TARGET_DIRECTUS_URL = 'https://your-target-project.directus.app';

    const baseDirectus = createDirectus(BASE_DIRECTUS_URL).with(rest());
    const targetDirectus = createDirectus(TARGET_DIRECTUS_URL).with(rest());

    await baseDirectus.login('base_email', 'base_password');
    await targetDirectus.login('target_email', 'target_password');

    async function main() {
      const snapshot = await getSnapshot();
      const diff = await getDiff(snapshot);
      await applyDiff(diff);
    }

    main();

    async function getSnapshot() {
      return await baseDirectus.request(schemaSnapshot());
    }

    async function getDiff(snapshot) {
      return await targetDirectus.request(schemaDiff(snapshot));
    }

    async function applyDiff(diff) {
      return await targetDirectus.request(schemaApply(diff));
    }
    ```
    ::
    ::div{class="pr-6"}
    ---
    label: REST API
    ---
    #### Retrieve Data Model Snapshot From Source Project

    Perform a `GET` request to `/schema/snapshot?access_token=<YOUR_ACCESS_TOKEN>`.

    Copy the JSON response with your data model snapshot.

    #### Retrieve Data Model Diff

    This section will create a "diff" that describes all differences between your source and target project's data models.

    Perform a `POST` request to `/schema/snapshot?access_token=<YOUR_ACCESS_TOKEN>`, with the "Content Type" header set to `application/json` and the body set to the contents of the `data` property of JSON response from the snapshot.

    Copy the JSON response with your data model diff.

    #### Apply Diff To Target Project

    Perform a `POST` request to `/schema/apply?access_token=<YOUR_ACCESS_TOKEN>`, with the "Content Type" header set to `application/json` and the body set to the contents of the `data` property of JSON response from the snapshot.

    Note the response status of 204, which indicates a successful data model migration.

    ### Final Tips

    The diff endpoint does not allow different Directus versions and database vendors by default. This is to avoid any
    unintentional diffs from being generated. You can opt in to bypass these checks by adding a second query parameter
    called `force` with the value of `true`.

    The hash property in the diff is based on the target instance's schema and version. It is used to safeguard against
    changes that may happen after the current diff was generated which can potentially incur unexpected side effects when
    applying the diffs without this safeguard. In case the schema has been changed in the meantime, the diff must be
    regenerated.
    ::
  ::
