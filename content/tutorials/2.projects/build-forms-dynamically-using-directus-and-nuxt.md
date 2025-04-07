---
slug: build-forms-dynamically-using-directus-and-nuxt
title: Build Forms Dynamically using Directus and Nuxt
authors:
  - name: Craig Harman
    title: Guest Author
description: Learn how to setup Directus fields with Nuxt.
---

Directus' data studio allows you to create data for your collections. You can then leverage these collections with Nuxt to generate dynamic and interactive forms for your application.

## Before You Start

You will need:

- A Directus project with admin access.

- Fundamental understanding of Nuxt concepts.

- Optional but recommended: Familiarity with data modeling in Directus.

## Set Up Your Directus Project

### Create a Collection

Create a new collection called `posts` with the following fields:

- `title` (Type: String) *required

- `content` (Type: markdown) *required

- `slug` (Type: String) *required

- `category` (Type: Dropdown with options of `blog post`, `tutorial` and `announcement`)

- `published` (Type: datetime)

On the data model page for the `posts` collection click on the 3 dots next to the `slug` field and select `half-width` to make the field half the width of the form. Repeat the same for the `category` field.

### Add slug validation

Directus has a default setting that can be applied to the slug field to ensure that only URL safe characters are used however for the sake of illustration we are going to add our own validation to this field which can be shared with Nuxt on the frontend.

Click on the `slug` field then click Validation and create a Regex validation with the expression `^[a-z0-9]+(?:-[a-z0-9]+)*$`. Add a custom validation message `Slug must use URL valid characters` and save.

![Custom validation for slug field](/img/CustomValidation.png)

### Edit Public Policy

To give your Nuxt project access to the posts collection and the field listing, you need to update an Access Policy. Here we will update the public policy as it means we can skip any authentication. In a real project you would want to create a new policy and authenticate to Directus.

Navigate to Settings -> Access Policies -> Public and grant full `create` and `read` access to the `posts` collection and full `read` access to the `directus_fields` collection.

## Set Up Your Nuxt Project

### Initialize Your Project

