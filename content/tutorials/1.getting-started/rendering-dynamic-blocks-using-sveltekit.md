---
slug: rendering-dynamic-blocks-using-sveltekit
title: Rendering Dynamic Blocks Using SvelteKit
authors:
  - name: Temitope Oyedelde
    title: Guest Author
description: Learn how to render dynamic blocks using SvelteKit.
---

[Having used Directus as a Headless CMS to create individual blocks that can be re-used on different pages](https://directus.io/docs/tutorials/getting-started/create-reusable-blocks-with-many-to-any-relationships), let's integrate them into our Svelte website.

## Before You Start

You will need:

- A Directus project with the collections defined in our Create Reusable Blocks with Many-to-Any Relationships tutorial.
- Your public policy should have read permission on the `pages`, x, y collections.
- Fundamental understanding of Svelte concepts.

## Set Permissions
After creating reusable blocks with Many-to-Any relationships from the tutorual, you need to make the created collections readable by the public. To do this go to Settings -> Access Policies -> Public and add read permissions to all the collections created in the previous tutorial.

![Directus Public Access Policy](/img/public_policy.png)

## Configure Cors

You also need to make sure to configure CORS. Update your docker-compose.yml file as follows:

```bash
CORS_ENABLED: "true"
CORS_ORIGIN: "http://localhost:5173"
CORS_CREDENTIALS: "true"
```

## Set Up Your SvelteKit Project

### Initialize Your Project
To start building, you need to install SvelteKit and Directus sdk. Run this command to install SvelteKit:

```bash
npx sv create dynamic_blocks 
```
When prompted, select SvelteKit minimal as the template. Do not add type-checking, as this tutorial is implemented in JavaScript. Your output should look like this:

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
│  1: cd dynamic_blocks                                                       │
│  2: git init && git add -A && git commit -m "Initial commit" (optional)  │
│  3: npm run dev -- --open
```

Afterward, `cd` into your project directory and install the Directus SDK by running this command:

```bash
npm install @directus/sdk
```

You need to initialize Directus SDK in your project. Create a file called `directus.js` inside the `./src/lib` directory. Add the following code:

```javascript
// src/lib/directus.js
import { createDirectus, rest } from '@directus/sdk';

const directus = createDirectus('http://localhost:8055/').with(rest());

export default directus;
```

### Create Frontend Components

Going by the structure of our reusable blocks, let's create a single component for each individual collection.

### Hero Component
Create a `./src/lib/components/Hero.svelte` file. Add the following code:

```javascript
<!--src/lib/components/Hero.svelte-->
<script>
  export let data;
</script>

<section class="hero">
  <div class="text">
      <h1>{data.headline}</h1>
      <p>{@html data.content.replace(/<\/?p>/g, '')}</p>
      <div class="buttons">
          {#each data.buttons as button}
              <a href={button.href} class="btn {button.variant}">{button.label}</a>
          {/each}
      </div>
  </div>
</section>

<style>
  .hero {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 2rem;
      background: #f5f5f5;
  }
  .text {
      max-width: 50%;
  }
  .buttons a {
      margin-right: 10px;
      padding: 10px 20px;
      border-radius: 5px;
      text-decoration: none;
  }
  .primary {
      background: blue;
      color: white;
  }
</style>
```

The code above is a hero section that dynamically displays a headline, content, buttons, and an optional image based on the data prop it receives.

### Rich Text Component
Create a `src/lib/components/RichText.svelte` file. Add the following code:

```javascript
<!--src/lib/components/RichText.svelte-->
<script>
  export let data;
</script>

<section class="rich-text">
  <h2>{data.headline}</h2>
  <div class="content">{@html data.content.replace(/<\/?p>/g, '')}</div>
</section>

<style>
  .rich-text {
      padding: 2rem;
      background: white;
  }
  .content {
      font-size: 1rem;
      line-height: 1.5;
  }
</style>
```

### Card Group Component
Create a `src/lib/components/CardGroup.svelte` file. Add the following code:

```javascript
<!--- src/lib/components/CardGroup.svelte-->
<script>
  export let data;
</script>

<section class="card-group">
  <h2>{data.headline}</h2>
  <p>{@html data.content.replace(/<\/?p>/g, '')}</p>
  <div class="cards">
      {#each data.cards as card}
          <div class="card">
              <p>{card.content}</p>
          </div>
      {/each}
  </div>
</section>

<style>
  .card-group {
      padding: 2rem;
  }
  .cards {
      display: flex;
      gap: 1rem;
  }
  .card {
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 5px;
  }
</style>
```

### Page Component
Create a `fetchPage.js` file inside the `./src/lib` directory to use the Directus client to fetch pages. Add the foloowing code:

```javascript
// src/lib/fetchPage.js
import directus from './directus';
import { readItems } from '@directus/sdk';

export async function fetchPage(slug) {
    try {
        const response = await directus.request(
            readItems('pages', {
                filter: { slug: { _eq: slug } },
                fields: [
                    '*',
                    {
                        blocks: [
                            '*',
                            {
                                item: ['*'] 
                            }
                        ]
                    }
                ],
                limit: 1
            })
        );

        if (!response || response.length === 0) {
            console.warn(`No page found for slug: ${slug}`);
            return null;
        }

        let pageData = response[0];

        pageData.blocks = Array.isArray(pageData.blocks) ? pageData.blocks : [];

        console.log("Fetched page data:", pageData);
        console.log("Blocks Data:", pageData.blocks);

        return pageData;
    } catch (error) {
        console.error("Error fetching page:", error);
        return null;
    }
}
```
The code above fetches a page from Directus by looking up its slug, retrieves its content and blocks, ensures valid data formatting, and handles errors gracefully.
### Dynamically Fetch Page Data

You need a dynamic route to help import your page builder components, call your `pages` collection via the API, and add a filter rule to match the requested page’s `slug. ' 

Create a `src/routes/[slug]/+page.svelte` file. Add the following code:

```javascript
<!--src/routes/[slug]/+page.svelte--> 
<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { fetchPage } from '$lib/fetchPage'
    import PageBuilder from '$lib/pageBuilder.svelte';
    import { get } from 'svelte/store';

    let pageData = null;

    async function loadPage() {
        const slug = get(page).params.slug; 
        pageData = await fetchPage(slug);
    }

    onMount(loadPage);
</script>

{#if pageData}
    <PageBuilder blocks={pageData.blocks} />
{:else}
    <p>Loading...</p>
{/if}
```

### Map Blocks to Components

Create a `src/lib/pageBuilder.svelte` file. Add the following code:

```javascript
 <!--- src/lib/pageBuilder.svelte-->
<script>
    import Hero from '$lib/components/Hero.svelte';
    import RichText from '$lib/components/RichText.svelte';
    import CardGroup from '$lib/components/CardGroup.svelte';

    export let blocks = [];

    const blockMap = {
        block_hero: Hero,
        block_richtext: RichText,
        block_cardgroup: CardGroup
    };
</script>
{#if Array.isArray(blocks) && blocks.length > 0}
    {#each blocks as block (block.id)}
        {#if block?.collection && blockMap[block.collection]}
            <svelte:component 
                this={blockMap[block.collection]} 
                data={(typeof block.item === 'object') ? block.item : {}} />
        {:else}
            <p>Unknown block type: <strong>{block.collection}</strong></p>
        {/if}
    {/each}
{:else}
    <p>No blocks found.</p>
{/if}
```

The code above maps all the possible `page.pages_blocks.collection` names to your page block components.

It also loops through the `page.blocks` array and passes the correct data (props) that each page_builder component needs to render properly.

## Test the Application

To test the project, run this command:

```bash
npm run dev
```

In Directus, create a page and add some blocks to it.
![populating the pages with some blocks](/img/blocks.png)

Visit `http://your-wesite-url/your-slug` to see the result. For this example, it's going to be `localhost:5173/rabbit`. 

![result displaying the block content](/img/result.png)

## Summary
In this post, you learned how to create a page builder in Directus and use it to display dynamic components in a Svelte application.

Dynamic blocks enhance user experience. It can be used in various sections of your website, and Directus makes it easy to implement. 
