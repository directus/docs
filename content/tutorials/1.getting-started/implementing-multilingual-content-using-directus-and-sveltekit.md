---
slug: implementing-multilingual-content-using-directus-and-sveltekit
title: Implementing Multilingual Content using Directus and SvelteKit
authors:
  - name: Temitope Oyedelde
    title: Guest Author
description: Learn how to access multilingual Directus content using SvelteKit.
---

Directus comes with built-in support for creating multilingual content. In this post, you'll learn how to create multilingual content and access it using your SvelteKit application.

## Before You Start

You will need:

- A Directus project with admin access.
- Fundamental understanding of Svelte concepts.
- Optional but recommended: Familiarity with data modeling in Directus.

## Set Up Your Directus Project

In this tutorial, Docker will be used for the setup. To get started, follow the [Docker setup instructions](https://docs.directus.io/self-hosted/docker-guide.html).

You also need to make sure to configure CORS. Update your `docker-compose.yml` file as follows:

```bash
   CORS_ENABLED: "true"
   CORS_ORIGIN: "http://localhost:5173"
   CORS_CREDENTIALS: "true"
```

### Create a Collection

Create a new collection called posts with the following fields:

- `title` (Type: Input)
- `slug` (Type: Input)
- `content` (Type: Markdown)

### Edit Public Policy

- Navigate to Settings -> Access Policies -> Public
- Under `posts` set a public policy for `read`

## Set Up Your SvelteKit Project

### Initialize Your Project
To start building, you need to install SvelteKit and Directus sdk. Run this command to install SvelteKit:

```bash
npx sv create multilingual-app 
```
When prompted, select SvelteKit minimal as the template. Do not add type checking, as this tutorial is implemented in JavaScript. Your output should look like this:

```bash
 Welcome to the Svelte CLI! (v0.6.16)
│
◇  Which template would you like?
│  SvelteKit minimal
│
◇  Add type checking with Typescript?
│  No
│
◆  Project created
│
◇  What would you like to add to your project? (use arrow keys / space bar)
│  none
│
◇  Which package manager do you want to install dependencies with?
│  npm
│
◆  Successfully installed dependencies
│
◇  Project next steps ─────────────────────────────────────────────────────╮
│                                                                          │
│  1: cd multilingual-app                                                       │
│  2: git init && git add -A && git commit -m "Initial commit" (optional)  │
│  3: npm run dev -- --open
```

Afterward, `cd` into your project directory and install the Directus SDK by running this command:

```bash
npm install @directus/sdk
```

You need to initialize Directus SDK in your project. Create a file called `directus.js` inside the `./src/lib` directory. Add the following code:

```javascript
import { createDirectus, rest } from "@directus/sdk";
const API_URL = "http://localhost:8055";
export const client = createDirectus(API_URL).with(rest());
```

## Set Up Content Translations

To set up content translations, add a field to the `posts` collection of type [Translations](https://directus.io/docs/guides/data-model/relationships). This will create two new collections, `languages` and `posts_translations`.

![posts_translations and languages collections on the data modal](/img/translations.png)

 Open the `posts_translations` collection, and add the fields `title` and `content` with their corresponding types.

 You need to give `Read` permissions to the Public Policy for `posts_translations` collection. Navigate to Settings -> Access Policies -> Public. Add `posts_translations` with `read` permissions.

 Next, create a post content. Navigate to **Content->Posts** to add some content:

 - `title`: "Becoming a productive rabbit"
- `content`:
```md
Rabbits are known for their quickness and agility, but did you know they can also be incredibly productive? Here are a few tips to help you become the most productive rabbit you can be:

Set clear goals. Determine what you want to achieve and make a plan to reach your goals.

Use your natural abilities. Rabbits are quick, so use that speed to your advantage by completing tasks quickly and efficiently.

Stay organized. Keep your burrow neat and tidy so you can quickly find what you need when you need it.

Take breaks. Despite their reputation for being quick, rabbits need breaks too. Take short hops to stretch your legs and rest your mind.

Surround yourself with positive influences. Make friends with other productive rabbits and learn from their habits.

By following these tips, you'll be well on your way to becoming the most productive rabbit you can be. So, get hopping and get things done!
```
- `slug`: "becoming-a-productive-rabbit"

You also need to translate this content into three languages. You can achieve this by using [Google Translate](https://translate.google.com/) or any translation app of your choice. Click on the "Translations" dropdown section and select the language you want to add the translation for. For this tutorial, the languages used will be French, German, and Spanish.

Your post now has three language translations.

![Post collection showing 3 language translations](/img/three_languages.png)

## Set Up Language-Based Dynamic Routing
To set up language-based dynamic routing for this project, create a subdirectory called `components` inside the `./src/lib` directory and create a file called `LanguageSwitcher.svelte`. Add the following code:

```javascript
// src/lib/components/LanguageSwitcher.svelte
<script>
  export let currentLang;
  export let slug;

  const languages = [
    { code: "en-US", label: "English" },
    { code: "es-ES", label: "Español" },
    { code: "fr-FR", label: "Français" },
    { code: "de-DE", label: "Deutsch" },
  ];
</script>

<nav class="language-switcher">
  {#each languages as { code, label }}
    <a href="/{code}/{slug}" class:active={currentLang === code}>
      {label}
    </a>
  {/each}
</nav>

<style>
  .language-switcher {
    display: flex;
    gap: 1rem;
    margin: 1rem 0;
  }
  
  .active {
    font-weight: bold;
    text-decoration: none;
  }
</style>
```
You also need to create a subdirectory called `[lang]` inside the `./src/routes` and then inside it, create another sub directory called `[slug]`.

The `[slug]` directory will contain two files, a `+page.js` and `+page.svelte`. 

Add the following code inside `+page.js`

```javascript
// src/routes/[lang]/[slug]/+page.js
import { client } from "$lib/directus";
import { error } from "@sveltejs/kit";
import { readItems } from "@directus/sdk";

export async function load({ params }) {
  const { lang, slug } = params;

  console.log("Attempting to fetch:", { lang, slug });

  try {
    const result = await client.request(
      readItems("posts", {
        fields: [
          "*",
          {
            translations: ["*", "languages_code"],
          },
        ],
        filter: {
          slug: {
            _eq: slug,
          },
        },
      })
    );

    console.log("Full API Response:", result);

    if (!result?.length) {
      throw error(404, "Post not found");
    }

    const post = result[0];
    console.log("Post translations:", post.translations);

    const translation =
      post.translations?.find((t) => t.languages_code === lang) || null;

    console.log("Found translation:", translation);

    if (!translation && lang === "en-US") {
      return {
        post: {
          ...post,
          currentTranslation: {
            title: post.title,
            content: post.content,
            languages_code: "en-US",
          },
        },
        lang,
      };
    }

    if (!translation) {
      throw error(404, `Translation not found for language: ${lang}`);
    }

    return {
      post: {
        ...post,
        currentTranslation: translation,
      },
      lang,
    };
  } catch (err) {
    console.error("Detailed error:", {
      message: err.message,
      stack: err.stack,
      name: err.name,
      cause: err.cause,
    });
    throw error(500, {
      message: "Failed to fetch post",
      details: err.message,
    });
  }
}
```

Add the following code inside `+page.svelte`:

```javascript
// src/routes/[lang]/[slug]/+page.svelte
<script>
  import LanguageSwitcher from "$lib/components/LanguageSwitcher.svelte";
  export let data;
</script>

<LanguageSwitcher currentLang={data.lang} slug={data.post.slug} />

{#if data.post}
  <article>
    <h1>{data.post.currentTranslation.title}</h1>
    <div>{@html data.post.currentTranslation.content}</div>
  </article>
{:else}
  <p>Post not found</p>
{/if}
```

### Test the Application

To test the project, run this command:

```bash
npm run dev
```

Navigate to `http://localhost:3000/en-Us/becoming-a-productive-rabbit`, which displays the default language to see the content. 
![image showing the default language](/img/english_language.png)

You can also navigate to other languages because of the client-side navigation included.


To test French translation, navigate to `http://localhost:3000/fr-FR/becoming-a-productive-rabbit`

![image showing the french transalation of the content](/img/french_language.png)

To test for Spanish translation, navigate to  
`http://localhost:3000/es-ES/becoming-a-productive-rabbit`

![image showing the Spanish transalation of the content](/img/spanish_language.png)

Finally, to test for German, navigate to `http://localhost:5173/de-DE/becoming-a-productive-rabbit`

![image showing the German transalation of the content](/img/german_language.png)

## Summary

In this post, you learned how to create multilingual content in Directus and access it in a SvelteKit application. You can take this further by adding your own custom features and enhancements. I can’t wait to see what you build. Happy coding!