Create a new Nuxt project using [Nuxi](https://nuxt.com/docs/api/commands/init). Note: You can skip selecting any of the add-on modules, none are required for this project.

```bash
npx nuxi@latest init directus-dynamic-forms
cd directus-dynamic-forms
```

Inside your Nuxt project, install the Directus SDK package by running:

```bash
npm install @directus/sdk
```

### Configuring Nuxt

With Nuxt installed with the Directus SDK you can now configure our project to connect to Directus.

Create a `.env` file with the Directus URL:  

```
API_URL="http://0.0.0.0:8055"
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
  "/directus/**": { proxy: `${import.meta.env.API_URL}/**` },
},
```

This will allow your Nuxt application to access Directus via your Nuxt URL, eg. [http://localhost:3000/directus](http://localhost:3000/directus)


### Define a Directus Schema

TypeScript needs to know what the structure of the Directus data is. To achieve this create a `directus.d.ts` file in the root of our project which defines our schema:

```ts
/// <reference types="@directus/extensions/api.d.ts" />
interface DirectusSchema {
	posts: Post[];
}
interface Post {
	id: number;
	title: string;
	content: string;
	slug?: string;
  category?: string;
  published?: DateTime;
}
```

### Create a Directus plugin

Create a Nuxt plugin to streamline accessing Directus throughout your application. Create a new file `plugins/directus.ts`
Copy and paste in the code below, replace the `your-website-url` with your Nuxt URL and port (eg. localhost:3000):

```ts
import {
	createDirectus,
	rest,
	readFieldsByCollection,
	createItem,
} from "@directus/sdk";
const directus = createDirectus<DirectusSchema>(
	"http://your-website-url/directus",
).with(rest());
export default defineNuxtPlugin(() => {
	return {
		provide: { directus, readFieldsByCollection, createItem },
	};
});
```

This file handles all the interaction with Directus and provides Nuxt with the required Directus SDK features.

## Query the Collection's Fields

Configure Nuxt to use the page router by editing `app.vue` replacing the content with:

```html
<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>
```

This allows us to create a new page in the `pages` directory. Create a new file `pages/posts/new.vue` and add the following code:

```vue
<script setup lang="ts">
const { $directus, $readFieldsByCollection } = useNuxtApp()

const { data, error } = await useAsyncData('posts', async () => {
	return $directus.request($readFieldsByCollection('posts'))
})

if (error.value || data.value === null || data.value.length === 0) {
	console.error(error)
	throw createError({
		statusCode: 404,
		statusMessage: "Page not found"
	})
}

const postFields = data
</script>

<template>
	<div>
		{{ postFields }}
	</div>
</template>

<style scoped>
form {
	display: flex;
	flex-wrap: wrap;
	width: 400px;
}
</style>

<style>
label {
	display: block;
	margin-top: 0.5em;
	margin-bottom: 0.2em;
}

select {
	width: 100%;
}
</style>
```

This code will query the Directus API for the fields of the `posts` collection (using the  `readFieldsByCollection` from the Directus SDK) and display them on the page.

Start the Nuxt project using `npm run dev` and you can see what the response looks like by visiting [http://your-website-url/posts/new](http://your-website-url/posts/new) in your browser. You should see something like this:

```json
[ { "collection": "posts", "field": "id", "type": "integer", "schema": { "name": "id", "table": "posts", "data_type": "integer", "default_value": null, "max_length": null, "numeric_precision": null, "numeric_scale": null, "is_generated": false, "generation_expression": null, "is_nullable": false, "is_unique": false, "is_indexed": false, "is_primary_key": true, "has_auto_increment": true, "foreign_key_column": null, "foreign_key_table": null }, "meta": { "id": 1, "collection": "posts", "field": "id", "special": null, "interface": "input", "options": null, "display": null, "display_options": null, "readonly": true, "hidden": true, "sort": 1, "width": "full", "translations": null, "note": null, "conditions": null, "required": false, "group": null, "validation": null, "validation_message": null } }, { "collection": "posts", "field": "title", "type": "string", "schema": { "name": "title", "table": "posts", "data_type": "varchar", "default_value": null, "max_length": 255, "numeric_precision": null, "numeric_scale": null, "is_generated": false, "generation_expression": null, "is_nullable": true, "is_unique": false, "is_indexed": false, "is_primary_key": false, "has_auto_increment": false, "foreign_key_column": null, "foreign_key_table": null }, "meta": { "id": 2, "collection": "posts", "field": "title", "special": null, "interface": "input", "options": { "placeholder": "Post title" }, "display": null, "display_options": null, "readonly": false, "hidden": false, "sort": 2, "width": "full", "translations": null, "note": null, "conditions": null, "required": true, "group": null, "validation": null, "validation_message": null } }, { "collection": "posts", "field": "content", "type": "text", "schema": { "name": "content", "table": "posts", "data_type": "text", "default_value": null, "max_length": null, "numeric_precision": null, "numeric_scale": null, "is_generated": false, "generation_expression": null, "is_nullable": true, "is_unique": false, "is_indexed": false, "is_primary_key": false, "has_auto_increment": false, "foreign_key_column": null, "foreign_key_table": null }, "meta": { "id": 3, "collection": "posts", "field": "content", "special": null, "interface": "input-rich-text-md", "options": null, "display": null, "display_options": null, "readonly": false, "hidden": false, "sort": 3, "width": "full", "translations": null, "note": null, "conditions": null, "required": true, "group": null, "validation": null, "validation_message": null } }, { "collection": "posts", "field": "slug", "type": "string", "schema": { "name": "slug", "table": "posts", "data_type": "varchar", "default_value": null, "max_length": 255, "numeric_precision": null, "numeric_scale": null, "is_generated": false, "generation_expression": null, "is_nullable": true, "is_unique": false, "is_indexed": false, "is_primary_key": false, "has_auto_increment": false, "foreign_key_column": null, "foreign_key_table": null }, "meta": { "id": 4, "collection": "posts", "field": "slug", "special": null, "interface": "input", "options": null, "display": null, "display_options": null, "readonly": false, "hidden": false, "sort": 4, "width": "full", "translations": null, "note": null, "conditions": null, "required": true, "group": null, "validation": null, "validation_message": null } }, { "collection": "posts", "field": "category", "type": "string", "schema": { "name": "category", "table": "posts", "data_type": "varchar", "default_value": null, "max_length": 255, "numeric_precision": null, "numeric_scale": null, "is_generated": false, "generation_expression": null, "is_nullable": true, "is_unique": false, "is_indexed": false, "is_primary_key": false, "has_auto_increment": false, "foreign_key_column": null, "foreign_key_table": null }, "meta": { "id": 5, "collection": "posts", "field": "category", "special": null, "interface": "select-dropdown", "options": { "choices": [ { "text": "Blog post", "value": "blog_post" }, { "text": "Tutorial", "value": "tutorial" }, { "text": "Announcement", "value": "announcement" } ] }, "display": null, "display_options": null, "readonly": false, "hidden": false, "sort": 5, "width": "full", "translations": null, "note": null, "conditions": null, "required": true, "group": null, "validation": null, "validation_message": null } }, { "collection": "posts", "field": "published", "type": "dateTime", "schema": { "name": "published", "table": "posts", "data_type": "datetime", "default_value": null, "max_length": null, "numeric_precision": null, "numeric_scale": null, "is_generated": false, "generation_expression": null, "is_nullable": true, "is_unique": false, "is_indexed": false, "is_primary_key": false, "has_auto_increment": false, "foreign_key_column": null, "foreign_key_table": null }, "meta": { "id": 6, "collection": "posts", "field": "published", "special": null, "interface": "datetime", "options": null, "display": null, "display_options": null, "readonly": false, "hidden": false, "sort": 6, "width": "full", "translations": null, "note": null, "conditions": null, "required": false, "group": null, "validation": null, "validation_message": null } } ]
```

This data contains all the information about the fields in the collection. Make special note of the meta field `interface` which identifies the form element to be used to manage the field. In this example we have 4 different interfaces:

1. input
2. input-rich-text-md
3. select-dropdown
4. datetime

## Build a form from the data

From the interfaces identified above we can create a Nuxt component for each but first lets create a generic component that can handle the different interfaces. In `components/DirectusFormElement.vue` add the following code:

```vue
<script setup lang="ts">

import type { DirectusField } from '@directus/sdk'
import Input from './Input.vue'
import TextArea from './TextArea.vue'
import Select from './Select.vue'
import DateTime from './DateTime.vue'

const props = defineProps<{
	field: DirectusField
}>()

const fieldLookup = computed(() => {
	switch (props.field.meta.interface) {
		case 'input':
			return Input
		case 'input-rich-text-md':
			return TextArea
		case 'select-dropdown':
			return Select
		case 'datetime':
			return DateTime
		default:
			return Input
	}
})
</script>

<template>
	<component v-if="!field.meta.hidden" :key="field.field" :is="fieldLookup" :field="field.field"
		:width="field.meta.width" :defaultValue="field.schema.default_value" :label="field.meta.field"
		:options="field.meta.options" />
</template>
```

This component will take a field and render the appropriate custom component based on the `interface` meta field. If the field is hidden (based on the value of  `field.meta.hidden`) it will not render a component.

We can add it to the `new.vue` page by updating the `<template>` section as follows:

```vue
<template>
	<h1>New Post</h1>
	<form>
		<DirectusFormElement v-for="field in postFields" :key="field.field" :field="field" />
	</form>
</template>
```

This is looping through all the fields in the `posts` collection and rendering the appropriate Nuxt form element for each field.
Now we can create the individual components for each interface.

Each component will use properties from the Directus field to assist with rendering the form element. For example, the `input` interface will use the `default_value` and `label` properties to set the default value and label of the input field. We also maintain the form layout from directus via the half and full widths.

### input

Create a new file `components/Input.vue` and add the following code:

```vue
<script setup lang="ts">
const props = defineProps<{
	defaultValue?: string
	label?: string
	options: Record<string, any> | null
	width: string | null
	field: string
	required: boolean
	modelValue?: string
}>()

const emit = defineEmits(['update:modelValue'])

const fieldWidth = props.width === 'full' ? '100%' : '50%'

const inputValue = computed({
	get() {
		return props.modelValue || props.defaultValue || ''
	},
	set(value) {
		emit('update:modelValue', value)
	}
})
</script>
<template>
	<div :style="'width: ' + fieldWidth + ';'">
		<label for="field">{{ label }}</label>
		<input :name="field" v-model="inputValue" type="text" :required="required" />
	</div>
</template>

<style scoped>
input {
	width: 100%;
}
</style>
```

### input-rich-text-md

We will use a text area to handle the markdown content, in reality you would want to select a markdown WYSIWYG component.
Create a new file `components/TextArea.vue` and add the following code:

```vue
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
	defaultValue?: string
	label?: string
	width: string | null
	field: string
	required: boolean
	options: Record<string, any> | null
	modelValue?: string
}>()

const emit = defineEmits(['update:modelValue'])

const fieldWidth = props.width === 'full' ? '100%' : '50%'

const textAreaValue = computed({
	get() {
		return props.modelValue || props.defaultValue || ''
	},
	set(value) {
		emit('update:modelValue', value)
	}
})
</script>

<template>
	<div :style="'width: ' + fieldWidth + ';'">
		<label for="field">{{ label }}</label>
		<textarea :name="field" v-model="textAreaValue" rows="12" :required="required" />
	</div>
</template>

<style scoped>
textarea {
	width: 100%;
}
</style>
```

### select-dropdown

This component is similar to the others but it makes use of the `options` property to populate the select dropdown options.
Create a new file `components/Select.vue` and add the following code:

```vue
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
	defaultValue?: string
	label?: string
	options: Record<string, any>
	width: string | null
	field: string
	required: boolean
	modelValue?: string
}>()

const emit = defineEmits(['update:modelValue'])

const fieldWidth = props.width === 'full' ? '100%' : '50%'

const selectValue = computed({
	get() {
		return props.modelValue || props.defaultValue || ''
	},
	set(value) {
		emit('update:modelValue', value)
	}
})
</script>
<template>
	<div :style="'width: ' + fieldWidth + ';'">
		<label for="field">{{ label }}</label>
		<select :name="field" v-model="selectValue" :required="required">
			<option v-for="choice in options.choices" :key="choice.value" :value="choice.value">{{ choice.text }}
			</option>
		</select>
	</div>
</template>
```

### datetime

Create a new file `components/DateTime.vue` and add the following code:

```vue
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
	defaultValue?: string
	label?: string
	width: string | null
	field: string
	required: boolean
	options: Record<string, any> | null
	modelValue?: string
}>()

const emit = defineEmits(['update:modelValue'])

const fieldWidth = props.width === 'full' ? '100%' : '50%'

const dateTimeValue = computed({
	get() {
		return props.modelValue || props.defaultValue || ''
	},
	set(value) {
		emit('update:modelValue', value)
	}
})
</script>

<template>
	<div :style="'width: ' + fieldWidth + ';'">
		<label for="field">{{ label }}</label>
		<input :name="field" v-model="dateTimeValue" type="datetime-local" :required="required" />
	</div>
</template>

<style scoped>
input {
	width: 100%;
}
</style>
```

If you visit the create post page at [http://your-website-url/posts/new](http://your-website-url/posts/new) you should see a form with the fields from the `posts` collection.

## Validate and Save the Data

While Directus validates data on the server-side we can use the validations from the field data to validate on the client side. You can see from the component code above that the components are already checking the Directus `required` property and adding this to the form element to use default HTML validation.

When we created the `posts` collection we added a regular expression valadation to the `slug` field. We can use this validation on the client side to ensure the slug is URL safe before submitting it to Directus.

Doing this will require changes to the `pages/new.vue` file to add validation and submission logic:

```vue
<script setup lang="ts">

const { $directus, $readFieldsByCollection, $createItem } = useNuxtApp()

const { data, error } = await useAsyncData('posts', async () => {
	return $directus.request($readFieldsByCollection('posts'))
})

if (error.value || data.value === null || data.value.length === 0) {
	console.error(error)
	throw createError({
		statusCode: 404,
		statusMessage: "Page not found"
	})
}

const postFields = data

const form = ref({})
const formError: Ref<string | null> = ref(null)
const formSuccess: Ref<string | null> = ref(null)

const submitForm = async () => {
	formError.value = null
	formSuccess.value = null
	// Validate form data against field validation rules
	for (const field of postFields.value) {
		if (field.meta?.validation) {
			try {
				const validation = field.meta.validation
				if (validation._and) {
					for (const rule of validation._and) {
						const fieldName = Object.keys(rule)[0]
						if (rule[fieldName]._regex) {
							const regex = new RegExp(rule[fieldName]._regex)
							if (!regex.test(form.value[field.field])) {
								formError.value = field.meta.validation_message || field.meta.field + ' failed validation'
								console.error(`Validation failed for ${field.field}: ${field.meta.validation_message || 'Invalid format'}`)
								return // Stop submission if validation fails
							}
						}
					}
				}
			} catch (err) {
				console.error(`Error parsing validation for ${field.field}:`, err)
			}
		}
	}

	const result = await $directus.request($createItem('posts', form.value))
	if (result.error) {
		formError.value = result.error.message
		console.error('Error creating post:', result.error)
		return // Stop submission if error occurs
	}
	formSuccess.value = 'Post created successfully'
}
</script>

<template>
	<h1>New Post</h1>
	<div v-if="formError" class="error">{{ formError }}</div>
	<div v-else-if="formSuccess" class="success">{{ formSuccess }}</div>
	<form @submit.prevent="submitForm">
		<DirectusFormElement v-for="field in postFields" :key="field.field" :field="field"
			v-model="form[field.field]" />
		<button type="submit">Submit</button>
	</form>
</template>

<style scoped>
form {
	display: flex;
	flex-wrap: wrap;
	width: 400px;
}

button {
	margin-top: 1em;
}

.error {
	color: red;
}

.success {
	color: green;
}
</style>

<style>
label {
	display: block;
	margin-top: 0.5em;
	margin-bottom: 0.2em;
}

select {
	width: 100%;
}
</style>
```

The form will now allow submission of the data to Directus but will first go through a validation process in the `submitForm` function. This function loops through each field looking for Directus validation rules and then executes them. If any validation fails the form will not submit and an error message will be displayed.

This example is limited to the regex validation we added to the `slug` field. You can expand this to include other validation rules from Directus.

## Summary

The `readFieldsByCollection` method from the Directus SDK allows you to query the fields of a collection and dynamically generate fully validated forms in Nuxt.

From here you could expand the example to include more complex validation rules, custom form elements, an edit form or dynamically display and handle relational data.
