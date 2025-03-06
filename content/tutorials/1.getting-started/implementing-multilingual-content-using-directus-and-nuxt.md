---
slug: implementing-multilingual-content-using-directus-and-nuxt
title: Implementing Multilingual Content using Directus and Nuxt
authors:
  - name: Craig Harman
    title: Guest Author
description: Learn how to access multilingual Directus content using Nuxt.
---

Directus comes with built-in support for creating multilingual content. In this post, you'll learn how to create multilingual content and access it using your Nuxt application.

## Before You Start

You will need:

- A Directus project with admin access.
- Fundamental understanding of Nuxt concepts.
- Optional but recommended: Familiarity with data modeling in Directus.

## Set Up Your Directus Project

### Create a Collection

Create a new collection called posts with the following fields:

- `title` (Type: Input)
- `content` (Type: Markdown)
- `slug` (Type: Input)

### Edit Public Policy

So that Nuxt can access the `posts` collection without needing to authenticate navigate to Settings -> Access Policies -> Public
and under `posts` set a public policy for `read`.

### Configure CORS

You may need set your content security policy to allow access to your Nuxt project. For example if you are self-hosting, or in development, and using Docker, then this is achieved by updating your `docker-compose.yml` file as follows:

```yml
environment:
  CONTENT_SECURITY_POLICY_DIRECTIVES__FRAME_SRC: your-website-url
```
> Replace `your-website-url` with your Nuxt URL and the port. eg. If your Nuxt URL is `http://localhost:3000`, replace `your-website-url` with `localhost:3000`.

## Set Up Your Nuxt Project

### Initialize Your Project

