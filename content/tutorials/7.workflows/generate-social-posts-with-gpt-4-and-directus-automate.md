---
id: 3b8646a5-cdfa-4841-bc43-1aa337b6e4f7
slug: generate-social-posts-with-gpt-4-and-directus-automate
title: Generate Social Posts with GPT-4 and Directus Automate
authors:
  - name: Kevin Lewis
    title: Director, Developer Experience
description: Learn how to integrate OpenAI's GPT-4 model with Directus Automate.
---
Directus Automate provide a really powerful interface to integrating with AI services via their APIs. In this tutorial, we will use [OpenAI’s Text Generation API](https://platform.openai.com/docs/api-reference/chat/create) to leverage GPT-4 and create social posts for our content directly within the Directus Editor.

## Before We Start

You will need a [Directus project](/getting-started/overview) and an OpenAI API Key from your account dashboard.

In your Directus project, create a new collection called `posts` with the following fields:
- `title`: input, string
- `content`: WYSIWYG, text
- `social_output`: textarea, text

## Create Flow Trigger & Read Data

In the Settings Module, go to the Flows section and create a new Flow called “Generate Social Post”. Use a Manual Flow Trigger and select the Posts collection.

The trigger will only return the `ID` of the article, but the whole post is needed to send to OpenAI. Create a **Read Data** operation called "Article" and give it full access permissions. On the Articles collection, access the `{{$trigger.body.keys[0]}}` item.

## Generate Social Post

Create a new Web Request operation called “Generate”. It should be a POST request to `https://api.openai.com/v1/chat/completions` .

Add a header - `Authorization` with the a value of `Bearer OPEN_AI_API_KEY` , being sure to replace the capitalized placeholder with your OpenAI API Key.

Add the following request body:

```json
{
	"model": "gpt-4",
    "messages": [
    	{
        	"role": "system",
            "content": "You are the social media manager of a blog who takes recipe articles and writes compelling promotional posts for social media based on the copy I provide. The audience is busy professionals who have little time."
        },
        {
        	"role": "user",
            "content": "Write a Twitter post for our {{article.title}} recipe."
        }
    ]
}
```

The first message is priming the system - in the example above I assume this is a food blog for busy professionals. Of course, you will need to customize this to your needs.

The second message is the actual prompt - write a post for Twitter. The only dynamic data we are passing is the title, but you can also pass the whole article. Be aware, though, that the requests will cost more OpenAI credit the longer they are.

## Save Social Post

Running the flow will generate a new social post, and now it must be saved in the item. Create an **Update Data** operation and give it full access permissions. On the Articles collection, access the `{{$trigger.body.keys[0]}}` item.

Add the following Payload:

 ```
 {
 	"social": "{{generate.data.choices[0].message.content}}"
 }
 ```

This will save the specific returned message output from the OpenAI request back to the collection.

Test it out - on one of your posts, click the button. After a few seconds, the Social Output field will be populated. If you want it to regenerate a response, simply run it again.

You can apply this logic to any existing collection, or use other OpenAI APIs to generate images of for your posts.
