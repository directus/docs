---
id: c95350f1-1ace-488b-b293-77546b6ebe17
slug: importing-files-in-directus-automate
title: Importing Files in Directus Automate
authors:
  - name: Kevin Lewis
    title: Director, Developer Experience
description: Learn how to use the Request URL operation to import files in Directus Automate.
---
In this quick tip, you will learn how to import files inside of Flows as part of Directus Automate.

Directus doesn’t ship with an operation to import files via URL the same way you can across the Data Studio. Thankfully, you can utilize the Directus API inside of Flows to achieve the same result.

## Setting Up the Operation

In an existing Flow, create a **Webhook / Request URL** operation. All of the settings will match the [File Import endpoint](/getting-started/upload-files):

- Method: POST
- URL: `your-directus-project/files/import` , replacing `your-directus-project` your project URL
- Request Body: `{ "url": "file_url" }`

As noted in the API reference, you can also add a `data` object in the request body with any additional file object properties - like `tags`, `description`, or `focal_point`.

## Permissions

If you run a flow with the operation above, it will work if there is a public create permission on the `directus_files` collection. If this isn’t the case, generate a static access token for a user with the correct permission (you may need to create a ‘user’ for this purpose) and add a header:

- Header: `Authorization`
- Value: `Bearer your-token` , replacing `your-token` with the access token.

## Returned Data

As we are using the API directly, this operation returns a full response body. That means the `id` of the new file is available at `{{ step.data.data.id }}`, where `step` is your operation key, or `$last` in the following operation.

## Limitations

The only real limitation to this approach is that you must provide a fixed Directus Project URL - the operation does not allow relative URLs. Your project URL is unlikely to change, but updating any operations using this approach will be required.
