---
id: 11a1c86f-36bf-4dd5-8bce-7eed75451514
slug: create-a-cms-using-directus-and-nuxt
title: Create a CMS using Directus and Nuxt
technologies:
  - nuxt
authors:
  - name: Craig Harman
    title: Guest Author
description: Learn how to create a CMS using Directus and Nuxt.
---

Directus provides a headless CMS, which when combined with Nuxt will streamline content management. This post covers how to connect them to create a flexible, modern content management system.

## Before You Start

You will need:
- A new Directus project with admin access.

## Set Up Your Directus Project

Start with a Directus Cloud or self-hosted clean install of Directus. Follow the steps below to configure Directus with the necessary collections and permissions.

First, using the new Directus instance, generate a static token for the admin user by going to the Users Directory. Choose the Administrative User, and scroll down to the Token field and generate a static token. Copy the token and save it. Do not forget to save the user, or you will encounter an "Invalid token" error.

### Apply the CMS Template

Use the [Directus Template CLI](https://github.com/directus-labs/directus-template-cli) to apply the CMS template for your project by opening your terminal and running the following command: 

```bash
npx directus-template-cli@latest apply
```

Choose Community templates, and select the CMS template. Fill in your Directus URL, and select Directus Access Token as the authentication method, filling in the token created earlier.

The Directus Template CLI will make the required changes to Directus to add the CMS template. This includes creating the necessary collections, fields, and relationships to manage your content.

## Set Up Your Nuxt Project

### Initialize Your Project

Create a new Nuxt project using [Nuxi](https://nuxt.com/docs/api/commands/init):

```bash
npx nuxi@latest init directus-cms
cd directus-cms
```

Just press enter to accept the defaults. None of the additional packages are required.

### Configure Nuxt

Configure Nuxt so that it is able to communicate with the (external) Directus API. 

Create a `.env` file with the Directus URL:  

```
API_URL="http://0.0.0.0:8055"
```

Add a type definition for our new environment variable by creating an `env.d.ts` file with the following content:

  ```ts
  /// <reference types="vite/client" />
  interface ImportMetaEnv {
  	readonly API_URL: string;
  }
    
  interface ImportMeta {
  	readonly env: ImportMetaEnv;
  }
  ```

Depending on your project configuration and if you are in development or production you may need to configure a Nuxt proxy to allow access between your Nuxt project and Directus in your `nuxt.config.ts`:

  ```ts
  routeRules: {
      "/directus/**": { proxy: `${import.meta.env.API_URL}/**` },
    },
  ```

This will allow your Nuxt project to access Directus via your Nuxt URL, eg. [http://localhost:3000/directus](http://localhost:3000/directus)

Configure Nuxt UI by:

1. Creating a CSS file in `assets/css/main.css` and adding the following content:

```css
@import "tailwindcss";
@import "@nuxt/ui";
```

2. Adding the Nuxt UI module to your `nuxt.config.ts`:

```ts
modules: ['@nuxt/ui'],
css: ['~/assets/css/main.css'],
```

This will give you a design starting point for your CSS and UI components using [NuxtUI](https://ui.nuxt.com/).

> Note: This tutorial is using Nuxt UI Pro, which is a paid version of Nuxt UI (although it is free in development). It contains default layouts for some of the components in the CMS template. You can always remove this and use custom CSS or another UI library.

### Additional packages

To assist in development install the following packages:

```bash
npm install @directus/sdk @nuxt/ui
```

### Define a Directus Schema

TypeScript needs to know what the structure of the Directus data is. To achieve this create a `directus.d.ts` file in the root of our project which defines our schema and add the Post collection structure:

```ts
/// <reference types="@directus/extensions/api.d.ts" />
interface DirectusSchema {
	pages: Page[];
	form_submissions: FormSubmission
	navigation: Navigation[];
}

interface Page {
	id: number;
	title: string;
	permalink: string;
	status: string;
	published_at: string;
	seo: SEOMeta;
	blocks: Block[];
}

interface Navigation {
	id: string;
	title: string;
	items: NavigationItem[];
}

interface NavigationItem {
	id: string;
	navigation: string;
	page: string | null;
	parent: string | null;
	sort: number;
	title: string;
	type: string;
	url: string | null;
	post: string | null;
	children: NavigationItem[];
}

interface FormSubmission {
	id?: number;
	form: string;
	values: FormFieldValue[]
}

interface FormFieldValue {
	label: string;
	value: string;
	type: string;
}

interface Block {
	id: string;
	collection: string;
	item: Hero | RichText;
	no_index: boolean;
	no_follow: boolean;
}

interface Hero {
	tagline: string;
	headline: string;
	description: string;
	button_group: ButtonGroup;
	image: Image;
}

interface ButtonGroup {
	buttons: Button[];
}

interface Button {
	label: string;
	url: string;
	variant: ButtonProps['variant'];
}

interface Image {
	id: number;
	title: string;
}

interface RichText {
	tagline: string;
	headline: string;
	content: string;
	alignment: string;
	hide_block: boolean;
}

interface Pricing {
	id: number;
	tagline: string;
	headline: string;
	pricing_cards: PricingCard[];
}

interface PricingCard {
	id: number;
	title: string;
	description: string;
	price: string;
	badge: string;
	features: string[];
	pricing: string;
	is_highlighted: boolean;
	sort?: number;
	button: Button;
}

interface Form {
	id: string;
	headline: string;
	tagline: string;
	form: FormElement;
}

interface FormElement {
	id: string;
	sort: number | null;
	title: string;
	is_active: boolean;
	submit_label: string;
	on_success: string;
	success_message: string;
	success_redirect_url: string | null;
	fields: FormField[];
}

interface FormField {
	id: string;
	name: string;
	type: string;
	label: string;
	placeholder: string | null;
	help: string | null;
	validation: string | null;
	width: string;
	choices: string[]| null;
	form: string;
	sort: number;
	required: boolean;
}

interface SEOMeta {
	title: string;
	meta_description: string;
}
```

### Use Nuxt page router

Configure Nuxt to use the page router and Nuxt UI by editing `app.vue` replacing the content with:

```html
<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </UApp>
</template>
```

### Create a Directus plugin

Create a Nuxt plugin to streamline accessing Directus throughout your application. Create a new file `plugins/directus.ts`
Copy and paste in the code below, replace the `your-website-url` with your Nuxt URL and port:

```ts
import { createDirectus, rest, readItem, readItems } from "@directus/sdk";
const directus = createDirectus<DirectusSchema>(
	"http://localhost:3000/directus",
).with(rest());
export default defineNuxtPlugin(() => {
	return {
		provide: { directus, readItem, readItems },
	};
});
```

This file handles all the interaction with Directus and provides Nuxt with the required Directus SDK features.


## Create the Home Page

The Directus CMS template comes with an example home page. The home page is a collection of different sections which will be created as Nuxt components.

![Directus CMS Home page user interface](/img/directus-home-ui.png)

First, create a home page as a parent for all the components. This will be in `pages/index.vue` with the following content:

```vue
<script setup lang="ts">
const { $directus, $readItems } = useNuxtApp()
const route = useRoute()
const page: Ref<Page | undefined> = ref()

const { data, error } = await useAsyncData('page', async () => {
	return $directus.request($readItems('pages', {
		fields: ['id', 'title', 'permalink', 'published_at', 'seo', 'blocks.collection', 'blocks.item.*', 'blocks.item.image.*', 'blocks.item.button_group.buttons.*', 'blocks.item.items.*', 'blocks.item.pricing_cards.*', 'blocks.item.pricing_cards.button.*', 'blocks.item.form.*', 'blocks.item.form.fields.*'],
		filter: { title: { _eq: 'Home' } },
	}))
})

if (error.value || !data.value) {
	console.error('Error fetching home page:', error.value)
} else {
	page.value = data.value[0]
}

const blockToComponent = (collectionName: string) => {
	switch (collectionName) {
		default:
			return 'div'
	}
}
</script>
<template>
	 <UContainer class="mt-8">
		<div v-if="page" class="prose dark:prose-invert">
			<h1>{{ page.title }}</h1>
			<div v-for="block in page.blocks" :key="block.id">
				<component :is="blockToComponent(block.collection)" v-bind="block.item"></component>
			</div>
		</div>
		<div v-else>Loading...</div>
	</UContainer>
</template>
```

This page uses the Directus plugin to fetch the home page data which can then be passed to the components as they are created. Note the `v-for` loop which will iterate through the blocks in the home page and render each as a component.

Next, create each component. To work out what properties each component needs use Directus Studio. Go to Settings -> Data Model and select the block corresponding to the component you are creating. For example the Hero block can be found under `blocks` -> `block_hero`. Click on it to the fields and their types. This is how the properties were identified for each component below.

### Hero Section

Create a new file `components/Hero.vue` and add the following code:

```vue
<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui';

const props = defineProps<{
	id: string,
	tagline: string,
	headline: string,
	description: string,
	button_group?: ButtonGroup,
	image: Image,
}>()

const links: Ref<ButtonProps[]> = ref([])

if (props.button_group) {
	for (const button of props.button_group.buttons) {
		links.value.push({
			label: button.label,
			to: button.url || '/',
			variant: (button.variant === "default" ? "solid" : button.variant) as ButtonProps['variant'],
		})
	}
}
</script>
<template>
	<UPageHero
    	:title="headline"
    	:description="description"
    	:headline="tagline"
		:links="links"
		orientation="horizontal"
  	>
	  <img
		:src="'/directus/assets/' + image.id"
		:alt="image.title || ''"
		class="rounded-lg shadow-2xl ring ring-(--ui-border)"
    	/>
	</UPageHero>
</template>
```

This component uses the `UPageHero` component from Nuxt UI Pro. The `props` object is used to define the properties that are passed to the component from Directus CMS. As the properties used for the buttons in DIrectus don't match those used in Nuxt UI they are manipulated and then stored in `links`.

To use the new Hero component import it at the top of the `index.vue` file:

```ts
import Hero from '../components/Hero.vue'
```

Then add it as a `case` to the `blockToComponent` switch statement (just before the `default` case):

```ts
case 'block_hero':
	return Hero
```

Visit `your-website-url` in the browser and you should see the Hero section of the home page properly laid out and with all its data.

### Rich Text Section

Create a new file `components/RichText.vue` and add the following code:

```vue
<script setup lang="ts">
defineProps<{
	id: string,
	tagline: string,
	headline: string,
	content: string,
	alignment: string
}>()
</script>
<template>
	<UPageHero
		:title="headline"
		:headline="tagline">
		<template #description>
			<div v-html="content"></div>
		</template>
	</UPageHero>
</template>
```

To use the new RichText component import it at the top of the `index.vue` file:

```ts
import RichText from '../components/RichText.vue'
```

Then add it as a `case` to the `blockToComponent` switch statement (just before the `default` case):

```ts
case 'block_richtext':
	return RichText
```

Visit `your-website-url` in the browser and you should see the rich text appear formatted below the Hero section.

### Gallery Section

Create a new file `components/Gallery.vue` and add the following code:

```vue
<script setup lang="ts">

const props = defineProps<{
  id: string
  tagline: string
  headline: string
  items: GalleryItem[]
}>()

type GalleryItem = {
	id: string;
	block_gallery: string;
	directus_file: string;
	sort: number;
}
</script>

<template>
  <RichText
	:id="id"
	:tagline="tagline"
	:headline="headline"
	:content="''"
	alignment="center"
  />
  <UCarousel
    v-slot="{ item }"
    loop
    dots
    :autoplay="{ delay: 3000 }"
    :items="items"
    :ui="{ item: 'basis-1/4' }"
	class="w-full mx-auto -mt-36"
  >
    <img :src="'/directus/assets/' + item.directus_file" width="234" height="234" class="rounded-lg">
  </UCarousel>
</template>
```

This component makes use of the existing `RichText` component to display the title and tagline. The `UCarousel` component from Nuxt UI Pro is used to display the images in a carousel format.

To use the new Gallery component import it at the top of the `index.vue` file:

```ts
import Gallery from '../components/Gallery.vue'
```

Then add it as a `case` to the `blockToComponent` switch statement (just before the `default` case):

```ts
case 'block_gallery':
	return Gallery
```

Visit `your-website-url` in the browser and you should see the image gallery carousel displaying thumbnails from Directus.

### Pricing Section

Create a new file `components/Pricing.vue` and add the following code:

```vue
<script lang="ts" setup>

const props = defineProps<{
	id: string
	tagline: string
	headline: string
	pricing_cards: PricingCard[]
}>()
</script>

<template>
	<RichText
		:id="id"
		:tagline="tagline"
		:headline="headline"
		:content="''"
		alignment="center"
	/>
	<UPricingPlans class="-mt-36">
		<UPricingPlan
		v-for="(plan, index) in pricing_cards"
		:key="index"
		:title="plan.title"
		:description="plan.description"
		:features="plan.features"
		:price="plan.price"
		:highlight="plan.is_highlighted"
		/>
	</UPricingPlans>
</template>
```

To use the new Pricing component import it at the top of the `index.vue` file:

```ts
import Pricing from '../components/Pricing.vue'
```

Then add it as a `case` to the `blockToComponent` switch statement (just before the `default` case):

```ts
case 'block_pricing':
	return Pricing
```

Visit `your-website-url` in the browser and you should see the pricing cards at the bottom of the home page.

### Form Section

Create a new file `components/Form.vue` and add the following code:

```vue
<script setup lang="ts">
import { UInput } from '#components';
const { $directus, $createItem } = useNuxtApp()

const props = defineProps<{
	id: string;
	headline: string;
	tagline: string;
	form: FormElement;
}>()

const directusToNuxtUI = (field: FormField) => {
	switch (field.type) {
		case 'text':
			return UInput
	}
}

const state = reactive({
  items: props.form.fields,
})

const onSubmit = (event: Event) => {
	event.preventDefault()
	const formData = new FormData(event.target as HTMLFormElement)
	const data = Object.fromEntries(formData.entries())
}

</script>
<template>
	<RichText
		:id="id"
		:tagline="tagline"
		:headline="headline"
		:content="''"
		alignment="center"
	/>
	<UForm
		:id="id"
		:form="form"
		:fields="form.fields"
		:submitLabel="form.submit_label"
		:successMessage="form.success_message"
		:state="state"
		@submit="onSubmit"
		class="-mt-36 mx-auto max-w-sm"
	>
		<UFormField v-for="field in form.fields" :key="field.id" :label="field.label" :name="field.name">
			<component :is="directusToNuxtUI(field)" v-bind="field"></component>
		</UFormField>

		<UButton type="submit">
		{{ form.submit_label }}
		</UButton>
	</UForm>
</template>
```

To use the new Form component import it at the top of the `index.vue` file:

```ts
import Form from '../components/Form.vue'
```

Then add it as a `case` to the `blockToComponent` switch statement (just before the `default` case):

```ts
case 'block_form':
	return Form
```

### SEO

The Directus CMS template comes with a set of SEO metadata fields that can be displayed for each page. Nuxt comes with a [Head component](https://nuxt.com/docs/getting-started/seo-meta#components) that allows the insertion of this metadata directly in the home page. In `index.vue` add the following code just after `<div v-if="page">`:

```vue
<Head>
	<Title>{{ page.seo?.title || 'Directus CMS Post' }}</Title>
	<Meta name="description" :content="page.seo?.meta_description || ''" />
</Head>
```

Visit your application in the browser and inspect the page. You should see the SEO metadata in the head of the page.

### Header and Footer

The Directus CMS template includes header and footer navigation items. These can be added to the home page by creating a new component for each.
Create a new file `components/Header.vue` and add the following code:

```vue
<script lang="ts" setup>
import type { ArrayOrNested, NavigationMenuItem } from '@nuxt/ui'

const { $directus, $readItems } = useNuxtApp()

const { data, error } = await useAsyncData('navigation', async () => {
	return $directus.request($readItems('navigation', {
		fields: ['id', 'title', 'items.*', 'items.children.*'],
		filter: { id: { _eq: 'main' } },
		limit: 1,
	}))
})

const items: ComputedRef<NavigationMenuItem[]> = computed(() => {
	if (!data.value || !data.value[0]?.items) return []
	
	function mapItem(item: NavigationItem): NavigationMenuItem {
		return {
			id: item.id,
			label: item.title,
			to: item.url ?? undefined,
			children: item.children ? item.children.map(mapItem) : undefined
		}
	}
	
	return data.value[0].items.map(mapItem)
})
</script>
<template>
	<UHeader title="Directus CMS">

	<UNavigationMenu content-orientation="vertical" :items="items" class="w-full justify-center" />

    <template #right>
      <UColorModeButton />
    </template>
  </UHeader>
	
</template>
```

In `index.vue` under the `</head>` tag add the header component: `<Header />`

The footer navigation is similar. Create a new file `components/Footer.vue` and add the following code:

```vue
<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const { $directus, $readItems } = useNuxtApp()

const { data, error } = await useAsyncData('navigation', async () => {
	return $directus.request($readItems('navigation', {
		fields: ['id', 'title', 'items.*', 'items.children.*'],
		filter: { id: { _eq: 'footer' } },
		limit: 1,
	}))
})

const items: ComputedRef<NavigationMenuItem[]> = computed(() => {
	if (!data.value || !data.value[0]?.items) return []
	
	function mapItem(item: NavigationItem): NavigationMenuItem {
		return {
			id: item.id,
			label: item.title,
			to: item.url ?? undefined,
			children: item.children ? item.children.map(mapItem) : undefined
		}
	}
	
	return data.value[0].items.map(mapItem)
})
</script>

<template>
  <USeparator type="solid" class="h-px mt-12" />
  <UFooter>
    <template #left>
      <p class="text-(--ui-text-muted) text-sm">Copyright © {{ new Date().getFullYear() }}</p>
    </template>

    <UNavigationMenu :items="items" variant="link" />

    <template #right>
      <UButton
        icon="i-simple-icons-discord"
        color="neutral"
        variant="ghost"
        to="https://directus.chat/"
        target="_blank"
        aria-label="Discord"
      />
      <UButton
        icon="i-simple-icons-x"
        color="neutral"
        variant="ghost"
        to="https://x.com/directus"
        target="_blank"
        aria-label="X"
      />
      <UButton
        icon="i-simple-icons-github"
        color="neutral"
        variant="ghost"
        to="https://github.com/directus/directus"
        target="_blank"
        aria-label="GitHub"
      />
    </template>
  </UFooter>
</template>
```

In `index.vue` place the footer component (`<Footer />`) just after the closing `<div>` of the `v-for="block in page.blocks"` div.

Visit `your-website-url` in the browser and you should see the completed home page with full navigation header and footer.

## Conclusion

The Directus CMS provides an immediate starting point for a headless content management system. When combined with Nuxt it allows a user to create a modern, flexible website with a powerful CMS backend. This tutorial has shown how to set up Directus and Nuxt, create a home page, and add components to display content from Directus. The next step is to complete the implementation by building out the posts, about and contacts pages.

[You can find a repository with the finished code on GitHub](https://github.com/directus-labs/directus-guest-authoring/tree/master/036-directus-cms-home).
