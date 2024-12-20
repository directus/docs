---
id: c773724c-cc1b-4f79-bc46-208b26e8fd7f
slug: schedule-future-content-with-directus-automate
title: Schedule Future Content with Directus Automate
authors:
  - name: Bryant Gillespie
    title: Growth Engineer
description: Learn how to set content to be scheduled on a future date with Directs Automate.
---
## Explanation

This guide explains how to schedule content to be published on a future date for a statically generated site (SSG).

We'll be using [Flows](/guides/automate/flows) to publish articles when the current date matches the published date.

First we'll schedule a flow to run at regular intervals.

Next we'll check the timestamps of items with our content collection. And we'll update those the status of those items
whenever the published date is less than or equal the current timestamp.

Last, we'll kick off a new deployment of your static site at your hosting provider using one of the recipes below.

- [Triggering a static site build at Netlify](/tutorials/workflows/trigger-netlify-site-builds-with-directus-automate)
- [Triggering a static site build at Vercel](/tutorials/workflows/trigger-vercel-site-builds-with-directus-automate)

## How-To Guide

::callout{icon="material-symbols:info-outline"}

You’ll need to have already created a collection for your site content like `articles` or `posts` or `pages` with a
field `status` that controls the published state.

::

### Add a Field to Control Publish Date and Time

1. Under Settings, go to Data Model.

2. Choose your content [Collection](/guides/data-model/collections).

3. [Add a new field](/guides/data-model/fields) to your content Collection.

   ![The interface for creating a new field is shown. The field type Datetime is selected. The Key is named date_published. The field for Use 24-Hour format is checked.](/img/85ebd577-ed0d-4d7a-a1d4-4b43b9076b94.webp)

   a. Choose **Timestamp** for the Type.

   b. For the Key, use something relevant like `date_published`.

   c. Save the Field and your Collection.

### Add Some Content and Set a Publish Date

4. [Create or update an Item](/guides/content/editor) inside your Collection

   ![A content item within the Articles collection is shown. The title is "What is Headless CMS?". English translations are also shown with a Summary field. The Summary reads "A quick overview of what Headless CMS is and how it's beneficial to your team."](/img/dde30ee7-e06b-4617-965d-371463624a5e.webp)

   a. Set the `status` field to `scheduled`

   b. Add a date for the `date_published` field

   c. Add the content for other fields and save the Item

### Create and Configure Your Flow

5. [Create a new flow](/guides/automate/flows)

   ![Under the Creating a New Flow interface, the Flow Setup tab is shown. The name of the new flow is Published Scheduled Articles. The status is Active. The Description field reads "This is triggered every 15 minutes to publish any scheduled articles". The icon selected is "Fiber New". For the Color field, a green color with the hex code #2ECDA7 is selected. Track Activity & Logs is selected.](/img/2040227f-7536-480e-b458-20a8878dea47.webp)

   Give it a memorable name and short description like `Publish Scheduled Articles`.

6. [Complete the trigger setup](/guides/automate/triggers)

   ![Under the Creating New Flow interface, the Trigger Setup tab is shown. The selected trigger is Schedule(CRON). The Interval field has a value of "* 15 * * * *".](/img/dde30ee7-e06b-4617-965d-371463624a5e.webp)

   a. For **Type**, Select Schedule (CRON). This will trigger this flow at regular
   intervals of time.

   b. Add your **Interval** in proper CRON syntax.

   **Examples**

   - `* */1 * * * *` - Would trigger this flow every minute
   - `* */15 * * * *` – Would trigger this flow every 15 minutes

### Add an Operation to Check The Published Date and Update Data

7. [Create a new operation](/guides/automate/operations)

   ![Inside a Directus Flow, the Create Operation interface is shown. The Name of the operation is "Update Articles". The Key is "update_articles". The type of Operation is "Update Data". The Collection for the operation is "Articles". The Payload for the operation is a JSON object with key - status and value of published. There is also a JSON object for the Query field. A filter that checks that the item status is equal to "scheduled" and the date_published is less than or equal to the current timestamp.](/img/0424a6b8-7bd2-4c1a-ba8a-5c7c36edd7ea.webp)

   a. For the type of operation, select **Update Item**

   b. **Name** your operation, i.e. `Update Articles` or similar.

   c. Under **Collection**, choose your content collection i.e. `Articles` in our example.

   d. Check **Emit Events**

   ::callout{icon="material-symbols:warning-outline-rounded"}

   Emit events will trigger an `item.update` event in this flow. Be careful when using it in your flows to avoid
   creating infinite loops where flows continuously trigger one another.

   ::

   e. Set your **Payload**

   ```json
   {
   	"status": "published"
   }
   ```

   f. Add your filter rule in the **Query** field.

   ```json
   {
   	"filter": {
   		"_and": [
   			{
   				"status": {
   					"_eq": "scheduled"
   				}
   			},
   			{
   				"date_published": {
   					"_lte": "$NOW"
   				}
   			}
   		]
   	}
   }
   ```

   g. Save this Operation

   h. Save your Flow

### Trigger a New Build for Your Static Site

In this recipe, we'll terminate the flow here because we'll use a separate flow to trigger the build or deployment
process for your site. This approach helps keep everything modular and easier to maintain.

If you haven't already, you'll want to configure one of the recipes below.

- [Triggering a static site build at Netlify](/tutorials/workflows/trigger-netlify-site-builds-with-directus-automate)
- [Triggering a static site build at Vercel](/tutorials/workflows/trigger-vercel-site-builds-with-directus-automate)

You checked Emit Events in the operation during Step 7. This will emit an `item.update` event which is a trigger for the
Flows in the recipes above.

## Final Tips

**Tips**

- Make sure to test your flow several times to ensure everything is working as expected.
- As you add other collections that are published on your static site or frontend, make sure you update this flow to
  include those collections in your Trigger.

## Dynamic Sites

Scheduling content has fewer steps for a dynamic site. Since you are calling your Directus API at the time that a
visitor requests a page from your site, all you need to do is add a filter to your query.

### Check the Published Date When Calling the Directus API

- When calling the API, add a filter rule that checks the `date_published` field.
- Use the `_lte` operator to filter for dates that are less than or equal the current date/time.
- You can use the dynamic variable `$NOW` to get the current timestamp.

#### Examples

::callout{icon="material-symbols:info-outline"}

In these examples, we're using an AND logical operator to only return
records that match both conditions. This provides a little more control over your published content by ensuring only
articles that have a publish date AND have the `published` state are displayed on your site.

::

Using the [Directus JavaScript SDK](/guides/connect/sdk) (preferred)

```js
// Initialize the SDK.
import { createDirectus, rest, readItems } from '@directus/sdk';

const directus = createDirectus('https://directus.example.com').with(rest());

const articles = await directus.request(
	readItems('articles', {
		filter: {
			_and: [
				{
					status: {
						_eq: 'published',
					},
				},
				{
					date_published: {
						_lte: '$NOW',
					},
				},
			],
		},
	})
);
```

Using the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) (JavaScript)

```js
const response = await fetch(
	'https://yourdirectusurl.com/items/articles?' +
		new URLSearchParams({
			filter: {
				_and: [
					{
						status: {
							_eq: 'published',
						},
					},
					{
						date_published: {
							_lte: '$NOW',
						},
					},
				],
			},
		})
);

const articles = await response.json();
```

## Final Tips

**Tips**

- If you're not receiving the data you expect, double-check your filter rule syntax.
- Also be sure you have enabled the proper permissions for your content Collection.
