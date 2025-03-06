---
id: b847e493-5a35-49e1-80b1-3dc2657a0f7d
slug: fetch-data-from-directus-with-eleventy-3
title: Fetch Data from Directus with Eleventy 3
authors:
  - name: Kevin Lewis
    title: Director, Developer Experience
description: Learn how to integrate Directus in your 11ty web application.
---
Eleventy (sometimes referred to 11ty) is a lightweight and unopinionated static site generator. You can use any templating language, and it ships with zero client-side JavaScript by default. In this guide, you will learn how to build a website with Directus as a Headless CMS.

## Before You Start

You will need:

- Node.js and a code editor.
- A Directus project - [follow our quickstart guide](/getting-started/overview) if you don't already have one.

Open your terminal and run the following commands to create a new 11ty project and the Directus JavaScript SDK:

```
mkdir my-website && cd my-website
npm init -y
npm install @11ty/eleventy@3.0.0-alpha.2 @directus/sdk
```

::callout{icon="material-symbols:info-outline"}

When Eleventy 3.0 leaves alpha, we'll update this post with any changes required.

::

Open `my-website` in your code editor. Add `"type": "module"` to the object in your `package.json` file, and type `npx @11ty/eleventy --serve --watch` in your terminal to start the 11ty development server and open <http://localhost:8080> in your browser.

Create a new directory in your 11ty project called `_includes`. Inside of it, another directory called `layouts`. And, finally, a file called `base.njk`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ title }}</title>
</head>
<body>
  <main>
    {{ content | safe }}
  </main>
</body>
</html>
```

## Create a Directus Helper

Create a `_data` directory in your 11ty project, and inside of it a `directus.js` file, being sure to provide your full Directus project URL:

```js
import { createDirectus, rest } from '@directus/sdk';

const directus = createDirectus('YOUR_DIRECTUS_PROJECT_URL').with(rest());

export default directus;
```

## Using Global Metadata and Settings

In your Directus project, navigate to **Settings -> Data Model** and create a new collection called `global`. Under the Singleton option, select 'Treat as a single object', as this collection will have just a single entry containing global website metadata.

Create two text input fields - one with the key of `title` and one `description`.

Navigate to the content module and enter the global collection. Collections will generally display a list of items, but as a singleton, it will launch directly into the one-item form. Enter information in the title and description field and hit save.

![A form named Global has two inputs - a title and a description, each filled with some text.](/img/d8c92df8-63c3-404e-8e0f-b086d27d960a.webp)

By default, new collections are not accessible to the public. Navigate to **Settings -> Access Policies -> Public** and give Read access to the Global collection.

Inside of your `_data` directory, create a new file called `global.js`:

```js
import directus from './directus.js';
import { readSingleton } from '@directus/sdk';

export default async () => {
    return await directus.request(readSingleton('global'))
}
```

Data from the global collection in Directus will now be available throughout your 11ty project as `global`.

Create a new file in the root directory of your 11ty project called `index.njk`:

```html
---
layout: layouts/base.njk
eleventyComputed:
    title: "{{ global.title }}"
---

<h1>{{ title }}</h1>
<p>{{ global.description }}</p>
```

`eleventyComputed` is being used so there is a `title` key, which is used by the main layout created at the start of this tutorial to populate the `<title>` element in the `<head>`.

Refresh your browser. You should see data from your Directus Global collection in your page.

## Creating Pages With Directus

Create a new collection called `pages` - make an input field titled `slug`, which will correlate with the URL for the page. For example `about` will later correlate to the page `localhost:3000/about`.

Create an additional text input field called `title` and a WYSIWYG input field called `content`. In Roles & Permissions, give the Public role read access to the new collection. Create 3 items in the new collection - [here's some sample data](https://github.com/directus-community/getting-started-demo-data).

Inside of your `_data` directory, create a new file called `pages.js`:

```js
import directus from './directus.js';
import { readItems } from '@directus/sdk';

export default async () => {
    return await directus.request(readItems('pages'))
}
```

Create a new file in the root directory of your 11ty project called `_page.njk`:

```html
---
layout: layouts/base.njk
pagination:
    data: pages
    size: 1
    alias: page
permalink: "{{ page.slug }}/index.html"
eleventyComputed:
    title: "{{ page.title }}"
