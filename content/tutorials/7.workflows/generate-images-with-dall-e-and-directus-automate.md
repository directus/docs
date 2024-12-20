---
id: 9feb1c8f-0500-4bff-9b2f-d69e08d316e7
slug: generate-images-with-dall-e-and-directus-automate
title: Generate Images with DALL•E and Directus Automate
authors:
  - name: Kevin Lewis
    title: Director, Developer Experience
description: Learn how to integrate OpenAI's Dall•E models with Directus Automate.
---
Directus Automate provide a really powerful interface to integrating with AI services via their APIs. In this tutorial, we will use [OpenAI’s Image Generation API](https://platform.openai.com/docs/api-reference/images/create) to leverage DALL-E 3 and create images for our content directly within the Directus Editor.

## Before We Start

Ensure you have a Directus project running with the ability to add extensions. You will also need an OpenAI API Key from your account dashboard.

Install [this community extension](https://github.com/samechikson/directus-extension-file-import-operation) to allow file imports via URL.

In your Directus project, create a new collection called `generations` and add a single image field to it called `image` . You can alternatively add an image field to any existing collection.

## Create Flow Trigger

In the Settings Module, go to the Flows section and create a new Flow called “Generate Image”. Use a Manual Flow Trigger and select the Generations collection. In the Location dropdown, select Item Page Only. Finally, select Require Confirmation.

[Confirmation Dialogs](/guides/automate/triggers) are shown in a modal before a flow is triggered, and any data entered is made available to the flow.

In the dialog, configure one field with the key of `prompt` , name of “Prompt”, a Type of String, and an Interface of Input.

## Generate Image

Create a new Web Request operation called “Generate”. It should be a POST request to `https://api.openai.com/v1/images/generations` .

Add a header - `Authorization` with the a value of `Bearer OPEN_AI_API_KEY` , being sure to replace the capitalized placeholder with your OpenAI API Key.

Add the following request body:

```json
{
	"model": "dall-e-3",
	"n": 1,
	"size": "1792x1024",
	"prompt": "{{$trigger.body.prompt}}"
}
```

This image generation request will use the DALL-E 3 model and generate a single image at a time. The `size` must be one [provided by OpenAI](https://platform.openai.com/docs/api-reference/images/create#images-create-size), and the value of `prompt`  is going to come directly from the confirmation dialog we set up previously.

Your operation should look like this:

![Operation options as detailed in the post](/img/7778b5e8-c3ee-4883-8e83-f75623c8a4b6.webp)

Test it out - save your flow and create a single empty item in the Generations collection. Enter the Editor page, and you should see Flows in the sidebar on the right - click the button and enter a prompt such as “Lego Kit of the Directus Logo Rabbit.”

It should take a few seconds while the image is being generated. Once the spinner has stopped, head back to your flow, look at the logs in the sidebar, and observe the response from the Generate step we just made. Within it is a re-written image prompt and a full URL of the generated image.

## Save Generated Image

Add a new File Import operation, provided by the extension mentioned at the start of this post. The Import URL is `{{generate.data.data[0].url}}` . Save the operation, which will return the ID of the newly-imported image once complete.

Create one final step — an Update Data operation — on the Generations collection with an ID of `{{$trigger.body.keys[0]}}` (be sure to hit enter to save the ID). Set the payload to the following:

```json
{
    "image": "{{$last}}"
}
```

The full Flow should look like this:

![Flow with a manual trigger and three operations - generate image, import image, and update data](/img/839d9500-a1b6-4cb9-9928-832c1340c5b0.webp)

Test the Flow again inside of your Generations collection item, and you should see an image appear below. If you don’t like it, re-run the flow and the image will be replaced.

![Prompt reads A bunny rabbit playing in a green field](/img/b0fbb3cb-6130-4e89-99dc-240481dc7913.webp)

![A rabbit is shown in the image field of the item](/img/922b9c87-dba3-4fc4-bc11-6b1f1b59cd30.webp)

You can apply this logic to any existing collection, or use other OpenAI APIs to generate summaries of posts. If you don't like what is made, you can re-run the flow and the image will be replaced.
