---
slug: integrating-the-directus-visual-editor-with-nuxt
title: Integrating the Directus Visual Editor with Nuxt
technologies:
  - nuxt
authors:
  - name: Craig Harman
    title: Guest Author
description: Learn how to integrate the Directus Visual Editor with Next.js.
---

The Directus Visual Editor module allows you to edit your content live on your site. This article shows you how to integrate it with an existing CMS setup using Nuxt.

## Before You Start

You will need:

- A new Directus project with admin access.

## Set Up Your Directus Project

Start with a Directus Cloud or self-hosted clean install of Directus. Follow the steps below to configure Directus with the necessary collections and permissions.

## Apply the CMS Template

Use the [Directus Template CLI](https://github.com/directus-labs/directus-template-cli) to apply the CMS template for your project. 

First, generate a static token for the admin user by going to the Users Directory. Choose the Administrative User, and scroll down to the Token field and generate a static token. Copy the token and save it. Do not forget to save the user, or you will encounter an "Invalid token" error.

Open your terminal, run the following command, and follow the prompts: 

```bash
npx directus-template-cli@latest apply
```

Choose Community templates, and select the CMS template. Fill in your Directus URL, and select Directus Access Token as the authentication method, filling in the token created earlier.

## Enable the visual editor

In order to enable the Visual Editing package edit your Directus environment variables to include a Content Security Policy (CSP) and cache purging. If you are using `docker-compose.yml` then this is achieved by adding the following 2 lines under the `environment` section:

```yml
  environment:
	CONTENT_SECURITY_POLICY_DIRECTIVES__FRAME_SRC: localhost:3000
    CACHE_AUTO_PURGE: "true"
```

Restart your Directus instance, log into Directus Studio and navigate to the Settings > Settings > Modules and enable the Visual Editor and click save. A new icon will appear in the Directus sidebar.

Navigate to Settings -> Visual Editor and add the URL of your Nuxt website that you want to visually edit within the visual editor module.

## Set Up Your Nuxt Project

Follow the instructions for setting up a Nuxt project in the [Create a CMS using Directus and Nuxt documentation](https://directus.io/docs/tutorials/projects/create-a-cms-using-directus-and-nuxt#set-up-your-nuxt-project). Complete the remainder of the steps in this article to create a Nuxt project that is ready to integrate with the Directus Visual Editor.

A copy of the Directus/Nuxt CMS project from this article is available [here](https://github.com/craigharman/directus-guest-authoring/tree/master/036-directus-cms-home) if you want to skip the setup and go straight to the integration.

### Configure the Directus Visual Editing Package

To allow communication between Directus and the Nuxt website install the [Directus Visual Editor Front End Library](https://directus.io/docs/guides/content/visual-editor/frontend-library) by running the following command:

```bash
npm install @directus/visual-editing
```

## Integrate the Visual Editing Package

The Visual Editing Package requires a way to map our Nuxt content to Directus collections. This is achieved by adding attributes to the HTML elements. 

Start by importing the Visual Editing package into `pages/index.vue`:

```ts
import { apply } from '@directus/visual-editing'
```

Then, add a `mounted` lifecycle hook via the following code:

```ts
onMounted(() => {
	apply({ directusUrl: 'http://localhost:8055' });
})
```

> Note: Replace `http://localhost:8055` with your Directus URL.

Then in each component in `/components`, import the `setAttr` function from the Visual Editing package:

```ts
import { setAttr } from '@directus/visual-editing'
```

Each component will require some specific modifications:

In `components/Hero.vue` replace the `<template>` tag and everything inside it with the following:

```vue
<template>
	<UPageHero
		:data-directus="setAttr({ collection: 'block_hero', item: id, fields: 'tagline, headline, description, button_group, image',
    mode: 'drawer' })"
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

Note the `data-directus` attribute. This informs Directus which collection and items the component is linked to.

Visit the Directus Visual Editor and you will see an edit icon when you mouseover the Header component. Click this and a drawer will open containing all the `fields` provided in the `data-directus` attribute.

The remainder of the components will require similar changes.

`components/RichText.vue`

```vue
<template>
	<UPageHero
		:data-directus="setAttr({
			collection: 'block_richtext', item: id, fields: 'tagline, headline, content', mode: 'drawer'
		})"
		:title="headline"
		:headline="tagline">
		<template #description>
			<div v-html="content"></div>
		</template>
	</UPageHero>
</template>
```

`components/Gallery.vue`

```vue
<template>
  <RichText
  :data-directus="setAttr({collection: 'block_gallery', item: id, fields: 'tagline, headline', mode: 'drawer' })"
	:id="id"
	:tagline="tagline"
	:headline="headline"
	:content="''"
	alignment="center"
  />
  <UCarousel
    :data-directus="setAttr({collection: 'block_gallery', item: id, fields: 'items', mode: 'popover' })"
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

In this component the `mode` has been set to `popover` for the images to allow for a more compact editing view.

`components/Pricing.vue`

```vue
<template>
	<RichText
		:data-directus="setAttr({collection: 'block_pricing', item: id, fields: 'tagline, headline', mode: 'drawer' })"
		:id="id"
		:tagline="tagline"
		:headline="headline"
		:content="''"
		alignment="center"
	/>
	<div class="-mt-36" :data-directus="setAttr({collection: 'block_pricing', item: id, fields: 'pricing_cards', mode: 'drawer' })">
		<UPricingPlans>
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
	</div>
</template>
```

`components/Form.vue`

```vue
<template>
	<RichText
		:data-directus="setAttr({collection: 'block_form', item: id, fields: 'tagline, headline', mode: 'popover' })"
		:id="id"
		:tagline="tagline"
		:headline="headline"
		:content="''"
		alignment="center"
	/>
	<UForm
	:data-directus="setAttr({collection: 'forms', item: form.id, fields: 'fields', mode: 'drawer' })"
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

## Testing the Visual Editor

With all the components set up, go back to the Visual Editor page in Directus Studio and browse the page. Mouseover each component element (and sub-elements) and click the edit icon on each to see how the editing experience works.

## Conclusion 

By coupling frontend elements with Directus fields the Visual Editor gives visual website editors a way to edit content directly on the page.

The editor is more powerful than demonstrated here and also allows for:

- Handling of [sensitive data](https://directus.io/docs/guides/content/visual-editor/frontend-library)
- [Customize the various editable elements](http://localhost:3000/docs/guides/content/visual-editor/customization) beyond their default styles via CSS
- [Manage multiple websites](https://directus.io/docs/guides/content/visual-editor/studio-module) from one Directus instance
