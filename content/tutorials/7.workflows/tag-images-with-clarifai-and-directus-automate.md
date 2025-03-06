---
id: 73b10a4d-0da8-48c7-9753-4a3addd2c5ff
slug: tag-images-with-clarifai-and-directus-automate
title: Tag Images with Clarifai and Directus Automate
authors:
  - name: Kevin Lewis
    title: Director, Developer Experience
description: Learn how to integrate Clarifai's image recognition APIs with Directus Automate.
---
[Clarifai](https://clarifai.com) allow you to train and use machine learning models via APIs. In this tutorial, you will use Clarfai's image recognition model with Directus Automate to automatically tag new image files in your project.

## Before You Start

You will need a [Directus project](/getting-started/overview) and a Clarifai API Key.

## Create a Flow

Flows are Directus' no-code automation builder provided as part of Directus Automate. Create a new flow with a non-blocking event hook and the `files.upload` scope. This means that it will run asynchronously and not block the file upload.

Whenever a few file is uploaded, the flow will be triggered. The payload will include a file type and ID - both will be used in future steps.

## Limit File Type

We are using an image recognition model, but the flow will trigger on ever file upload regardless of type. Create a new **Condition** operation called `Is Image` with the following condition:

```json
{
	"$trigger": {
    	"payload": {
        	"type": {
            	"_contains": "image"
            }
        }
    }
}
```

The resolve path of this condition will only be followed when the image is an image. The file type will be something like `image/jpeg` of `image/png`, so we are just checking for the presence of `image` in the value.

## Recognize Image

Create a new **Webhook / Request URL** operation called `Clarifai`. Make a POST request to `https://api.clarifai.com/v2/users/clarifai/apps/main/models/general-image-recognition/versions/aa7f35c01e0642fda5cf400f543e7c40/outputs`, which is a pre-trained model provided by Clarifai.

Create a `Authorization` header with the value of `key YOUR-CLARIFAI-API-KEY`, being sure to provide your specific key from the Clarifai dashboard. The request body should look like this:

```json
{
	"inputs": [
    	{
        	"data": {
            	"image": {
                	"url": "YOUR-DIRECTUS-PROJECT-URL/assets/{{$trigger.key}}"
                }
            }
        }
    ]
}
```

This is the direct URL to the newly-uploaded file that triggered this flow to run. If your file is not accessible publicly, append the URL with `?access_token=TOKEN`, replacing `TOKEN` with a static token from a Directus user who has permission to access the file.

When it runs, this operation will return data from Clarifai including a list of concepts. Each concept has a confidence score between 0 and 1.

## Extract Tags

When updating the image, tags are required as an array of strings. To do this, create a new **Run Script** operation called `Concepts`:

```js
module.exports = async function(data) {
	return data.clarifai.data.outputs[0].data.concepts
    			.filter(concept => concept.value > 0.95)
                .map(concept => concept.name)
}
```

This script will return only concepts with a confidence greater than 0.95 (you can tweak this), and extracts just the concept names into an array of strings.

## Save Tags

Create an **Update Data** operation called `Save Tags`. The collection should be set to `directus_files` (you may have to hit the Raw Value button and type this in), with Full Access permissions.  Set the IDs to `{{$trigger.key}}` and set the payload to the following:

```json
{
	"tags": "{{concepts}}"
}
```

## Summary

This example shows you how to leverage Clarifai's image recognition model and Directus Flows to
automatically tags new image uploads. You can do a lot more with this data, building on top of it once it's saved.
