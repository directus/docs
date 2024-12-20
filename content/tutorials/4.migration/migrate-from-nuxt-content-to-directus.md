---
id: 023412b4-f8c3-4016-921d-756c75aad1e6
slug: migrate-from-nuxt-content-to-directus
title: Migrate from Nuxt Content to Directus
authors:
  - name: Kevin Lewis
    title: Director, Developer Experience
description: Learn how to move from a flat-file CMS to Directus.
---
Away from my day job here at Directus I run a [free library of online content focused around core skills](https://yougotthis.io).

Up until now, I leveraged [Nuxt Content](https://content.nuxtjs.org/), a file-based CMS, for content management. Nuxt Content served the project well, providing nice utilities for fetching and displaying data from a content directory in the repository. Being file-based, authoring used a git-based workflow, meaning content is stored as files, and changes are tracked using version control.

![GitHub repo showing a content directory. Inside, several subdirectories such as "library", "events", and "people". The sidebar shows further subdirectories for individual items and markdown files within them.](/img/00c581bc-69f3-4f3b-a977-773f6f2dd1f8.webp)

Recently, I've been lucky enough to bring on a team member for a few hours a week to help run the project, and while I feel at home spinning up the application locally, working in code to add and edit content, it isn't fair or reasonable to expect that of others.

Directus is an API-driven [Headless CMS](https://directus.io/solutions/headless-cms). Unlike file-based CMSs like Nuxt Content, Directus separates the content from the presentation layer. This decoupling means that non-developers can handle content updates without needing to understand the underlying code. They can work in a user-friendly interface, updating content, and the website pulls data from the API to construct pages.

Many projects start the same way as mine, and I hope sharing this journey of maturing our tooling and processes helps!

## Hacky Fixes With Nuxt Content

I was pretty happy with the latest iteration of the You Got This! website prior to the Directus migration, but there were some challenges with the setup that led to some hacky workarounds…

### Co-Locating Assets With Content

Nuxt Content allows you to create, query, and fetch data in the `content` directory such as markdown. However, assets like blog post images can't be served relative to the data files.

In the past, this meant any given piece of content needed to be split between the `content` and directly-served `static` directory. I built a helper which would, on server boot, copy all non-markdown files to a mirrored file structure in the `static` directory (not checked in to git). This means I could still use relative file paths.

This was quite hacky and had some major drawbacks:
1. Only run on server boot. I'm sure I could have utilized a hook which could re-copy files when content is updated, but that's not how my utility worked.
2. If the content file structure is not the same as the routing structure, which it often wasn't, it led to hacky file path construction. For example, an article would be stored in the `/content/2023/post-slug` directory, but served at `/library/post-slug`, meaning the directory mirroring did not help.

### Grappling With No Relationships

There is a surprising number of relationships between different content types in this project.

Nuxt Content doesn't really have a concept of relationships. Within each of these content types, I manually created lists of 'items' that match the directory names for items I want to reference. These were then used in multiple round-trips to fetch all required data for a page. For example:

```js
// Get single collection based on page URL
const collection = await $content('collections', params.slug).fetch()

// Get all library items, regardless of relevance
const library = await $content('library').fetch()

// Filter library items to those present in collection.items frontmatter
const items = library.filter(libItem => collection.items.find(colItem => libItem.path.includes(colItem)))
```

This is two distinct round-trips for data, and then manual work to reconcile them. If there are one-character typos, expect things to not act as expected.

## Setting Up A Directus Project

I had a loose concept of relationships through manual creation of lists within markdown files, but for the first time, I had to sit down and think properly about the relationships between every data type in my project.

There were some clear low-level entities to start with that don't rely on others - people and sponsors. The library is next - which has a many-to-many (M2M) relationship with people. The content collections link to the library and sponsors. Finally, events link to people and sponsors. It was important to create these in the right order (mostly to make sure I didn't get confused). I also created asset folders for each of these collections.

## Moving Data To Directus

I wrote scripts that used the Directus JavaScript SDK to move each type of data over - I chose to do one collection at a time so I was able to spot any issues. Here's an example of the sponsors migration script:

```js
require('dotenv').config()
const fs = require('fs')
const fetch = require('cross-fetch')
const { Directus } = require('@directus/sdk')
const directus = new Directus(process.env.DIRECTUS_URL, { auth: { staticToken: process.env.DIRECTUS_TOKEN } })

const ASSET_FOLDER = 'Sponsors'
const CONTENT_DIR = 'content/sponsors'
const CONTENT_API_BASE = 'http://localhost:3000/_content/sponsors/'

(async () => {
  // Get id for Sponsors assets folder
  const { data: folders } = await directus.items('directus_folders').readByQuery()
  const { id: folder } = folders.find(f => f.name == ASSET_FOLDER)

  // Get all subfolders of content/sponsors
  let dirs = fs.readdirSync(CONTENT_DIR)
  const items = []

  for(let dir of dirs) {
    // Get sponsor from Nuxt Content Development API
    const [ item ] = await fetch(CONTENT_API_BASE+dir).then(r => r.json())

    // Import asset to Directus in the "Sponsors" folder
    const { id: image } = await directus.files.import({
      url: `https://yougotthis.io${item.dir}/${item.file}`,
      data: { title: item.title, folder }
    })

    // Push all frontmatter, Directus asset id, and slug to items array
    items.push({ ...item, image, id: dir })
  }

  // Form payload in correct structure
  const payload = items.map(item => {
    return {
      slug: item.id,
      title: item.title,
      file: item.image,
      url: item.url
    }
  })

  // Create all sponsors items in Directus
  const { data } = await directus.items('sponsors').createMany(payload)
})();
```

Here's some notable parts of the script:

1. The first couple of lines get the asset folder id, which is needed later to upload assets to the right folder.
2. Then each directory inside of content/sponsors is returned in an array.
3. For each sponsor directory, the data is fetched using the Nuxt Content Development API. This is only available when running the Nuxt dev server.
4. With this additional information, the main sponsor image is imported from the live web URL, in the correct folder.
5. The array of items is then formed into the correct payload for Directus, and bulk-created using the SDK items().createMany() method.

This exercise was repeated for each content type in the Nuxt project. Once completed, there was one collection in Directus for each content subdirectory. The only addition was a `featured` singleton collection to control what collections and sponsors were shown on the home and library pages.

## Consuming Directus From A Nuxt Application

Now data exists within Directus, Nuxt Content could be replaced within the Nuxt project. Firstly, I installed the Directus JavaScript SDK:

```
npm install @directus/sdk
```

Following the same steps as our guide "[Build a Website With Nuxt 3 and the Directus JavaScript SDK](/tutorials/getting-started/fetch-data-from-directus-with-nuxt)", I created a plugin. However, being Nuxt 2, this looks slightly different:

```js
import { Directus } from '@directus/sdk';
const DIRECTUS_URL = 'my-directus-url'
const directus = new Directus(DIRECTUS_URL);

