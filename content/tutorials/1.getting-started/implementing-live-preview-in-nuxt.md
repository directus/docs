---
slug: implementing-live-preview-in-nuxt
title: Implementing Live Preview in Nuxt
authors:
  - name: Craig Harman
    title: Guest Author
description: Learn how to setup Directus live preview with Nuxt.
---

Live Preview can be enabled in Directus Editor and allows content authors to see their changes directly in the Data Studio. It can be combined with content versioning to preview pre-published content. In this tutorial, you'll learn how to implement Live Preview in your Nuxt application.

## Before You Start

You will need:

- A Directus project with admin access.
- Fundamental understanding of Nuxt concepts.
- Optional but recommended: Familiarity with data modeling in Directus.

## Set Up Your Directus Project

### Create a Collection

Create a new collection called posts with the following fields:

- `title` (Type: String)
- `content` (Type: markdown)
- `slug` (Type: String)
- `published` (Type: Boolean)

In the data model settings for the new collections, enable Live Preview with the following URL pattern: `http://your-website-url/posts/[id]?preview=true`. `[id]` is a template value that can be added by clicking the INLINE_ICON_COMPONENT_WITH_VALUE_PREFILLED icon.

![Directus UI Live Preview URL](/img/PreviewURL-Preview.png)

This value will be dynamic based on the specific item page you are on.

## Edit Public Policy

Published posts should only be viewed by public website visitors. To achieve this, set a custom policy for read and add a filter to only show published posts.

In Directus, navigate to Settings -> Access Policies -> Public and under "Permissions" click "Add Collection" and choose the `post` collection that you created earlier. Click on "read" and choose "Use Custom". This will allow you to customise what posts a public user can see.  
Under Item Permissions, add a filter where the `published` field is set to true.

![Directus interface showing how to filter by published posts](/img/PublicPostsPublishedFilter.png)

Under "Field Permissions" check all the fields. This will allow the public user to see all the fields of the post.

Apply this policy to the `Public` user role by going to Settings -> User Roles -> Public and under `Policies` click "Add Existing" and choose the policy you just created. Save the changes.

## Configure CORS

Directus preview uses an iFrame. You may need set your content security policy to allow access to your Nuxt project. For example if you are self-hosting, or in development, and using Docker, then this is achieved by updating your `docker-compose.yml` file as follows:

```yml
environment:
  CONTENT_SECURITY_POLICY_DIRECTIVES__FRAME_SRC: your-website-url
```

> Replace `your-website-url` with your Nuxt URL and the port. eg. If your Nuxt URL is `http://localhost:3000`, replace `your-website-url` with `localhost:3000`.

## Set Up Your Nuxt Project

### Initialize Your Project

