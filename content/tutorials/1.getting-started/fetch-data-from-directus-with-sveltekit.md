---
id: 9f57fe88-ece0-42db-ad76-9e811989d4a8
slug: fetch-data-from-directus-with-sveltekit
title: Fetch Data from Directus with SvelteKit
authors:
  - name: Eike Thies
    title: Guest Author
description: Learn how to integrate Directus in your SvelteKit web application.
---
[SvelteKit](https://kit.svelte.dev/) is a popular Companion JavaScript Framework to Svelte.js - focusing on creating performant web applications. In this tutorial, you will learn how to build a website using Directus as a CMS. You will store, retrieve, and use global metadata such as the site title, create new pages dynamically based on Directus items, and build a blog.

## Before You Start

You will need:

- To install Node.js and a code editor on your computer.
- A Directus project - follow our [quickstart guide](/getting-started/overview) if you don't already have one.
- Some knowledge of Svelte.

## Initialize SvelteKit Project

Open your terminal and run the following commands to create a new SvelteKit project and add the Directus JavaScript SDK:

```bash
npm create svelte@latest frontend # Choose Skeleton project
cd frontend
npm install
npm install @directus/sdk
```

Open `frontend` in your code editor and type `npm run dev` in your terminal to start the Vite development server and open `http://localhost:5173` in your browser.

### Create a Wrapper for the SDK

We now need to setup the Directus SDK and make it accessible globally. In order to make the best use of SvelteKit's Server Side Rendering, we will need to use SvelteKit's own [fetch implementation](https://kit.svelte.dev/docs/load#making-fetch-requests). Create a new file `directus.js` inside
of the `src/libs` directory:

```js
import { createDirectus, rest } from '@directus/sdk';
import { readItems, readItem, updateItem, updateUser, createItem, deleteItem } from '@directus/sdk';
import { PUBLIC_APIURL } from '$env/static/public';

function getDirectusInstance(fetch) {
  	const options = fetch ? { globals: { fetch } } : {};
	const directus = createDirectus(PUBLIC_APIURL, options ).with(rest());
	return directus;
}

export default getDirectusInstance;
```

In order to make this work we also need to create a `hooks.server.js` file with the following content in the `src` directory. It makes sure that the required headers for fetching JavaScript content are returned by the SvelteKit Server.

```js
export async function handle({ event, resolve }) {
	return await resolve(event, {
		filterSerializedResponseHeaders: (key, value) => {
			return key.toLowerCase() === 'content-type';
		},
	});
}
```

::callout{icon="material-symbols:info-outline"}

Theoretically you could also make HTTP requests to your Directus server endpoint directly via SvelteKit's `fetch`
implementation. However the Directus SDK offers some nice [additional features](/guides/connect/sdk).

::

Also create the environment variable inside a `.env` file in the root directory. Ensure your API URL is correct when initializing the Directus JavaScript SDK.

```js
PUBLIC_APIURL = 'https://directus.example.com';
```

## Using Global Metadata and Settings

In your Directus project, navigate to Settings -> Data Model and create a new collection called `global`. Under the Singleton option, select 'Treat as a single object', as this collection will have just a single entry containing global website metadata.

Create two text input fields - one with the key of `title` and one `description`.

Navigate to the content module and enter the global collection. Collections will generally display a list of items, but as a singleton, it will launch directly into the one-item form. Enter information in the title and description field and hit save.

![A form named Global has two inputs - a title and a description, each filled with some text.](/img/d8c92df8-63c3-404e-8e0f-b086d27d960a.webp)

By default, new collections are not accessible to the public. Navigate to Settings -> Access Control -> Public and give Read access to the Global collection.

## Prepare SvelteKit to use Directus

Create a new file called `+page.js` in the root directory next to the `.page.svelte` file. This file's load function will be responsible to fetch the data on the client and on the server during Server Side Rendering.

```js [+page.js]
/** @type {import('./$types').PageLoad} */
import getDirectusInstance from '$lib/directus';
import { readItems } from '@directus/sdk';
export async function load({ fetch }) {
	const directus = getDirectusInstance(fetch);
	return {
		global: await directus.request(readItems('global')),
	};
}
```

Modify the `+page.svelte` file to use the new data and display it on our site:

```svelte [+page.svelte]
<script>
	/** @type {import('./$types').PageData} */
	export let data;
</script>

<h1>{data.global.title}</h1>
<p>{data.global.description}</p>

```

Refresh your browser. You should see data from your Directus Global collection in your page.

## Creating Pages With Directus

### Setup Directus Data

Create a new collection called `pages` - make a text input field called `slug`, which will
correlate with the URL for the page. For example `about` will later correlate to the page `/about`.

Create a text input field called `title` and a WYSIWYG input field called `content`. In Access Control, give the
Public role read access to the new collection. Create a few items in the new collection.

### Setup SvelteKit Routes

Create a new directory called `[slug]`. SvelteKit uses a [file based routing mechanism](https://kit.svelte.dev/docs/routing) and parameters are always part of
the directory name, while the files within the directory are always either +page.js, +page.js or +page.server.js

Inside of `[slug]`, create a new file called `+page.js`. This is a dynamic route, so this time we will use the dynamic
`params` object to fetch the correct data. To illustrate how SvelteKit's data loading works you can open a different
page URL which will change the `params` object. Evidently this will lead to SvelteKit invalidate the `.page.js` data and
refetch our page data.

::: code-group

```js [+page.js]
/** @type {import('./$types').PageLoad} */
import { error } from '@sveltejs/kit';
import getDirectusInstance from '$lib/directus';
import { readItems } from '@directus/sdk';
export async function load({ fetch, params }) {
	const directus = getDirectusInstance(fetch);

	try {
		return {
			page: await directus.request(readItems('pages', [{slug: params.slug}]))[0],
		};
	} catch (err) {
		throw error(404, 'Page not found');
	}
}
```

```svelte [+page.svelte]
<script>
	/** @type {import('./$types').PageData} */
	export let data;
</script>


<h1>{data.page.title}</h1>
<div>{@html data.page.content}</div>
```

:::

Go to `http://localhost:5173/about`, replacing `about` with any of your item slugs. Using the Directus JavaScript SDK, the
single item with that slug is retrieved, and the page should show your data. `readItems()` only checks against your
`slug` field.
SvelteKit populates the data property and also updates it on the client automatically should any dependency(variable, url, etc.) used inside our load function change. In this case whenever `params.slug` changes.

::callout{icon="material-symbols:warning-outline-rounded"}

Non-existing IDs will result in a forbidden error, which we catch and then throw svelte's internal error
object to respond with a 404. Additionally,
[`@html` should only be used for trusted content.](https://svelte.dev/docs/special-tags#html)_

::

## Creating Blog Posts With Directus

Create a new collection called `authors` with a single text input field called `name`. Create one or more authors.

Then, create a new collection called `posts` - make a text input field called `slug`,
which will correlate with the URL for the page. For example `hello-world` will later correlate to the page
`/blog/hello-world`.

Create the following fields in your `posts` data model:

- a text input field called `title`
- a WYSIWYG input field called `content`
- an image relational field called `image`
- a datetime selection field called `publish_date` - set the type to 'date'
- a many-to-one relational field called `author` with the related collection set to `authors`

In Access Control, give the Public role read access to the `authors`, `posts`, and `directus_files` collections.

Create a few items in the posts collection.

### Create Blog Post Listing

Create a new Directory called `blog` and a new file called `+page.js` inside of it.

```js [+page.js]
/** @type {import('./$types').PageLoad} */
import getDirectusInstance from '$lib/directus';
import { readItems } from '@directus/sdk';
export async function load({ fetch }) {
	const directus = getDirectusInstance(fetch);
	return {
		posts: await directus.request(readItems('posts', {
			fields: ['slug', 'title', 'publish_date', { author: ['name'] }],
			sort: ['-publish_date'],
		})),
	};
}
```

This query will retrieve the first 100 items (default), sorted by publish date (descending order, which is latest
first). It will only return the specific fields we request - `slug`, `title`, `publish_date`, and the `name` from the
related `author` item.

Likewise to before we create a template file `+page.svelte` to show our newly fetched data:

```svelte [+page.svelte]
<script>
	/** @type {import('./$types').PageData} */
	export let data;
</script>
<h1>Blog</h1>
<ul>
	{#each data.posts as post}
		<li>
			<h2>
				<a href="/blog/{post.slug}">
					{post.title}
				</a>
			</h2>
			<span>{post.publish_date} &bull; {post.author.name}</span>
		</li>
	{/each}
</ul>
```

Visit `http://localhost:5173/blog` and you should now see a blog post listing, with latest items first.

![A page with a title of "Blog". On it is a list of three items - each with a title, author, and date. The title is a link.](/img/5811ee82-f600-4855-9620-bafca0bb98d8.webp)

### Create Blog Post Listing

Each blog post links to a page that does not yet exist. In the `blog` directory, create a new directory called `[slug]`
with the necessary files as usual:

```js [+page.js]
/** @type {import('./$types').PageLoad} */
import { error } from '@sveltejs/kit';
import getDirectusInstance from '$lib/directus';
import { readItems } from '@directus/sdk';
export async function load({ fetch, params }) {
	const directus = getDirectusInstance(fetch);
	try {
		return {
			post: await directus.request(readItems('posts', {
				fields: ['*', { slug: params.slug, '*': ['*'] }],
			}))[0],
		};
	} catch (err) {
		error(404, 'Post not found');
	}
}
```

```svelte [+page.svelte]
<script>
	import { PUBLIC_APIURL } from '$env/static/public';
	/** @type {import('./$types').PageData} */
	export let data;
</script>
<img src="{PUBLIC_APIURL}/assets/{data.post.image.filename_disk}?width=600" alt="{data.post.image.description}" />
<h1>{data.post.title}</h1>
<div>{@html data.post.content}</div>
```

Some key notes about this code snippet.

- The `width` attribute demonstrates Directus' built-in image transformations.
- Once again, `@html` should only be used if all content is trusted.
- Because almost-all fields are used in this page, including those from the `image` relational field, the `fields`
  property when using the Directus JavaScript SDK can be set to `*.*`.

Click on any of the blog post links, and it will take you to a blog post page complete with a header image.

![A blog post page shows an image, a title, and a number of paragraphs.](/img/5811ee82-f600-4855-9620-bafca0bb98d8.webp)


::callout{icon="material-symbols:info-outline"}

If the image is not showing up for you, you might have forgotten to also give the `directus_files` collection read
access as described above. This is due to that by default the file object only includes the image name, but not the
metadata, which we need to get the actual binary file from the Directus endpoint. To fix this go to Access Control,
give the Public role read access to the `directus_files` collection.

::

## Add Navigation
While not strictly Directus-related, there are now several pages that aren't linked to each other. Let's add a
`+layout.svelte` file to the root directory and add a navigation. Don't forget to use your specific page slugs.

```svelte [+layout.svelte]
<a href="/">Home</a>
<a href="/about">About</a>
<a href="/conduct">Code of Conduct</a>
<a href="/privacy">Privacy Policy</a>
<a href="/blog">Blog</a>
<div>
	<slot />
</div>
```

## Next Steps

Through this guide, you have set up a SvelteKit project, created a Directus Wrapper, and used it to query data. You have
used a singleton collection for global metadata, dynamically created pages, as well as blog listing and post pages.
