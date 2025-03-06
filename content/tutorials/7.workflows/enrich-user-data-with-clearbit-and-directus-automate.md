---
id: 571e0f54-f95d-4ccf-8712-8b92150b364f
slug: enrich-user-data-with-clearbit-and-directus-automate
title: Enrich User Data with Clearbit and Directus Automate
authors:
  - name: Kevin Lewis
    title: Director, Developer Experience
description: Learn how to integrate Clearbit data enrichment with Directus Automate.
---
The Directus toolkit can be used for so many different projects and use cases, with a common one being Customer Relationship Management (CRM). CRMs are often used to support sales and marketing teams in understanding who is interested in and already using a product, and have more streamlined conversations with them.

When a new user is created in Directus, directly through the Data Studio or through [Directus Auth](https://directus.io/toolkit/auth), you may only collect a small amount of information about them. Historically, you may have to then do manual research to understand who a person is before messaging them.

[Clearbit has a series of Enrichment APIs](https://clearbit.com/platform/enrichment) that will take in the data you have, look at a load of data points from around the web, and provide a more complete payload about that person in response.

In this quick project, you will set up a new Flow with [Directus Automate](https://directus.io/toolkit/automate) that will automatically enrich any new users in your Directus project.

## Before You Start

You will need a Directus project - check out [our quickstart guide](/getting-started/overview) if you don't already have one. You will also need a [Clearbit account](https://dashboard.clearbit.com/signup) and API Key.

The `directus_users` collection has some profile fields by default - including `email`, `description`, and `location`. As a demonstration of being able to add additional data provided by Clearbit, go into your Data Model settings, and open the `directus_users` system collection. Add a string input field called `phone`.

## Set Up Trigger

Create a new Flow from your Directus project settings - call it "Enrich New Users". Create an **Event Hook** trigger that is Non-Blocking - this means the flow will run asynchronously and not delay data being entered in the database. Set the Scope to `items.create` and check `Directus Users` in the Collections settings.

## Enrich User Data

Create a **Webhook / Request URL** operation and set the key to `clearbit`. Set the Method to GET and the URL to `https://person.clearbit.com/v1/people/email/{{$trigger.payload.email}}`. This will assume that all users will have an email address at the time of creation.

Add a `Authorization` header with the value `Bearer YOUR_KEY`, replacing `YOUR_KEY` with your Clearbit API Key.

## Save Enriched Data

From the resolved path of the previous operation, create an **Update Data** operation. Set the Collection to `directus_users` with Full Access permissions.

:::info Set a System Collection

The dropdown in the collection field will only show user-created collections. To add `directus_users`, which is a system collection, click the `{}` button to turn the input to raw mode and type the collection name manually.

:::

Add one item to the IDs tags - `{{$trigger.key}}` - which represents the ID of the new user that was created and triggered the Flow to run.

Clearbit provides a huge amount of data in the returned payload. To update fields, set the Payload to the following:

```json
{
    "location": "{{ clearbit.data.location }}",
    "description": "{{ clearbit.data.bio }}",
    "phone": "{{ clearbit.data.phone }}",
    "title": "{{ clearbit.data.employment.title }}, {{ clearbit.data.employment.name }}"
}
```

Save your flow and test it by creating a user with just an email address. Wait a few seconds and check out the User Module and observe the updated fields:

![A user profile for Ben Haynes showing a Location and Title. The Description is empty with an annotation that reads 'Empty as returned value was null'.](/img/3bcdf77e-b0c0-432d-b687-638b273ff403.webp)

The final flow should look like this:

![A flow with an event hook trigger and two operations - a request URL with a Clearbit URL, and update data. ](/img/9c4ba132-e9b2-4f72-a034-f5e963bd2461.webp)

## Summary and Improvements

Now you have enriched user profiles, you can begin to run queries against the additional fields.

There are some points to further improve on as you build your Flows for data enrichment:

1. Clearbit does not guarantee any fields will return a value (Ben's bio was `null`, for example). You should add some conditional logic to ensure you don't overwrite fields that may already exist.
2. Every new Clearbit enrichment counts against API limits and eventually will be chargeable once the free allowance is depleted. You could use a manual Flow trigger to enrich data for specific users on-demand, rather than by default.
3. You could use the Combined Enrichment API to also lookup a person's associated company, create or update company records in a separate collection, and add a relationship between the user and the company.

Take a look at the [Clearbit API Reference](https://dashboard.clearbit.com/docs) for more ideas on how you can expand on this starting point.

If you have any questions, feel free to drop into our [very active developer community Discord server](https://directus.chat).
