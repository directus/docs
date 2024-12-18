---
id: 03141a12-e9be-4fd5-8072-78685d4ff12b
slug: trigger-netlify-site-builds-with-directus-automate
title: Trigger Netlify Site Builds with Directus Automate
authors: []
---
## Explanation

When using Directus as a [Headless CMS](https://directus.io/solutions/headless-cms), it is common to pair it with a
front-end framework / static site generator like [Next.js](https://nextjs.org/), [Nuxt.js](https://nuxt.com),
[SvelteKit](https://kit.svelte.dev/), or other options.

[Netlify](https://www.netlify.com/) and other similar platforms make it easy to host and deploy your site using static
site generation (SSG) to render your site’s pages during build time, instead of waiting until a certain page is
requested.

This recipe will show you how to trigger a new deployment or build for your site when new content is published or when
existing content changes.

## How-To Guide

::callout{type="info" title="Requirements"}

You’ll need to have already created a collection for your site content like `articles` or `posts` or `pages` with a
field `status` that controls the published state. You'll also need to have a Netlify account and a site already hosted
with them.

::

### Create and Configure Your Flow

1. [Create a new flow](/automate/flows)

   Give it a memorable name and short description like `Trigger New Site Build`.

2. [Complete the trigger setup](/automate/triggers)

   ![The trigger setup tab of the creating new flow interface is show. The event hook type is selected. The type field value is "Action(Non-Blocking)". In the scope field, "items.create" and "items.update" are selected.](https://product-team.directus.app/assets/ee5eca7d-2bcb-4e73-b6b6-d638375282f6.webp)

   a. Choose **Event Hook** for the trigger.

   b. For **Type**, select Action (Non-Blocking).

   This will trigger this flow after the action (i.e. article updated) has already taken place.

   c. For **Scope**, choose the following:

   - `items.create`
   - `items.update`

   d. For **Collections**, choose any collections that should trigger this flow.

   In this case, we’ll use `Articles` and `Articles Translations`.

### Add an Operation to Check Status Field

> This step is optional but it is recommended to add a Condition operation to prevent unnecessary builds.

3. [Create a new Operation](/automate/operations)

   ![Within a Directus Flow, the Create Operation screen is shown. The Name of the Operation is "If Published". The Operation type is "Condition". The value of the Condition Rules field is a JSON object.](https://product-team.directus.app/assets/4fb65e5f-8aa7-4683-96a4-6ba55ab93a7c.webp)

   a. Name your operation, i.e. `Check Status`, `If Published`, or similar.

   b. Add your Condition Rules

   ```json
   {
   	"$trigger": {
   		"payload": {
   			"status": {
   				"_eq": "published"
   			}
   		}
   	}
   }
   ```

### Configure Netlify Build Hook

::callout{type="info"}

You can learn more about Netlify Build Hooks on their documentation.

[https://docs.netlify.com/configure-builds/build-hooks/](https://docs.netlify.com/configure-builds/build-hooks/)

::

4. Copy your Build Hook URL from Netlify

   a. Open your Netlify account

   b. Navigate to your site → Site Settings → Build & deploy → Build hooks

   c. **Create a new build hook and copy the unique URL.**

### Add Webhook Operation to Your Flow

5. Back inside your Directus Flow, create a new Operation.

   ![Within a Directus Flow, the Create Operation screen is shown. The Name of the Operation is "Deploy Site". The Operation type is "Webhook / Request URL". The Method selected is "POST". The URL field value is the an HTTP address for the build hook from the hosting platform.](https://product-team.directus.app/assets/f78a10ce-99ec-4eef-80bd-abd5154bfce6.webp)

   a. For the type of Operation, select **Webhook / Request URL**

   b. Change **Method** to POST

   c. Paste the Build Hook URL from Netlify into the **URL** field

   d. Save this Operation

   e. Save your Flow

### Publish Your Flow

Great job! Now whenever you update an item in the `articles` collection and the `status` is equal to `published` , your
hosting platform will automatically re-build your site.

## Final Tips

This recipe covers a basic example of triggering a static site build.

It can be used in addition to other Flows recipes to build a robust content approval and publishing workflow for your
sites and projects.

**Tips**

- Make sure to test your flow several times to ensure everything is working as expected.
- As you add other collections that are published on your static site or frontend, make sure you update this Flow to
  include those collections in your Trigger.