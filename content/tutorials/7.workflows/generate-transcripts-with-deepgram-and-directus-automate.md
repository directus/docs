---
id: 89cd5e8e-cabd-4422-92c8-9736faedefe0
slug: generate-transcripts-with-deepgram-and-directus-automate
title: Generate Transcripts with Deepgram and Directus Automate
authors:
  - name: Kevin Lewis
    title: Director, Developer Experience
description: Learn how to integrate Deepgram's Speech-to-Text API with Directus Automate.
---
Voice is one of the most common ways we communicate and yet one of the hardest for developers to use and understand. In this post, you'll use Deepgram's speech recognition API and Directus Automate to create and store transcripts whenever a new file is uploaded.

## Before You Start

You will need a Directus project - check out [our quickstart guide](/getting-started/overview) if you don't already have one and generate an API Token that allows access to the location where your audio files will be uploaded. You will also need a [Deepgram account](https://console.deepgram.com/) and API Key with "Member" privileges. You should also have a MP3 file to test with - [here's one you can download and use](/img/aaedf2bb-bb9a-41b8-9b47-f68f4293e813.mp3).

## Set Up Trigger

Create a new Flow from your Directus project settings - call it "Transcribe New Audio Files". Create an **Event Hook** trigger that is Non-Blocking - this means the flow will run asynchronously and not delay data being entered in the database. Finally, set the Scope to `files.upload`.

## Check File Is Audio

Add a **Condition** operation with the following rule:

```json
{
    "$trigger": {
        "payload": {
            "type": {
                "_contains": "audio"
            }
        }
    }
}
```

If a file is not audio, the Flow will end without any further steps being taken. Further steps in this post should be added from the resolved path of the condition.

## Generate Transcript with Deepgram

Create a **Webhook / Request URL** operation and set the key to `deepgram`. Set the Method to POST and the URL to [https://api.deepgram.com/v1/listen?smart_format=true&diarize=true](https://api.deepgram.com/v1/listen?model=nova&smart_format=true&diarize=true). Smart format adds formatting to the transcript to make it more human-readable. Diarize will add speaker labels, so you can tell what was said by different people.

Add a `Authorization` header with the value `Token YOUR_KEY`, replacing `YOUR_KEY` with your Deepgram API Key.

Finally, in the Request Body, provide a link to the file that triggered the Flow:

```json
{
  "url":"YOUR_DIRECTUS_URL/assets/{{$trigger.key}}?access_token=TOKEN"
}
```

Replace `YOUR_DIRECTUS_URL` with the URL for your Directus project, and `TOKEN` with your Directus static token.

## Save Transcript to File Description

From the resolved path of the previous operation, create an **Update Data** operation. Set the Collection to `directus_files` with Full Access permissions.

:::info Set a System Collection

The dropdown in the collection field will only show user-created collections. To add `directus_files`, which is a system collection, click the `{}` button to turn the input to raw mode and type the collection name manually.

:::

Add one item to the IDs tags - `{{$trigger.key}}` - which represents the ID of the file that was uploaded and triggered the Flow to run.

Deepgram provides a huge nested object in response to requests. To set the file description to the formatted transcript provided by Deepgram, set payload to the following:

```json
{
    "description": "{{deepgram.data.results.channels[0].alternatives[0].paragraphs.transcript}}"
}
```

Save your flow and test it by uploading an audio file. Wait a few seconds and check out the file editor and observe the description:

![The uploaded audio file has a transcript in its description textbox. The first paragraph starts 'Speaker 0', and the second starts 'Speaker 1'.](https://marketing.directus.app/assets/dab26ce7-f20c-45c8-8d86-95388a0vi(c4981c)

The final flow should look like this:

![A flow with an event hook trigger and three operations: a condition, a request URL with a Deepgram URL, and update data.](/img/33853971-09b7-45b3-a59a-638151c65dba.webp)

## Summary & Next Steps

Now you have transcripts for audio files in Directus, you can begin to run queries against the words spoken. Deepgram also provides us with the tools to build more accessible applications.

Check out the [Deepgram documentation](https://developers.deepgram.com/docs) for an overview of all features you can use when making requests, including some that use machine learning to provide insights about topics and entities mentioned in the audio file.

If you have any questions, feel free to drop into our [very active developer community Discord server](https://directus.chat).
