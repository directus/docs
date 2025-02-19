---
id: bb540f00-8933-46f1-a2ef-e353e2df160d
slug: integrate-algolia-indexing-with-custom-hooks
title: Integrate Algolia Indexing with Custom Hooks
authors:
  - name: Marvel Ken-Anele
    title: Guest Author
description: Learn how to maintain an Algolia index when data is created, updated, and deleted.
---

In this article, we will explore how to index data from Directus in Algolia, enabling you to track created, updated, and deleted data to maintain an up-to-date index which you can then use in your external applications. Given that Algolia only support their official JavaScript client and not the REST API directly, we will build a hook extension which utilizes the client.

## Setting Up Directus

You will need to have a [local Directus project running](/getting-started/overview) to develop extensions.

In your new project, create a collection called `posts` with a `title`, `content`, and `author` field.

## Initializing Your Extension

In your `docker-compose.yml` file, set an `EXTENSIONS_AUTO_RELOAD` environment variable to `true` so that Directus will automatically watch and reload extensions as you save your code. Restart your project once your new environment variable is added.

In your terminal, navigate to your `extensions` directory and run `npx create-directus-extension@latest`. Name your extension `algolia-indexing` and choose a `hook` type and create the extension with `JavaScript`. Allow Directus to automatically install dependencies and wait for them to install.

## Setting Up Algolia

To integrate Directus and Algolia we will need our Algolia application ID and write API key. If you don't have an account already, [create one](https://www.algolia.com/users/sign_up), and you will see the credentials in your dashboard.

![An image of Algolia Dashboard](/img/97c2157a-9b88-4d31-8b16-ac4e47c3ffac.webp)

In your `docker-compose.yml` file, create an `ALGOLIA_APP_ID` and `ALGOLIA_ADMIN_KEY` environment variable and set them to the value from your Algolia dashboard. Restart your project as you have changed your environment variables.

Navigate into your new extension directory, run `npm install algoliasearch`, and then `npm run dev` to start the automatic extension building.

At the top of your extension's `src/index.js` file, initialize the Algolia client:

```js
import algoliasearch from  'algoliasearch';
const client = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_KEY);
const index = client.initIndex('directus_index');
```

## Saving New Objects to Index

Update your exported function to run the Algolia `saveObjects()` method whenever a new item in the `posts` collection is created:

```js
export default ({ action }) => {
    action('posts.items.create', async (meta) => {
        await index.saveObjects([{ objectID: `${meta.key}`, ...meta.payload }]);
    });
};
```

An `action` hook runs after an item has been created. Data passed in the `meta` property includes the new `key` (ID) of the item, and all the value of all fields created in the `payload` property.

For item creation (posts.items.create), the code registers a hook that triggers when a new item is added to the posts collection. The item is saved with an `objectID` set to the Directus item `id`, ensuring it can be accurately referenced and managed in Algolia.

## Updating Objects in Index

When one or more items are updated, the `<collection>.items.update` action receives an array of `keys` along with just the values in each item that have changed. Below the existing action, add another:

```js
action('posts.items.update', async (meta) => {
    await Promise.all(
        meta.keys.map(async (key) => await index.partialUpdateObjects([{ objectID: `${key}`, ...meta.payload }])),
    );
});
```

## Deleting Objects in Index

When one or more items are deleted, the `<collection>.items.delete` action receives an array of `keys`. Add a new action:

```js
action('posts.items.delete', async (meta) => {
    await index.deleteObjects(meta.keys);
});
```

## Testing Extension

To test if the extension works, create a new post in Directus.

To verify that the indexing process is functioning as expected, navigate to the Algolia Dashboard. Click on "Search" in the navigation menu on the left side of your screen, then select the index. You should see that Algolia has recognized the new data:

![An image of the created blog post](/img/3d583367-334f-48dc-bb55-c65c6b4d849b.webp)

Also try updating and deleting posts and check if the index reflects the change.


## Summary

By following this guide, you have learned how to set up extensions in Directus. You also saw how to test the extension by creating, updating, and deleting data in Directus, with changes being reflected in your Algolia index. This setup ensures that our data remains synchronized across both platforms.
