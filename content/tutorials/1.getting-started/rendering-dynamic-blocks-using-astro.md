---
slug: rendering-dynamic-blocks-using-astro
title: Rendering Dynamic Blocks Using Astro
authors:
  - name: Carmen Huidobro
    title: Developer Educator
description: Learn how to render dynamic blocks using Astro.
---

[Having used Directus as a Headless CMS to create individual blocks that can be re-used on different pages](https://directus.io/docs/tutorials/getting-started/create-reusable-blocks-with-many-to-any-relationships), let's integrate them into our Astro website.

## Before You Start

You will need:

- A Directus project with the collections defined in our Create Reusable Blocks with Many-to-Any Relationships tutorial.
- Your public policy should have read permission on the reuseable blocks collections.
- Fundamental understanding of Astro concepts.

## Edit Public Policy

To grant public [access](https://directus.io/docs/guides/auth/access-control) to your blocks collections in Directus,navigate to Settings -> Access Policies -> Public Policy From there, enable the `Read` permission for the blocks collections to ensure they are accessible as needed.

![Public Policy](/img/astro-public-policy.png)

## Set Up Your Astro Project

### Initialize Your Project

Create a new Astro project by running the command:

```bash
npx create-astro@latest astro-dynamic-blocks
```

When prompted, select the following configurations:

```bash
How would you like to start your new project? A basic, minimal starter (recommended)
Install dependencies? (recommended) Yes
Initialize a new git repository? (optional) No
```

Navigate into the project directory and install the Directus SDK by running the command:

```bash
npm install @directus/sdk
```

Next, run the command `npm run dev` to start the development server and you should see the Astro project running on `http://localhost:4321/` in your browser.

### Configure the Directus SDK

First, create a `.env` file in the root of your project and add the following environment variables:

```bash
DIRECTUS_URL=https://your-directus-project-url.com
```

In the `src` directory, create a `lib` directory and inside of it, create a `directus.ts` file to set up your Directus client instance and fetch the page blocks.:

```ts
/// <reference types="vite/client" />
import { createDirectus, rest, readItems } from "@directus/sdk";

const DIRECTUS_URL = import.meta.env.DIRECTUS_URL;

const client = createDirectus(DIRECTUS_URL).with(rest());

export async function fetchPageBlocks(slug: string) {
  console.log(slug);
  const pages = await client.request(
    readItems("pages", {
      filter: {
        slug: { _eq: slug },
      },
      fields: [
        "*",
        {
          blocks: [
            "*",
            {
              item: {
                block_hero: ["*"],
                block_cardgroup: [
                  "*",
                  {
                    posts: [
                      "*.*", // Fetch all fields from related posts
                    ],
                    cards: [
                      "*.*", // Fetch all fields from related cards
                    ],
                  },
                ],
                block_richtext: ["*"],
              },
            },
          ],
        },
      ],
      limit: 1,
    })
  );
  return pages[0] || []; // Return blocks array or empty if not found
}
export default client;

```

The code above:

- Imports the Directus SDK and sets up the Directus client instance.
- Creates a `fetchPageBlocks` function that fetches all the related blocks for a specific page based on the slug passed as an argument.

Now that the Directus SDK is set up, create the components that will render each of the blocks coming from Directus.

### Create Frontend Components

Going by the structure of our reusable blocks, let's create a single component for each individual collection in the `components` directory.

### Hero Component

Create a `Hero.astro` file in the `components` directory and add the following code:

```astro
---
import { Image } from 'astro:assets';

interface Button {
  label: string;
  href: string;
  variant: string;
}

const { 
  headline = '', 
  content = '', 
  buttons = [], 
  image = '' 
} = Astro.props.item as {
  headline?: string;
  content?: string;
  buttons?: Button[];
  image?: string;
};

const DIRECTUS_URL = import.meta.env.DIRECTUS_URL;
---

<section>
  {headline && <h1>{headline}</h1>}
  {content && <div set:html={content} />}
  
  {buttons.length > 0 && (
    <div>
      {buttons.map(({ label, href, variant }) => (
        <a href={href || '#'} class={variant || ''}>
          {label || 'Click here'}
        </a>
      ))}
    </div>
  )}
  
  {image && DIRECTUS_URL && (
    <img src={`${DIRECTUS_URL}/assets/${image}?width=500`} alt={headline || 'Image'} />
  )}
</section>
```

### Rich Text Component

Create a `RichText.astro` file in the `components` directory and add the following code:

```astro
---
const { headline = '', content = '' } = Astro.props.item || {};
---

<section>
  {headline && <h1>{headline}</h1>}
  {content && <p set:html={content} />}
</section>
```

### Card Group Component

Create a `CardGroup.astro` file in the `components` directory and add the following code:

```astro
---
const {
  headline = '',
  content = '',
  posts = [],
  cards = [],
  group_type = 'custom'
} = Astro.props.item || {};

const DIRECTUS_URL = import.meta.env.DIRECTUS_URL;
---

<section>
  {headline && <h2>{headline}</h2>}

  {content && <div set:html={content}></div>}

  <div>
    {group_type === "posts" && posts.length > 0 && (
      <div style="display: flex;">
        {posts.map(({ posts_id }) => (
          posts_id && (
            <div style="width: 400px; margin: 0 10px;">
              {posts_id.title && <h3>{posts_id.title}</h3>}
              {posts_id.image && (
                <img src={`${DIRECTUS_URL}/assets/${posts_id.image}?width=300`} alt={posts_id.title || 'Post Image'} />
              )}
              {posts_id.content && <div set:html={posts_id.content}></div>}
            </div>
          )
        ))}
      </div>
    )}

    {group_type === "custom" && cards.length > 0 && (
      <div style="display: flex;">
        {cards.map(({ title, content }) => (
          <div>
            {title && <h3>{title}</h3>}
            {content && <p>{content}</p>}
          </div>
        ))}
      </div>
    )}
     {group_type === "posts" && posts.length > 0 && (
      <div style="display: flex;">
        {posts.map(({ title, content }) => (
          <div>
            {title && <h3>{title}</h3>}
            {content && <p>{content}</p>}
          </div>
        ))}
      </div>
    )}
  </div>
</section>
```

### Blocks to Components Mapping

With all the components created, let's create one more component that will map each blocks to their component to render it correctly, e.g `block_hero` should render the `Hero` component.

In the `components` directory, create a `BlocksToComponents.astro` file and add the following code:

```astro
---
import Hero from "./Hero.astro";
import RichText from "./RichText.astro";
import CardGroup from "./CardGroup.astro";

const { blocks } = Astro.props
---

{blocks.map((block: any) => {
  const View = (
    block.collection === 'block_hero' ? Hero :
    block.collection === 'block_richtext' ? RichText :
    block.collection === 'block_cardgroup' ? CardGroup : () => null
  )
  return View && <View {...block} />
})}
```

This component loops through the `blocks` array and maps each block to its corresponding component along with the props it needs to render.

### Dynamically Fetch Page Data

In the `pages` directory, create a `[slug].astro` file and add the following code:

```astro
---
import Layout from "../layouts/Layout.astro";
import { fetchPageBlocks } from "../lib/directus";
import client from "../lib/directus";
import { readItems } from "@directus/sdk";
import BlocksToComponents from "../components/BlocksToComponents.astro";


export async function getStaticPaths() {
  // Fetch all available pages
  const pages = await client.request(readItems("pages", { fields: ["slug"] }));

  return pages.map((page) => ({
    params: { slug: page.slug },
  }));
}
const { slug } = Astro.params;
//fetch blocks for the page
const page = await fetchPageBlocks(slug);

const { blocks } =  page
---

<Layout>

  <BlocksToComponents blocks={blocks} />
</Layout>
```

The code above:

- Fetches all the available pages by their `slug` using the `getStaticPaths` method and returns the `slug` property as a params to Astro.
- Fetches the blocks for the current page based on the `slug`.
- Passes the blocks to the `BlocksToComponents` component to render the blocks.

This ensures that the blocks are rendered dynamically based on the page they are associated with and the components they are mapped to.

Head over to your browser and navigate to `http://localhost:4321/your-page-slug` to see the blocks rendered on the page.

![Dynamic Blocks](/img/astro-dynamic-blocks.png)

### Summary

In this tutorial, you learned how to integrate Directus blocks into an Astro project. You set up the Directus SDK to fetch the blocks for a specific page and created components to render each block. You also created a component to map each block to its corresponding component and dynamically fetched the page data to render the blocks on the page.
