---
id: 970eaaf3-d033-43d6-800e-c168e28c6d8f
slug: fetch-data-from-directus-with-astro
title: Fetch Data from Directus with Astro
authors:
  - name: Trust Jamin
    title: Guest Author
description: Learn how to integrate Directus in your Astro web application.
---
[Astro](https://astro.build/) is a web framework used for building content-heavy websites. In this tutorial, you will learn how to build a website using Directus as a headless CMS. You will store, retrieve, and use global metadata such as the site title, create new pages dynamically based on Directus items, and build a blog.

## Before You Start

You will need:

- To install [Node.js](https://nodejs.org/en/) and a code editor on your computer.
- A Directus project - you can use [Directus Cloud](https://directus.cloud/) or [run it yourself](/getting-started/overview).
- Some knowledge of TypeScript and Astro framework

## Initializing Astro

Open your terminal to run the following command to create a new Astro project:

```bash
npm create astro@latest
```

During installation, when prompted, choose the following configurations:

```bash
Where should we create your new project? ./astro-directus
How would you like to start your new project? Include sample files
Install dependencies? Yes
Do you plan to write TypeScript? Yes
How strict should TypeScript be? Strict
```

Once completed, navigate into the new directory and delete all the contents in the `pages/index.astro` file so you can build the project from scratch and install the Directus JavaScript SDK:

```bash
cd astro-directus
npm i @directus/sdk
```

Open the `astro-directus` directory in a text editor of your choice and run `npm run dev` in the terminal to start the development server at `http://localhost:4321`.

## Creating a Helper for the SDK

To create an instance of the Directus SDK that multiple pages in the project will use, create a new directory called `lib` and a new file called `directus.ts` inside of it with the following content:

```ts
import { createDirectus, rest, } from '@directus/sdk';

type Global = {
  title: string;
  description: string;
}

type Author = {
  name: string
}

type Page = {
  title: string;
  content: string;
  slug: string;
}

type Post = {
  image: string;
  title: string;
  author: Author;
  content: string;
  published_date: string
  slug: string;
}

type Schema = {
  posts: Post[];
  global: Global;
  pages: Page[];
}

const directus = createDirectus<Schema>('YOUR_DIRECTUS_URL').with(rest());

export default directus;
```

Ensure your Directus URL is correct when initializing the Directus JavaScript SDK. Also note that the type definitions match the structure of the data that will be fetched from your Directus project.

## Using Global Metadata and Settings

In your Directus project, navigate to Settings -> Data Model and create a new collection called `global`. Under the Singleton option, select 'Treat as a single object', as this collection will have just a single entry containing global website metadata.

Create two text input fields - one with the key of `title` and one `description`.

Navigate to the content module and enter the global collection. Collections will generally display a list of items, but as a singleton, it will launch directly into the one-item form. Enter information in the title and description field and hit save.

![A form named Global has two inputs - a title and a description, each filled with some text.](/img/d8c92df8-63c3-404e-8e0f-b086d27d960a.webp)

By default, new collections are not accessible to the public. Navigate to Settings -> Access Policies -> Public and give Read access to the Global collection.

 In your `pages/index.astro` file, add the following to fetch the data from Directus and display it:

```ts
---
import Layout from "../layouts/Layout.astro";
import directus from "../lib/directus";
import { readSingleton } from "@directus/sdk";

const global = await directus.request(readSingleton("global"));
---

<Layout title={global.title}>
  <main>
    <div>
      <h1>{global.title}</h1>
      <p>{global.description}</p>
    </div>
  </main>
</Layout>
```

Refresh your browser. You should see the data from your Directus Global collection displayed in the index page.

## Creating Pages With Directus

### Setting Up Directus

Create a new collection called `pages` - make a text input field called `slug`, which will correlate with the URL for the page. For example `about` will later correlate to the page `localhost:4321/about`.

Create a text input field called `title` and a WYSIWYG input field called `content`. In Access Policies settings, give the Public role read access to the new collection.

Create some items in the new collection - [here is some sample data](https://github.com/directus-community/getting-started-demo-data).

### Setting Up Dynamic Routes in Astro

Inside of the `pages` directory, create a new file called `[slug].astro`. Astro can use dynamic route parameters in a filename to generate multiple, matching pages.

```ts
---
import Layout from "../layouts/Layout.astro";
import directus from "../lib/directus";
import { readItems } from "@directus/sdk";

export async function getStaticPaths() {
  const pages = await directus.request(readItems("pages"));
  return pages.map((page) => ({
    params: { slug: page.slug },
    props: page,
  }));
}
const page = Astro.props;
---

<Layout title={page.title}>
  <main>
    <h1>{page.title}</h1>
    <div set:html={page.content} />
  </main>
</Layout>
```

Because all routes must be determined at build time in Astro, a dynamic route must export a `getStaticPaths()` function that returns an array of objects with a params property. Each of these objects will generate a corresponding route.

Go to `http://localhost:4321/about`, replacing `about` with any of your item slugs. Using the Directus JavaScript SDK, the item with that slug is retrieved, and the page should show your data.

::callout{icon="material-symbols:warning-outline-rounded"}

Non-existing slugs will result in a 404 error. Additionally,
[`set:html` should only be used for trusted content.](https://docs.astro.build/en/reference/directives-reference/#sethtml)_

::

## Creating Blog Posts With Directus

Create a new collection called `authors` with a single text input field called `name`. Create one or more authors.

Then, create a new collection called `posts` - make a text input field called  `slug`, which will correlate with the URL for the page. For example `hello-world` will later correlate to the page `localhost:4321/blog/hello-world`.

Create the following fields in your `posts` data model:

- a text input field called `title`
- a WYSIWYG input field called `content`
- an image relational field called `image`
- a datetime selection field called `published_date` - set the type to 'date'
- a many-to-one relational field called `author` with the related collection set to `authors`

In Access Policies, give the Public role read access to the `authors`, `posts`, and `directus_files` collections.

Create some items in the posts collection - [here is some sample data](https://github.com/directus-community/getting-started-demo-data).

### Create Blog Post Listing

Inside of the `pages` directory, create a new directory called `blog` and a new file called `index.astro` inside of it.

```ts
---
import Layout from "../../layouts/Layout.astro";
import directus from "../../lib/directus";
import { readItems } from "@directus/sdk";

const posts = await directus.request(
  readItems("posts", {
    fields: [
      "slug",
      "title",
      "published_date",
      { author: ["name"] },
    ],
    sort: ["-published_date"],
  })
);
---

<Layout title="Blog">
  <main>
    <h1>Blog Posts</h1>
  </main>
</Layout>
```

This query will retrieve the first 100 items (default), sorted by publish date (descending order, which is latest first). It will only return the specific fields we request - `slug`, `title`, `published_date`, and the `name` from the related `author` item.

Display the fetched data in HTML:

```ts
<Layout title="Blog">
  <main>
    <h1>Blog Posts</h1>
 <ul>
  {
    posts.map((post) => (
      <li>
        <a href={`/blog/${post.slug}`}>
          <h2>{post.title}</h2>
        </a>
        <span>
          {post.published_date} &bull; {post.author.name}
        </span>
      </li>
    ))
  }
 </ul>
  </main>
</Layout>
```

Visit `http://localhost:4321/blog` and you'll find a blog post listing, with the latest items first.

![A page with a title of "Blog". On it is a list of three items - each with a title, author, and date. The title is a link.](/img/5811ee82-f600-4855-9620-bafca0bb98d8.webp)

### Create Blog Post Pages

Each blog post links to a page that does not yet exist. In the `pages/blog` directory, create a new file called `[slug].astro` with the content:

```ts
---
import Layout from "../../layouts/Layout.astro";
import directus from "../../lib/directus";
import { readItems, readItem } from "@directus/sdk";

export async function getStaticPaths() {
  const posts = await directus.request(readItems("posts", {
    fields: ['*', { relation: ['*'] }],
  }));
  return posts.map((post) => ({ params: { slug: post.slug }, props: post }));
}
const post = Astro.props;
---

<Layout title={post.title}>
  <main>
    <img src={`YOUR_DIRECTUS_URL/assets/${post.image}?width=500`} />
    <h1>{post.title}</h1>
    <div set:html={post.content} />
  </main>
</Layout>
```

Some key notes about this code snippet.

- The `width` attribute demonstrates Directus' built-in image transformations.
- Once again, `set:html` should only be used if all content is trusted.
- Because almost-all fields are used in this page, including those from the image relational field, the `fields` property when using the Directus JavaScript SDK can be set to `*.*`.

Click on any of the blog post links, and it will take you to a blog post page complete with a header image.

![A blog post page shows an image, a title, and a number of paragraphs.](/img/5811ee82-f600-4855-9620-bafca0bb98d8.webp)

## Add Navigation

While not strictly Directus-related, there are now several pages that aren't linked to each other. Update the `Layout.astro` file to include a navigation. Don't forget to use your specific page slugs.

```ts
  <body>
    <nav>
      <a href="/">Home</a>
      <a href="/about">About</a>
      <a href="/conduct">Code of Conduct</a>
      <a href="/privacy">Privacy Policy</a>
      <a href="/blog">Blog</a>
    </nav>
    <slot />
  </body>
```

## Next Steps

Through this guide, you have set up an Astro project, created a Directus instance, and used it to query data. You have used a singleton collection for global metadata, dynamically created pages, as well as blog listing and post pages.
