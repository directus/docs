---
id: 27fd058d-83da-4ea5-b7cc-458c4c696079
slug: integrate-meilisearch-indexing-with-custom-hooks
title: Integrate Meilisearch Indexing with Custom Hooks
authors:
  - name: Clara Ekekenta
    title: Guest Author
description: Learn how to maintain an Meilisearch index when data is created, updated, and deleted.
---
In this article, we will explore how to index data from Directus in Meilisearch by building a custom hook extension, enabling you to track created, updated, and deleted data to maintain an up-to-date index which you can then use in your external applications.


## Setting Up Directus

You will need to have a [local Directus project running](/getting-started/overview) to develop extensions.

In your new project, create a collection called `articles` with a `title`, `content`, and `author` field.

## Initializing Your Extension

In your `docker-compose.yml` file, set an `EXTENSIONS_AUTO_RELOAD` environment variable to `true` so that Directus will automatically watch and reload extensions as you save your code. Restart your project once your new environment variable is added.

In your terminal, navigate to your `extensions` directory and run `npx create-directus-extension@latest`. Name your extension `melisearch-indexing` and choose a `hook` type and create the extension with `JavaScript`. Allow Directus to automatically install dependencies and wait for them to install.

## Setting Up Meilisearch

Sign up for a Meilisearch account if you haven't already. Once you have your Meilisearch instance details, you will be able to copy your credentials in your dashboard.

![Melisearch dashboard](/img/d1aab892-21de-402a-84c5-024c0c0f2f88.webp)

Add the following environment variables to your project:

```dockerfile
MEILISEARCH_HOST=your_meilisearch_host
MEILISEARCH_API_KEY=your_meilisearch_api_key
```

Navigate into your new extension directory, run `npm install meilisearch`, and then `npm run dev` to start the automatic extension building.

At the top of your extension's `src/index.js` file, initialize the Meilisearch client:

```js
import { MeiliSearch } from 'meilisearch'

const client = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST,
  apiKey: process.env.MEILISEARCH_API_KEY
})
const index = client.index('directus_index')
```

## Saving New Items to Index

Update your extension's exported function to process create events when a new `article` is added to the collection:

```js
export default ({ action }) => {
  action('articles.items.create', async (meta) => {
    await index.addDocuments([{ id: meta.key, ...meta.payload }])
  })
}
```

The `articles.items.create` action hook triggers after item creation. The `meta` object contains the new item's `key` (ID) and other fields in its `payload` property. By setting the `objectID` to the Directus item `id`, we ensure accurate referencing and management in Meilisearch.

### Updating Items in Index

Add another action hook to process updates when one or more articles are modified:

```js
action('articles.items.update', async (meta) => {
  await Promise.all(
    meta.keys.map(async (key) =>
      await index.updateDocuments([{ id: key, ...meta.payload }])
    )
  )
})
```

The `articles.items.update` action hook triggers when articles are updated. It receives `meta.keys` (an array of updated item IDs) and `meta.payload` (changed values). The hook updates each document in Meilisearch.

### Deleting Items in Index

Add an action hook to remove items from Meilisearch when they're deleted in Directus:

```js
action('articles.items.delete', async (meta) => {
  await index.deleteDocuments(meta.keys)
})
```

The `articles.items.delete` action hook triggers when articles are deleted. It receives `meta.keys`, an array of deleted item IDs. The hook uses these keys to remove the corresponding documents from the Meilisearch index.

Now add 3 items to your articles collection and you should see them in your Meilisearch index.

![Melisearch with data from Directus](/img/90307d1c-889f-4067-a031-57b621898eaf.webp)


## Summary

In this tutorial, you've learned how to integrate Meilisearch with Directus. You've learned how to setup the Directus hooks that automatically indexes data created, updated, or deleted from a Directus project in Meilisearch.