export default({ app }, inject) => {
   inject('directus', directus)
}
```

Once added to your `plugins` array in nuxt.config.js, this.$directus is available throughout the application, and allows it to be used inside of asyncData to fetch data at build-time. For example, the library page's asyncData goes from this:

```js
async asyncData({ $content }) {
  // Get each type of content
  let content = await $content('library').sortBy('date', 'desc').fetch()
  const collections = await $content('collections').sortBy('highlight', 'desc').sortBy('date', 'desc').limit(4).fetch()
  const people = await $content('people').fetch()

  // Add people to content items, as there are no relationships
  content = content.map(item => {
      let people = item.people.map(name => people.find(person => person.dir.split('/')[2] === name))
      people = profiles.map(profile => ({ ...profile, avatar: `${profile.dir}/${profile.avatar}` }))
      return { ...item, people }
  })

  return { content, collections }
}
```

To this:

```js
async asyncData({ $directus }) {
  const { data: content } = await $directus.items('library').readByQuery({ limit: -1, sort: '-date', fields: ['*', '*.*'] })
  let { data: { collections } } = await $directus.items('featured').readByQuery({fields: ['*', '*.*', '*.*.*']})
  return { content, collections }
}
```

The main difference is that relationships are real, as opposed to something that needs to be hacked together after fetching data.

### Working With Assets

Images being stored by Directus and accessed via a URL also means lots of hacky work can be removed from the site, like this line from my `head-factory.js` utility - which generated meta tags for many platforms by feeding in one object:

```js
const image = meta.image ? meta.absolute ? meta.image : `${config.baseURL}${meta.imageDir || meta.path}/${meta.image}` : `${config.baseURL}${config.image}`
```

Honestly, I hate myself for that one. No idea what it meant, but it's gone now and replaced with a direct URL or a fallback:

```js
const image = meta.image ? meta.image : `${config.baseURL}${config.image}`
```

Needing to constantly provide full asset URLs throughout the site (directus-url/assets/asset-id) was getting repetitive, so I decided to create a helper and inject it with my plugin:

```js
export default({ app }, inject) => {
   inject('directus', directus)
   const asset = (id) => `${DIRECTUS_URL}/assets/${id}` // [!code ++]
   inject('asset', asset) // [!code ++]
}
```

Now, anywhere the full URL is needed, only the ID needs to be provided and it is automatically-expanded:

```
<img :src="$asset(person.image)">
```

The `$asset` helper is available globally, for free. No need to import it. If you want to alter the size of the image or use other supported media transformations, string interpolation can be used:

```
<img :src="`${$asset(person.image)}?width=50`">
```

## In Summary

This was a super fun project that marked a point of maturity in my personal project where a robust CMS was required for others to be successful in their work. The broad process was:

1. Set up Directus data model.
2. Write and run migration scripts.
3. Replace `$content` with `$directus` throughout.

I've got to remove a load of hacky code and feel more confident in this project going forward. In the future, I may allow speakers to access their own profiles (through the Directus Data Studio, or through a custom-built frontend), and build a better authoring workflow that supports non-published states (like 'draft' and 'archived').

If you are considering moving from a file-based CMS to a headless API-based CMS, Directus is a great choice. We're always happy to answer questions over in our [Discord server](https://directus.chat).
