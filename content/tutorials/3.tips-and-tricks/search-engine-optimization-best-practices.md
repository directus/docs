---
id: efb3fc4e-36cb-44e0-af93-adce554fdad0
slug: search-engine-optimization-best-practices
title: Search Engine Optimization Best Practices
authors:
  - name: Bryant Gillespie
    title: Growth Engineer
description: Learn some best practices for enabling SEO in your projects using Directus.
---
Search engine optimization (SEO) is an ever-changing but super important part of getting your website in front of visitors.

When using Directus as a[ Headless CMS](https://directus.io/solutions/headless-cms), it is incredibly un-opinionated about what you do with your data and content on the frontend, leaving how you build your website up to you.

But if you’re just starting out, being so open-ended can leave you wondering about the best way to handle things like SEO.

In this post, I’ll share a few tips for managing SEO with Directus. I’ll also share some links and resources for some of the most popular frontend frameworks.

---

**Important Assumptions**

- You understand basic SEO strategy and terminology.
- You’re familiar with collections, fields, and fetching data from Directus.

## Create a Separate Collection for SEO Data

At the end of the day, page titles and meta tags are just data. And you have to store that SEO data for your pages and blog posts somewhere.

For simple sites, you could easily manage all your meta tag data by duplicating fields like `title` and `meta_description` from one collection to another.

But beyond a couple collections, this approach becomes cumbersome and potentially dangerous. What if you forget to copy one field? What if there’s a typo and the names become inconsistent? These oversights could break your SEO practices and ,at worst, your whole site.

One better option would be creating a single collection to standardize all the SEO data for your content collections:

1. Create an `seo` collection

    ```md
    seo

    - id (Type: uuid)
    - title (Type: String, Interface: Input, Note: This item's title, defaults to item.title. Max 70 characters including the site name.)
    - meta_description (Type: Text, Interface: Textarea, Note: This item's meta description. Max 160 characters.)
    - canonical_url (Type: String, Interface: Input, Note: Where should the canonical URL for this entry point to.)
    - no_index (Type: Boolean, Interface: Toggle, Note: Instruct crawlers not to index this item.)
    - no_follow (Type: Boolean, Interface: Toggle, Note: Instruct crawlers not to follow links on this item.)
    - og_image (Type: Image, Note: This item's OG image. Defaults to global site OG image. The recommended size is 1200px x 630px. The image will be focal cropped to this dimension.)
    - sitemap_change_frequency (Type: String, Interface: Input, Note: How often to instruct search engines to crawl.)
    - sitemap_priority (Type: Decimal, Interface: Input, Note: Valid values range from 0.0 to 1.0. This value does not affect how your pages are compared to pages on other sites, it only lets the search engines know which pages you deem most important for the crawlers.)

    ```
    ![Screenshot of the SEO collection data model inside settings. Several fields are displayed like title, meta_description, canonical_url, and others related to the sitemap.](/img/fa4c5682-1773-4078-9b17-00f6345e6733.webp)

    Beyond the basic `title` and `meta_description` , the other fields you add to your SEO collection are totally up to you.

    Adding the fields within Directus is only one half of the work - you need to use these fields in your frontend within your `<head>` tags and sitemap.

2. For each of your content collections that have a route on your frontend, inside Directus –  create a many-to-one (M2O) relationship with the SEO collection.

    ![Screenshot of adding a new many-to-one relationship within the Directus pages collection.](https://marketing.directus.app/assets/8ed6695f-0090-4531-a7c9-4ab4c5cf59cd)

3. When fetching your content on the frontend, use the `fields` parameter to expand the SEO data within a single API call.

    ```js
    import { createDirectus, rest, readItem } from '@directus/sdk';
    const client = createDirectus('directus_project_url').with(rest());

    const postId = '234ee-3fdsafa-dfadfa-dfada';

    const post = await client.request(
    	readItem('posts', postId, {
    		fields: [
    			'title',
    			'summary',
    			'content',
    			'image',
    			{
    				seo: [
    					'title',
    					'meta_description',
    					'canonical_url',
    					'no_index',
    					'no_follow',
    					'og_image',
    					'sitemap_change_frequency',
    					'sitemap_priority',
    				],
    			},
    		],
    	}),
    );

    ```

4.  Then pass that to your frameworks specific method of add SEO metadata within your `<head>` tags.

**Frontend Framework Metadata Documentation**

- [Next.js - Dynamic Metadata](https://nextjs.org/docs/app/building-your-application/optimizing/metadata#dynamic-metadata)
- [Nuxt - SEO and Meta](https://nuxt.com/docs/getting-started/seo-meta#seo-and-meta)
- [Astro - Layouts](https://docs.astro.build/en/core-concepts/layouts/)
- [SvelteKit - SEO](https://kit.svelte.dev/docs/seo)
- [Remix - meta](https://remix.run/docs/en/main/route/meta)
- [Angular - Meta](https://angular.io/api/platform-browser/Meta)

## Don’t Use Slugs as a Primary Key

The actual url for a page on your website is a key factor for search engine rankings. Because of that, your content editors will want to experiment and adjust urls and slugs for items as needed.

When adding a new collection Directus lets you choose from several types of primary keys for your collection.

- Auto-incremented integer
- Auto-incremented big integer
- Generated UUID
- Manually entered string

I’ve seen lots of folks name the primary key field `slug` and use the `Manually entered string` . It’s easy to understand. It makes fetching that item easier because you can get the item by its id (the slug) directly instead of constructing a query to match the slug.

But an item’s **primary key value can not be changed after they are created**, while this protects your database and all of your relationships, it makes it hard to experiment or change URLs if, for example, a product name changes.

To avoid this, use the auto-incremented ids or UUIDs for the primary key `id` and create a separate field input for the `slug` . You can require uniqueness which means only one item in a collection can have a given slug.

You can no longer use API endpoints or SDK functions for reading a single item, as this relies on using the primary key. Instead, query the whole collection and use [Filter Rules](/guides/connect/filter-rules) to get the single item that has the slug:

```js
import { createDirectus, rest, readItems } from '@directus/sdk';
const client = createDirectus('directus_project_url').with(rest());

const slugFromYourFrontEndFramework = params.slug || router.query.slug // whatever your convention your framework follows;

const posts = await client.request(
  readItems('posts', {
    filter: {
      slug: {
        _eq: 'slugFromYourFrontEndFramework',
      },
    },
    limit: 1,
  })
);

const post = posts.data[0];
```

## Use Relationships for Internal Linking

When building a website, you’ll need both links for internal content and links for external content.

One common pattern I’ve noticed is creating string inputs for internal links to other content.

![Screenshot of a form within Directus. Two fields are shown. Label and Href. The Href field value is a string /contact-us](/img/2f8a38d2-a6dd-4810-b097-a158e9677d7b.webp)

But this can be surprisingly brittle. As soon as the slug for the Contact page changes from `/contact-us` to `/contact-directus-team` , the link will break and this can really crash your search engine rankings.

Luckily Directus makes a more dynamic approach possible with relationships.

When creating your data model for links to other items from the same or different collections, try using the conditional fields and [many to one relationships](/guides/data-model/relationships.html) to build a powerful, resilient way to link items.

1. Within your content collection, add the following fields for linking. (Note: This example is extremely simplified so you can learn the logic involved. - name these depending on what makes the most sense to you and your use case.)

    ```md
    your_content_collection

    - link_type (Type: String, Interface: Dropdown, Note: Choices: [
        {
            "text": "Internal - Page",
            "value": "pages"
        },
        {
            "text": "Internal - Post",
            "value": "posts"
        },
        {
            "text": "External - URL",
            "value": "external"
        }
    ])
    - link_label (Type: String, Interface: Input, Note: What label or title is displayed for this link?)
    - link_page (Type: M20 Relationship, Related Collection: pages, Hidden On Detail, Conditions: [
        {
            "name": "IF link_type === page",
            "rule": {
                "_and": [
                    {
                        "link_type": {
                            "_eq": "pages"
                        }
                    }
                ]
            },
            "hidden": false,
        }
    ])
    - link_post (Type: M20 Relationship, Related Collection: post, Hidden On Detail, Conditions: [
        {
            "name": "IF link_type === post",
            "rule": {
                "_and": [
                    {
                        "link_type": {
                            "_eq": "post"
                        }
                    }
                ]
            },
            "hidden": false,
        }
    ])
    - link_external_url (Type: String, Interface: Input, Conditions: [
        {
            "name": "IF link_type === external",
            "rule": {
                "_and": [
                    {
                        "link_type": {
                            "_eq": "external"
                        }
                    }
                ]
            },
            "hidden": false,
        }
    ])

    ```

    <video controls="true">
      <source src="/img/cd5bd4f3-02f1-46be-b82e-570052483379.mp4" type="video/mp4">
    </video>

    Fields for page, post, and external url are only visible when the related type is selected so there is no confusion about which fields to enter data for. And it also allows you to use that relationship to fetch the proper slug or permalink for posts and pages.

2. On the frontend, when you are fetching data via the API, use the fields parameter to get the related posts and pages in a single API call.

Then make sure you’re getting the proper url based on the `link_type`:

```js
const post = await client.request(
    readItem('your_content_collection', 'your_content_item_id', {
        fields: [
            // Fetch all the other root level fields for your collection **In production, you should only fetch the fields you need**
            '*',
            'link_type',
            'link_label',
            'external_url',
            // Use object syntax to fetch fields from a relation
            {
                page: ['id', 'title', 'permalink'],
                post: ['id', 'title', 'slug'],
            },
        ],
    }),
)

function getUrl(item) {
    if (item.link_type === 'pages') {
        return item.page.permalink ?? ''
    } else if (item.link_type === 'posts') {
        return `/blog/${item.post.slug}` ?? ''
    } else if (item.link_type === 'external') {
        return item.external_url ?? ''
    }
    return undefined
}
```


```
<!-- Inside your template -->
<a href="{getUrl(item)}">{item.link_label}</a>
```


**Frontend Framework Link Documentation**

- [Next.js - Link](https://nextjs.org/docs/app/api-reference/components/link)
- [Nuxt - NuxtLink](https://nuxt.com/docs/api/components/nuxt-link#nuxtlink)
- [Astro - Link between pages](https://docs.astro.build/en/core-concepts/astro-pages/#link-between-pages)
- [Svelte - Link options](https://kit.svelte.dev/docs/link-options)
- [Remix - Link](https://remix.run/docs/en/main/components/link#link)
- [Angular - RouterLink](https://angular.io/api/router/RouterLink)

## Add Fields to Control Semantic Elements When Using Dynamic Page Builder

The structure of your content matters a lot for SEO. Crawlers like well structured pages with a clear hierarchy.

For educational items like blog posts or documentation, semantic hierarchy and design usually align well. Most of these items also have a well defined “template” or “layout” on the frontend.

The `<h1>` tag contains the title of the article and is the visually the largest header on the page. Other header tags like `<h2>` or `<h3>` get smaller visually and have less priority for SEO.

![A blog page on the Directus website. The page title is highlighted and labeled as H1. Another headline within the blog post is also highlighted and labeled H2.](/img/4a9c2805-9265-4b14-b447-0ed6ffc3f053.webp)

But for other items like that are more dynamic like landing pages or homepages, the [Builder (Many To Any Relationships)](/guides/data-model/relationships) really shine inside Directus. You can let your marketing or content teams build pages on their own with predefined collections or `blocks` without involving a developer at all. It also pairs beautifully with the [Live Preview feature](/guides/content/live-preview) to allow them to see exactly what the site will look like before publishing.

However, handling the semantic markup you need for proper SEO versus the fact that blocks  could be placed anywhere on a page can be a real challenge when developing your site.

Let’s take header tags for example. You need proper semantic hierarchy for SEO. But our hierarchy for SEO doesn’t always equal our visual hierarchy required for good design.

Having the keyword optimized `<h1>` tag be the largest visually - is not always ideal.

![An events page on the Directus website that highlights the difference in size between the H1 and H2 tags. A small badge with the text Events is the H1. A large headline is the H2.](/img/0269f212-856d-433f-b771-229b40dba31a.webp)

But in other cases, the `<h1>` tag should be the largest visually.

![Screenshot of the Directus website with the page heading highlighted. Callouts are pointing to the H2 and H1 elements within the page heading. The H2 tag is above the H1 tag and much smaller.](/img/614c38a1-f987-4da8-8919-3441d3f0e727.webp)

A great solution to this problem can be to create separate fields within the collection that allow the content editor to choose both the proper header tag and the visual size.

Here’s an example.

![Content editing form within Directus collection. Several fields are highlighted - Preheading Tag, Heading Size, and Heading Tag. Preheading Tag has a value of H1, Heading Size has a value of X-Large, and Heading Tag has a value of H2.](/img/09148a86-24ef-45d8-a275-a3908e0f6d49.webp)

This provides a ton of flexibility. And with just a little training, editors can create pages that look great on screen and also perform well for SEO.

To render this on the frontend, you’d use dynamic components. Most frontend tools support the concept of dynamic components. The syntax will vary though so consult your frontend framework’s documentation.

**Frontend Framework Component Documentation**

- [Next.js - Dynamic Imports for Components](https://nextjs.org/learn/seo/improve/dynamic-import-components)
- [Nuxt - Dynamic Components](https://nuxt.com/docs/guide/directory-structure/components#dynamic-components)
- [Astro - Components](https://docs.astro.build/en/core-concepts/framework-components/) - Astro is a bit unique in that you can use components from other frameworks
- [Svelte - svelte:component](https://svelte.dev/docs/special-elements#svelte-component)
- Remix - I couldn’t find anything on dynamic components within Remix’s documentation.
- [Angular - Dynamic component loader](https://angular.io/guide/dynamic-component-loader)

## Implement a Sitemap

Sitemaps are important tools for crawlers like Googlebot to index your site properly. It’s easy to skip over this step when launching a new site, but it’s an important step that makes sure all the pages on your site can be found in search engines.

There’s not much to really manage inside Directus for a sitemap beyond properly [creating your content collections](/guides/data-model/collections). The heavy lifting for a sitemap is on the frontend.

Some frontend frameworks have an official or community-supported sitemap module / plugin. Others have instructions on how to generate a sitemap without the need to another package.

The exact implementation details will vary based on your selected framework but the general approach looks like this.

1. Create a function that fetches the items for each collection that has a route on your frontend.
2. Loop through those items formatting each as proper xml (or as the specific syntax your plugin requires).
3. Create a route like `/sitemap.xml` that returns the XML file.

Here’s an example that’s specific to Nuxt but the logic could be extracted to other frameworks.

```js
// This example is based on Nuxt and uses a third party package.
// Consult your own frontend framework's documentation for how to properly generate a sitemap in their ecosystem.
// /server/routes/sitemap.xml.ts

import { SitemapStream, streamToPromise } from 'sitemap'
import { createDirectus, readItems, rest } from '@directus/sdk'

const directus = createDirectus(directusUrl).with(rest())

export default defineEventHandler(async (event) => {
    // Fetch all the collections you want to include in your sitemap
    const pages = await directus.request(
        readItems('pages', {
            fields: ['permalink'],
            limit: -1, // Be careful using -1, it will fetch all the items in the collection and could cause performance issues if you have a lot of items
        }),
    )

    const posts = await directus.request(
        readItems('posts', { fields: ['slug', { type: ['slug'] }], limit: -1 }),
    )

    // Create an array of objects with the url you want to include in your sitemap
    const urls = []

    urls.push(...pages.data.map((page) => ({ url: page.permalink })))

    urls.push(
        ...posts.data.map((post) => ({
            url: `/blog/${post.slug}`,
        })),
    )

    const sitemap = new SitemapStream({
        hostname: 'https://example.com',
    })

    // Add each url to the sitemap
    for (const item of urls) {
        sitemap.write({
            url: item.url,
            changefreq: 'monthly',
        })
    }

    sitemap.end()
    return streamToPromise(sitemap)
})
```


**Frontend Framework Sitemap Resources**

- [Next.js - XML Sitemap Documentation](https://nextjs.org/learn/seo/crawling-and-indexing/xml-sitemaps)
- [Nuxt - Nuxt Simple Sitemap Module](https://nuxt.com/modules/simple-sitemap)
- [Astro - @astro/sitemap Integration](https://docs.astro.build/en/guides/integrations-guide/sitemap/)
- [Svelte - Sitemap Package](https://github.com/bartholomej/svelte-sitemap)
- [Remix - Remix SEO Package](https://github.com/balavishnuvj/remix-seo)
- Angular - I struggled to find a helpful tutorial or sitemap package for Angular.

## Give Your Team Control of Redirects

It sucks having to pull yourself away from a fun (or important) project to manually add some redirects for a page. Do yourself a favor and let your content team add and manage redirects within the CMS.

1. Create a `redirects` collection

    ```md
    redirects

    - id (Type: uuid)
    - url_old (Type: String, Interface: Input)
    - url_new (Type: Integer, Interface: Slider)
    - response_code (Type: String, Interface: Dropdown, Choices: [
        {
            "text": "Permanent (301)",
            "value": "301"
        },
        {
            "text": "Temporary (302)",
            "value": "302"
        }
    ])
    ```

    ![Screenshot of the Redirects collection data model within Directus settings. Fields included in the data model are url_old, url_new, and response_code.](/img/9cad8803-53cb-4c2c-9e51-e05041ba9b87.webp)

2. Add redirects dynamically when building your frontend. This is often done by creating a function to fetch the redirects from your Directus API and then passing those redirects to your frontend framework using a specific syntax inside a config file, plugin, or module.

    ```js
    // Though it depends on your specific framework, this logic would probably be called during build time
    import { createDirectus, readItems, rest } from '@directus/sdk'

    const directus = createDirectus(directusUrl).with(rest())

    const redirects = await directus.request(readItems('redirects'))

    for (const redirect of redirects) {
    	let responseCode = redirect.response_code
    		? parseInt(redirect.response_code)
    		: 301

    	// If response code doesn't match what we expect, use 301
    	if (responseCode !== 301 && responseCode !== 302) {
    		responseCode = 301
    	}

    	// Add Logic here to add the redirects to a config file or tell your frontend framework how to handle them
    	// ** Your Logic **
    }
    ```


**Frontend Framework Redirect Documentation**

- [Next.js Redirects](https://nextjs.org/docs/pages/api-reference/next-config-js/redirects)
- [Nuxt Redirects](https://nuxt.com/docs/guide/concepts/rendering#hybrid-rendering)
- [Astro Redirects](https://docs.astro.build/en/core-concepts/routing/#configured-redirects)
- [Svelte Redirects](https://kit.svelte.dev/docs/load#redirects)
- [Remix Redirects](https://remix.run/docs/en/main/utils/redirect#redirect)
- [Angular Redirects](https://angular.io/guide/router#setting-up-redirects)

## Don’t Forget Image Alt Text

Often overlooked, image alt text is important for SEO and critical for proper accessibility.

```
<img src="https://example.com/image.png" alt="An example image of how alt text works" width="500" height="500" />
```

A good way to manage image alt tags is on the files themselves as you upload them within Directus.

I prefer using the `description` field on files to store alt text. This way you don’t have to input alt text every single time you use this same image in different contexts.

![Screenshot of a File library item form that shows a large image of Directus Flows. Within the form there are two fields - Title and Description.](/img/cb73c2c8-e3b1-42f7-9632-abdb8aed0c21.webp)

For items like blog posts or articles you might have an `image` or `featured_image`  field so you can have a nice hero image or a thumbnail if shown inside a card.

If you store alt text inside of the image item, you will want to fetch these nested title and description fields within the same API call:

```js
const posts = await client.request(
  readItems('posts', {
    filter: {
      slug: {
        _eq: slugFromYourFrontEndFramework,
      },
    },
		fields: ['title', 'date_published', 'summary', 'content', { image: ['id', 'title', 'description']}]
    limit: 1,
  })
);
```

```
<!-- Inside your template -->
<img src={post.image.id} alt={post.image.description ?? ""} />
```

Remember that the position of the image `id` will change from `item.image` to `[item.image.id](http://item.image.id)` when you fetch nested fields.

And remember – the actual alt text itself is just as important as rendering it on the page. I won’t dive into details because Moz has a great [tutorial on how to write proper alt text here](https://moz.com/learn/seo/alt-text).

And if you’ve got 100s of images without alt text and you’re dreading doing all that work manually, try a boost from this extension - [Directus Media AI Bundle](https://github.com/Arood/directus-extension-media-ai-bundle) - a winner in a recent AI Hackathon submitted by community member [Arood](https://github.com/Arood). It uses several different AI tools to write image alt text or descriptions for you.

**Frontend Framework Image Documentation**

- [Next.js Images](https://nextjs.org/docs/pages/api-reference/components/image)
- [Nuxt Images](https://image.nuxt.com/)
- [Astro Images](https://docs.astro.build/en/guides/images/)
- [Svelte Images](https://kit.svelte.dev/docs/assets)
- Remix - I couldn’t locate any documentation about images on the Remix site.
- [Angular Images](https://angular.io/guide/image-directive)

## Summary

In this post, we’ve covered some SEO best practices when using Directus as a Headless CMS. Hopefully you’ve learnt something new, and can build more robust data models that serve both your users and search engine crawlers.

If these tips were helpful or if you have some of your own you’d like to share, let us know inside [our Discord community](https://directus.chat).