Create a new Nuxt project using [Nuxi](https://nuxt.com/docs/api/commands/init):

```bash
npx nuxi@latest init directus-preview
cd directus-preview
```

Inside your Nuxt project, install the Directus SDK package by running:

```bash
npm install @directus/sdk
```

### Configuring Nuxt

With Nuxt installed with the Directus SDK you can now configure our project to connect to Directus.

Create a `.env` file with the Directus URL:  

```
API_URL="http://0.0.0.0:8055/**"
```

Add a type definition for your new environment variable by creating an `env.d.ts` file with the following content:

  ```ts
  /// <reference types="vite/client" />
  interface ImportMetaEnv {
  	readonly API_URL: string;
  }
    
  interface ImportMeta {
  	readonly env: ImportMetaEnv;
  }
  ```

Depending on your project configuration and if you are in development or production you may need to configure a Nuxt proxy to allow access between your Nuxt application and Directus in your `nuxt.config.ts`:

  ```ts
  routeRules: {
      "/directus/**": { proxy: import.meta.env.API_URL },
    },
  ```

  This will allow your Nuxt application to access Directus via your Nuxt URL, eg. [http://localhost:3000/directus](http://localhost:3000/directus)


### Define a Directus Schema

TypeScript needs to know what the structure of our Directus data will be. To achieve this create a `directus.d.ts` file in the root of our project which defines our schema:

  ```ts
  /// <reference types="@directus/extensions/api.d.ts" />

interface DirectusSchema {
	posts: Post[];
}

interface Post {
	id: number;
	title: string;
	content: string;
	slug: string;
	published: boolean;
}
```

### Create a Directus plugin

Create a Nuxt plugin to streamline accessing Directus throughout your application. Create a new file `plugins/directus.ts`
Copy and paste in the code below, replace the `your-website-url` with your Nuxt URL and port:

```ts
  import {
	createDirectus,
	rest,
	readItem,
	readItems,
	withToken,
} from "@directus/sdk";

const directus = createDirectus<DirectusSchema>(
	"http://your-website-url/directus",
).with(rest());

export default defineNuxtPlugin(() => {
	return {
		provide: { directus, readItem, readItems, withToken },
	};
});
```

## Implement Nuxt Preview Plugin

Create a Nuxt plugin that handles the Directus preview functionality including confirmation of a token and query request.

Create a `plugins/preview.ts` file:

```ts
export default defineNuxtPlugin((nuxtApp) => {
    const route = useRoute();
    const preview = route.query.preview && route.query.preview === 'true';

    if (preview) {
        nuxtApp.hook('page:finish', () => {
            refreshNuxtData();
        });
    }

    return { provide: { preview } };
});
```

Remove `<NuxtWelcome />` from `app.vue` and replace with `<NuxtPage />` so this it looks like this:

```vue
<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>
```

To test your application so far, create a Nuxt page that will display the post via a `slug`. In the `/pages` folder create a new file `[slug].vue`:

```vue
<script setup lang="ts">
const { $directus, $readItems } = useNuxtApp()
const route = useRoute()
const post: Ref<Post | null> = ref(null)

const { data, error } = await useAsyncData('post', async () => {
	const slugParam = Array.isArray(route.params.slug) ? route.params.slug[0] : route.params.slug
	return $directus.request($readItems('posts', {
		filter: {
			slug: { _eq: slugParam }
		},
		fields: ['id', 'title', 'content', 'slug', 'published'],
		limit: 1
	}))
})

if (error.value || data.value === null) {
	console.error(error)
	throw createError({
		statusCode: 404,
		statusMessage: "Post not found"
	})
}

post.value = data.value[0]
</script>
<template>
	<div v-if="post">
		<h1>{{ post.title }}</h1>
		<p>{{ post.content }}</p>
	</div>
	<div v-else>Loading...</div>
</template>
```

Create a `published` post in Directus with the following data:

- `title`: Becoming a productive rabbit
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
- `slug`: becoming-a-productive-rabbit
- `published`: true

Save the post. Start up your Nuxt application by running `npm run dev` and confirm it displays at `http://your-website-url/becoming-a-productive-rabbit`.

![Nuxt page showing a published post](/img/PublicPostPageTest.png)

Now create another page `pages/posts/[id].vue` that can view unpublished pages. This will be used by Direcus Live Preview:

```vue
<script setup>
const { $directus, $readItem, $isPreview, $previewToken, $previewVersion, $withToken } = useNuxtApp()
const route = useRoute()
const post = ref(null)

if ($isPreview) {
	const { data, error } = await useAsyncData('post', async () => {
		try {
			return await $directus.request(
				$withToken($previewToken, $readItem('posts', route.params.id, { version: $previewVersion }))
			)
		} catch (error) {
			throw createError({
				statusCode: 404,
				statusMessage: "Post not found"
			})
		}
	})

	if (error.value) {
		throw createError({
			statusCode: 404,
			statusMessage: "Post not found"
		})
	}

	post.value = data.value
} else {
	const { data, error } = await useAsyncData('post', async () => {
		return $directus.request($readItem('posts', route.params.id))
	})

	if (error.value) {
		throw createError({
			statusCode: 404,
			statusMessage: "Post not found"
		})
	}

	post.value = data.value
}
</script>
<template>
	<div v-if="post">
		<h1>{{ post.title }}</h1>
		<p>{{ post.content }}</p>
	</div>
	<div v-else>Loading...</div>
</template>
```

## Non-Public Content

Currently the users created can only see published posts. To preview non-public content create a new Directus user called "Post Previewer". This user will have permission to view all `posts` and be used by your Nuxt application to request preview versions of `posts`. 

Create a new `Policy` for this user called "Can read non-public posts" and give permissions to read the `posts` collection. Save the policy and then create a token for this user (via the `token` field directly below). Go back to Settings -> Data Model -> Posts and add the token to the Live Preview URL as follows: `/<ID>?preview=true&auth_token=<USER_TOKEN>`. Your application should request data with this token.

![Directus UI showing auth_token added to preview URL](/img/PreviewURL-Token.png)

To confirm you are able to view non-public posts, create a new post in Directus and leave it unpublished. Visit the Nuxt URL of your project `http://your-website-url/posts/<ID>?preview=true&auth_token=<replace with your Directus token>` (replace `<ID>` with the ID of your post). You should see the contents of the post you just created. 

## Live Preview & Content Versioning

If you would like to combine content versioning with your live preview in Nuxt, while still in Settings -> Data Model -> Posts, enable content versioning by checking the "content versioning" box and saving. Refresh the page and then append `&version=<VERSION>` to the existing preview URL. Your URL should now look something like this:

![Directus UI showing version added to preview URL](/img/PreviewURL-Version.png)

Return to the Post Previewer user created above and click on the "Can read non-public posts" policy. Under "Permissions" click "Add Collection" and choose `directus_versions` and then allow read permissions. This gives the Post Previewer user access to all the different versions of a post.

Your application should now be requesting the version and display the correct `post` item.

## Testing Live Preview

### Using the Directus interface

With live preview implemented into your Nuxt application return to Directus and create a `post`. Click the Enable Preview icon and you will see the Nuxt page showing the content of the post.

![Directus UI showing live preview of a post](/img/EditingPostPreview.png)

[Add a new version](https://directus.io/docs/guides/content/content-versioning#creating-a-new-version) of the post and make changes to the content. Ensure the preview updates with the new content.

![Directus UI showing live preview of a post with updated content](/img/EditingPostPreviewVersion.png)

To test the page across different viewport sizes click "change display dimensions". You can then modify the height and width of the preview to ensure the page is responsive.

![Directus UI showing live preview operating at different viewport sizes](/img/EditingPostPreviewDimensions.png)

## Summary

The preview feature allows for quickly and accurately displaying of your front end application without having to leave Directus. Multiple versions can be previewed at various viewport sizes allowing content editors an accurate recreation of content before it is published.

[A repository with the code from this tutorial can be found here](https://github.com/directus-labs/directus-guest-authoring/tree/master/001-directus-preview).