---

<h1>{{ title }}</h1>
{{ page.content | safe }}
```

Go to http://localhost:8080/about, replacing `about` with any of your item slugs. One page is created per page returned in the `pages.js` data file.

_Note that only pages that match the permalink structure, and exist in Directus, are generated. This means your application will return a 404 if the page does not exist. Please also note that the `safe` filter should only be used for trusted content as it renders unescaped content._

## Creating Blog Posts With Directus

Create a new collection called `authors` with a single text input field called `name`. Create one or more authors.

Then, create a new collection called `posts` - add a text input field called `slug`, which will correlate with the URL for the page. For example `hello-world` will later correlate to the page `localhost:3000/blog/hello-world`.

Create the following additional fields in your `posts` data model:

- a text input field called `title`
- a WYSIWYG input field called `content`
- an image relational field called `image`
- a datetime selection field called `publish_date` - set the type to 'date'
- a many-to-one relational field called `author` with the related collection set to `authors`

In your Access Policies settings, give the Public role read access to the `authors`, `posts`, and `directus_files` collections.

Create 3 items in the posts collection -
[here's some sample data](https://github.com/directus-community/getting-started-demo-data).

### Create Blog Post Listing

Inside of your `_data` directory, create a new file called `posts.js`:

```js
import directus from './directus.js';
import { readItems } from '@directus/sdk';

export default async () => {
    return await directus.request(
        readItems("posts", {
            fields: ["*", { author: ["name"] }],
            sort: ["-publish_date"],
        })
    );
}
```

This data file will retrieve the first 100 items (default), sorted by publish date (descending order, which is latest first). It will only return the specific fields we request - `slug`, `title`, `publish_date`, and the `name` from the related `author` item.

Create a new file in the root directory of your 11ty project called `blog.njk`:

```html
---
layout: layouts/base.njk
permalink: "blog/index.html"
title: Blog
---

<h1>{{ title }}</h1>
<ul>
    {% for post in posts %}
        <a href="/posts/{{ post.slug }}">
            <h2>{{ post.title }}</h2>
        </a>
        <span>
            {{ post.publish_date }} &bull; {{ post.author.name }}
        </span>
    {% endfor %}
</ul>
```

Visit http://localhost:3000 and you should now see a blog post listing, with latest items first.

![A page with a title of "Blog". On it is a list of three items - each with a title, author, and date. The title is a link.](/img/5811ee82-f600-4855-9620-bafca0bb98d8.webp)

### Create Blog Post Page

Each blog post links to a page that does not yet exist. Create a new file in the root directory of your 11ty project called `_post.njk`:

```html
---
layout: layouts/base.njk
pagination:
    data: posts
    size: 1
    alias: post
permalink: "blog/{{ post.slug }}/index.html"
eleventyComputed:
    title: "{{ post.title }}"
---

<img src="{{ directus.url }}assets/{{ post.image }}?width=600" />
<h1>{{ title }}</h1>
{{ post.content | safe }}
```

Some key notes about this code snippet.

- In the `<img>` tag, `directus.url` is the value provided when creating the Directus data file.
- The `width` attribute demonstrates Directus' built-in image transformations.
- Once again, the `safe` filter should only be used if all content is trusted.

Click on any of the blog post links, and it will take you to a blog post page complete with a header image.

![A blog post page shows an image, a title, and a number of paragraphs.](/img/5811ee82-f600-4855-9620-bafca0bb98d8.webp)

## Add Navigation

While not strictly Directus-related, there are now several pages that aren't linked to each other. In `_includes/layouts/base.njk`, above the `<main>` component, add a navigation. Don't forget to use your specific page slugs.

```vue-html
<nav>
	<a to="/">Home</a>
	<a to="/about">About</a>
	<a to="/conduct">Code of Conduct</a>
	<a to="/privacy">Privacy Policy</a>
	<a to="/blog">Blog</a>
</nav>
```

## Next Steps

Through this guide, you have set up an 11ty project, initialized the Directus JavaScript SDK, and used it to query data. You have used a singleton collection for global metadata, dynamically created pages, as well as blog listing and post pages.

If you want to change what is user-accessible, consider setting up more restrictive roles and accessing only valid data at build-time.