Create a new Nuxt project using [Nuxi](https://nuxt.com/docs/api/commands/init):

```bash
npx nuxi@latest init directus-multilingual
cd directus-multilingual
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
	posts_translations: PostTranslation[];
}
interface Post {
	id: number;
	title: string;
	content: string;
	slug?: string;
}

interface PostTranslation {
	id: number;
	title: string;
	content: string;
	languages_code: string;
	posts_id: number;
}
```

### Create a Directus plugin

Create a Nuxt plugin to streamline accessing Directus throughout your application. Create a new file `plugins/directus.ts`
Copy and paste in the code below, replace the `your-website-url` with your Nuxt URL and port:

```ts
import { createDirectus, rest, readItems } from "@directus/sdk";
const directus = createDirectus<DirectusSchema>(
	"http://your-website-url/directus",
).with(rest());
export default defineNuxtPlugin(() => {
	return {
		provide: { directus, readItems },
	};
});
```

## Set Up Content Translations

Add a field to the `posts` collection of type [Translations](https://directus.io/docs/guides/data-model/relationships) keeping all the default settings.
This will create two new collections, `languages` and `posts_translations`

![Data model showing the posts_translations and languages collections](/img/DataModelWithLanguages.png)

The `posts_translations` collection is required to retrieve the translation from Nuxt so make this public by navigating to Settings -> Access Policies -> Public and adding `posts_translations` with `read` permissions.

Open the `posts_translations` collection, and add the fields `title` and `content` with their corresponding types (matching the ones listed above).

Create post content with the according translations in 3 languages (hint: use [Google Translate](https://translate.google.com/)).

- `title`: "Becoming a productive rabbit"
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
- `slug`: "becoming-a-productive-rabbit"

Click on the "Translations" interface and select the language you want to add the translation for. Below is a translation in French, Italian and Portuguese but you can add as many additional languages as you like.

#### French Translation

- `title`: "Devenir un lapin productif"
- `content`:
```md
Les lapins sont connus pour leur rapidité et leur agilité, mais saviez-vous qu'ils peuvent aussi être incroyablement productifs ? Voici quelques conseils pour vous aider à devenir le lapin le plus productif possible :

Fixez-vous des objectifs clairs. Déterminez ce que vous voulez accomplir et établissez un plan pour atteindre vos objectifs.

Utilisez vos capacités naturelles. Les lapins sont rapides, alors utilisez cette vitesse à votre avantage en accomplissant les tâches rapidement et efficacement.

Restez organisé. Gardez votre terrier propre et rangé afin de pouvoir trouver rapidement ce dont vous avez besoin quand vous en avez besoin.

Faites des pauses. Malgré leur réputation d'être rapides, les lapins ont aussi besoin de pauses. Faites de petits sauts pour vous dégourdir les jambes et reposer votre esprit.

Entourez-vous d'influences positives. Faites-vous des amis avec d'autres lapins productifs et apprenez de leurs habitudes.

En suivant ces conseils, vous serez sur la bonne voie pour devenir le lapin le plus productif possible. Alors, sautez et faites avancer les choses !
```

#### Italian Translation

- `title`: "Diventare un coniglio produttivo"
- `content`:
```md
I conigli sono noti per la loro rapidità e agilità, ma sapevi che possono anche essere incredibilmente produttivi? Ecco alcuni suggerimenti per aiutarti a diventare il coniglio più produttivo possibile:

Fissa obiettivi chiari. Determina cosa vuoi ottenere e fai un piano per raggiungerli.

Usa le tue abilità naturali. I conigli sono veloci, quindi usa questa velocità a tuo vantaggio completando i compiti in modo rapido ed efficiente.

Sii organizzato. Tieni la tua tana pulita e in ordine in modo da trovare rapidamente ciò di cui hai bisogno quando ne hai bisogno.

Fai delle pause. Nonostante la loro reputazione di essere veloci, anche i conigli hanno bisogno di pause. Fai dei piccoli salti per sgranchirti le gambe e riposare la mente.

Circondati di influenze positive. Fai amicizia con altri conigli produttivi e impara dalle loro abitudini.

Seguendo questi suggerimenti, sarai sulla buona strada per diventare il coniglio più produttivo possibile. Quindi, salta e fai le cose!
```

#### Portugeuse Translation

- `title`: "Tornando-se um coelho produtivo"
- `content`:
```md
Os coelhos são conhecidos por sua rapidez e agilidade, mas você sabia que eles também podem ser incrivelmente produtivos? Aqui estão algumas dicas para ajudar você a se tornar o coelho mais produtivo que você pode ser:

Estabeleça metas claras. Determine o que você quer alcançar e faça um plano para atingir suas metas.

Use suas habilidades naturais. Os coelhos são rápidos, então use essa velocidade a seu favor completando tarefas de forma rápida e eficiente.

Mantenha-se organizado. Mantenha sua toca limpa e arrumada para que você possa encontrar rapidamente o que precisa quando precisar.

Faça pausas. Apesar de sua reputação de serem rápidos, os coelhos também precisam de pausas. Dê pequenos saltos para esticar as pernas e descansar a mente.

Cerque-se de influências positivas. Faça amizade com outros coelhos produtivos e aprenda com seus hábitos.

Seguindo essas dicas, você estará no caminho certo para se tornar o coelho mais produtivo que você pode ser. Então, comece a pular e faça as coisas!
```

![Post collection listing showing 3 translations](/img/PostsWith3Translations.png)

> Note the "Translations" column showing the number of translations available for each post.

## Set Up Language-Based Dynamic Routing

To map each language and collection with a unique URL use Nuxt's dynamic routing feature. Open `app.vue` and replace the code with the following:

```vue
<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>
```

Create a a new file and folder structure `pages/[lang]/[slug].vue`. Add the following code the file that will retrieve a post based on the slug:

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
		fields: ['id', 'title', 'content', 'slug'],
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

Start your Nuxt project by running `npm run dev` and navigate to `http://localhost:3000/en-US/becoming-a-productive-rabbit`. You should see your post content displayed.

![Post content in English](/img/PostInEnglish.png)

In order to dynamically change the language of the post we also need to request the post by the `lang` parameter supplied in the URL. Replace your `[slug].vue` file with the following:

```vue
<script setup lang="ts">
const { $directus, $readItems } = useNuxtApp()
const route = useRoute()
const post: Ref<Post | null> = ref(null)

const { data, error } = await useAsyncData('post', async () => {
	const slugParam = Array.isArray(route.params.slug) ? route.params.slug[0] : route.params.slug
	const languageCode = Array.isArray(route.params.lang) ? route.params.lang[0] : route.params.lang

	return await $directus.request($readItems('posts', {
		filter: {
			slug: { _eq: slugParam },
		},
		fields: ['id', 'title', 'content'],
		limit: 1
	})).then(data => {
		if (languageCode === 'en-US') {
			return data
		}
		return $directus.request($readItems('posts_translations', {
			filter: {
				posts_id: { _eq: data[0].id },
				languages_code: { _eq: languageCode }
			},
			fields: ['id', 'title', 'content'],
			limit: 1
		}))
	})

})

if (error.value || data.value === null || data.value.length === 0) {
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

Navigate to `http://localhost:3000/fr-FR/becoming-a-productive-rabbit` to see the French translation of the post.

![Post content in French](/img/PostInFrench.png)

The default language in this example is en-US, navigate to `http://localhost:3000/en-US/becoming-a-productive-rabbit` and confirm you see the English version of the post (even though we haven't specifically added a translation).

If we try to navigate to a language we haven't added a translation for, eg. `http://localhost:3000/es-ES/becoming-a-productive-rabbit` we will see a 404 error.

## Summary

In this post, you learned how to create multilingual content in Directus and access it using a Nuxt application. Using Nuxt's dynamic routing the same content can be retrieved based on the language requested in a URL.
