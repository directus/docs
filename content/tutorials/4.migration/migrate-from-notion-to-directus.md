---
id: 4a0304fd-c3c3-43f9-8102-acfc6009e26d
slug: migrate-from-notion-to-directus
title: Migrate from Notion to Directus
authors:
  - name: Esther Agbaje
    title: Developer Advocate
description: Learn how to migrate data from Notion databases to Directus.
---
As a developer advocate and freelance coach, I share valuable content with my audience via my [blog](https://thefreelancehq.com/blog). When creating the blog, I needed a [Headless CMS](https://directus.io/solutions/headless-cms) that would integrate nicely with a Next.js Pages directory and make it easy to manage content. Notion was a great choice then, so I opted for it.

While Notion worked pretty well for most cases, the setup process wasn’t quite as easy as I expected, especially the process of mapping Notion elements to DOM elements.

I ran into some challenges and limitations.

1. **Clunky SDK**: Mapping Notion blocks to DOM elements required a lot of custom JS code
2. **Field Relationships UX**: Setting up relationships between page fields was quite cumbersome. For example, I couldn't easily connect blog posts to authors.

## Workaround Solutions Within Notion

Based on the limitations, I had to come up with creative solutions:

- Created a formatDate Function to show the latest publication date of a blog post.

```js
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
```

- Created a function to automatically add a slug for each blog entry using the slugify library.
- Created a `formatBlogData` Function to match the Notion blocks to each content type.

```js
export function formatBlogData(page: PageData) {
  const { properties = {}, id, cover } = page;

  const { Summary, Title, Published, Tags } = properties;

  const title = match(Title)
    .with({ type: 'title' }, (field) => field.title[0].plain_text)
    .otherwise(() => 'Untitled');

  const publishedDate = match(Published)
    .with({ type: 'date' }, (field) => field.date.start)
    .otherwise(() => '2023-01-01');

  return {
    id,

    title,

    slug: slugify(title).toLowerCase(),

    tags: match(Tags)
      .with({ type: 'multi_select' }, (field) => field.multi_select)
      .otherwise(() => []),

    coverImage: match(cover)
      .with({ type: 'external' }, (cover) => cover.external.url)
      .with({ type: 'file' }, (cover) => cover.file.url)
      .otherwise(() => ''),

    publishedDate: {
      raw: publishedDate,
      formatted: formatDate(publishedDate),
    },

    summary: match(Summary)
      .with({ type: 'rich_text' }, (field) => field.rich_text[0].plain_text)
      .otherwise(() => 'Placeholder summary'),
  };
}
```

- Built a custom Notion block and text component to achieve the desired appearance for each content type.

These additional components and functions led to codebase complexity, and I soon realized there was a need for an alternative CMS that could offer scalability and maintainability over time.

## Why Directus?

Today I am excited to share my recent adventure of migrating my blog content from Notion to Directus—a headless content management system (CMS). You may wonder, why Directus?

Well, Directus is not just another CMS. It offers a unique combination of flexibility, customization, and collaboration for content management. It also has built-in user roles and permissions and a JavaScript SDK which were core features I was particularly interested in.

💡 If you're new to Directus, create a Directus Cloud account [here](https://directus.cloud/register).

## Creating the Blogs Collection and Data Model

Migrating my blog content to Directus was a smooth process. In my Directus instance, I initally created a `blogs` collection to hold all blog data. Then I went on to design the data model with the following fields:

- `id` - Integer Input
- `status` - Dropdown
- `title` - Input
- `content` - WYSIWIG
- `tags` - Tags
- `authors` - Many to Many relationship
- `image` - Image
- `date_published` - Datetime

Based on the data model created, I transferred the blog content from Notion to Directus.

![Table in Directus showing a populated blogs collection](/img/0827de4e-f894-4053-8d52-ed361cd3950b.webp)

## Updating the Frontend Code

For seamless integration with Directus, I leveraged the power of the JavaScript SDK.
The first step involved installing it using the command:

```
npm install @directus/sdk
```

Subsequently, I eliminated the Notion-specific helper functions and code that pertained to content block handling. In the `index.js` file, using the Directus SDK, I fetched all blog posts, simplifying data fetching from Directus.

```js
export const getStaticProps = async () => {
  await directus.auth.static(process.env.DIRECTUS_TOKEN);

  const result = await directus.items('blogs').readByQuery({ sort: ['published_date'] });

  const resolvedResult = await Promise.all(
    result.data.map(async (blog) => {
      const author = await directus.items('Authors').readOne(1);
      return { ...blog, author: author?.name };
    })
  );

  resolvedResult?.forEach((blog) => {
    blog.image = `${process.env.DIRECTUS_URL}assets/${blog.image}`;
  });

  return {
    props: {
      blogs: resolvedResult,
    },
  };
};
```

By leveraging the WYSIWYG field in Directus, I could seamlessly handle the content of my blogs without the need for Notion components. Also, I no longer needed to rely on the formatDate function I had developed earlier, as Directus provides built-in sorting capabilities.

## Image Handling

Directus proved to be a game-changer in terms of image handling. In Notion, images are stored as embedded assets. In Directus, images are stored as separate files. Each image in Directus is assigned a unique URL, facilitating seamless integration and effortless management.

## Updating the Dynamic Route

Given that my project was built on Next.js, I made necessary modifications to the code, specifically targeting dynamic route data fetching. I also utilized the blog's ID as a slug for the blogs, eliminating the need for the Slugify library.

Here's the snippet showing the code used:

```js
export const getStaticProps = async (context) => {
  const blogId = context.params?.blogId;
  const directus = new Directus(process.env.DIRECTUS_URL);
  const blog = await directus.items('blogs').readOne(blogId);
  blog.image = `${process.env.DIRECTUS_URL}assets/${blog.image}`;
  return {
    props: { blog },
  };
};
```

## In Summary

With my blog content now securely hosted in Directus, I'm able to utilize more features of Directus and collaborate with other content creators and blog writers. I can:

- Grant roles and permissions to collaborators, empowering them to share and contribute content effortlessly.
- Enjoy live content previews without the need for application redeployment.

This project has been exciting, and I hope you have gleaned insights from this migration.
