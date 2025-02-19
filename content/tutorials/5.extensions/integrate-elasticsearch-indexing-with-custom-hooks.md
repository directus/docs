---
id: 11878553-5f03-4992-b321-5a983826c983
slug: integrate-elasticsearch-indexing-with-custom-hooks
title: Integrate Elasticsearch Indexing with Custom Hooks
authors:
  - name: Taminoturoko Briggs
    title: Guest Author
description: Learn how to maintain an Elasticsearch index when data is created, updated, and deleted.
---
In this article, we will explore how to index data from Directus in Elasticsearch through a custom hook extension, enabling you to track created, updated, and deleted data to maintain an up-to-date index which you can then use in your external applications.

## Setting Up Directus

You will need to have a [local Directus project running](/getting-started/overview) to develop extensions.

In your new project, create a collection called `books` with a `title` and a `description` field.

## Initializing Your Extension

In your `docker-compose.yml` file, set an `EXTENSIONS_AUTO_RELOAD` environment variable to `true` so that Directus will automatically watch and reload extensions as you save your code. Restart your project once your new environment variable is added.

In your terminal, navigate to your `extensions` directory and run `npx create-directus-extension@latest`. Name your extension `elasticsearch-indexing` and choose a `hook` type and create the extension with `JavaScript`. Allow Directus to automatically install dependencies and wait for them to install.

## Seting Up Elasticsearch

To integrate Directus and Elasticsearch, you will need a running instance of both. For this tutorial, [Elastic Cloud](https://www.elastic.co/cloud/elasticsearch-service/signup) will be used. You will need both the Cloud ID and an API Key, which you can generate from your deployment dashboard.

In your `docker-compose.yml` file, create an `ELASTIC_API_KEY` and `ELASTIC_CLOUD_ID` environment variable and set them to the value from your Elasticsearch dashboard. Restart your project as you have changed your environment variables.

Navigate into your new extension directory, run `npm install @elastic/elasticsearch`, and then `npm run dev` to start the automatic extension building.

At the top of your extension's `src/index.js` file, initialize the Elasticsearch client:

```js
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { Client } = require("@elastic/elasticsearch");

export default ({ action }, { env }) => {
  const client = new Client({
    cloud: { id: env.ELASTIC_CLOUD_ID },
    auth: { apiKey: env.ELASTIC_API_KEY },
  });
};
```
Because Elasticsearch is a CommonJS package, the `require()` function is constructed using the `createRequire()` Node utility method and used to import it to avoid errors.
## Saving Items to Index
Add the following lines of code after the `client` variable:
```js
action("books.items.create", async (meta) => {
  await client.index({
    index: "books",
    id: meta.key,
    document: meta.payload,
  });
});
```
This `action` hook will be triggered when an item is created in `books` collection. This is achieved by specifying `books.items.create` as the event name.
When executed a document will be created in an Elasticsearch `books` index containing the newly created item fields which was accessed from the `meta` object. The `meta` object includes the ID of the newly created item in the `key` property and the item fields in the `payload` property.
Although the `books` index was not explicitly created, that will be done automatically if doesn’t exist and a new document is been created which is the default behavior.
## Updating Items in Index
Add the following lines of code below the existing action:
```js
action("books.items.update", async (meta) => {
  await Promise.all(
    meta.keys.map(
      async (key) =>
        await client.update({
          index: "books",
          id: key,
          doc: meta.payload,
        })
    )
  );
});
```
For an update event, the `meta` object will includes an array of `keys` along with the updated fields even when only a single item is updated. So to modify the corresponding document or documents in `books` index, the array of keys is iterated over to send multiple update requests.

## Deleting Items in Index
For a delete event, the `meta` object includes an array of keys of the of the deleted items. Fields are not included. Add the following lines of code after the `books.items.update` action:
```js
action("books.items.delete", async (meta) => {
  await Promise.all(
    meta.keys.map(
      async (key) =>
        await client.delete({
          index: "books",
          id: key,
        })
    )
  );
});
```

## Testing Extension
When you create, update, or delete items in the `books` collection, the changes should reflect in your Elasticsearch `books` index.

## Summary
By following this guide, you have learned how to set up extensions in Directus. You also saw how to test the extension by creating, updating, and deleting data in Directus, with changes being reflected in your Elasticsearch index. This setup ensures that our data remains synchronized across both platforms.
