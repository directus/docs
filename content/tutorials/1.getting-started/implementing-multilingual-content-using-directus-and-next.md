---
slug: implementing-multilingual-content-using-directus-and-next
title: Implementing Multilingual Content using Directus and Next.js
authors:
  - name: Kumar Harsh
    title: Guest Author
description: Learn how to access multilingual Directus content using Next.js.
---

Directus comes with built-in support for creating multilingual content. In this post, you'll learn how to create multilingual content and access it using your Next.js application.

## Before You Start

You will need:

- A Directus project with admin access.
- Fundamental understanding of Next.js (and some React.js) concepts.
- Optional but recommended: Familiarity with data modeling in Directus.

## Set Up Your Directus Project

To get started, set up a Directus project either using [Directus Cloud](https://directus.io/cloud) or by self-hosting it using [Docker](https://docs.directus.io/self-hosted/docker-guide.html). Then, follow the steps below:

### Create a Collection

Create a new collection called posts with the following fields:

- `title` (Type: Input)
- `content` (Type: Markdown)
- `slug` (Type: Input)

### Edit Public Policy

Next, to allow viewing the post as an unauthenticated user, you will need to modify the public [access policy](https://directus.io/docs/guides/auth/access-control).

To do that, navigate to Settings -> Access Policies -> Public. Under `posts`, set a public policy for `read`. This will now allow all posts to be read by unauthenticated users.

### Configure CORS

You may need set your content security policy to allow your Next.js app to access the Directus instance. For example if you are self-hosting, or in development, and using Docker, then you can do this by adding the following environment variable to your `docker-compose.yml` file:

```yml
environment:
  CONTENT_SECURITY_POLICY_DIRECTIVES__FRAME_SRC: your-website-url
```
> Replace `your-website-url` with your Next.js app's URL and the port. eg. if your app URL is in development is `http://localhost:3000`, replace `your-website-url` with `localhost:3000`.

## Set Up Your Next.js Project

Next, create a new Next.js app by running the following command:

```bash
npx create-next-app \
  directus-next-multilingual \
  --js \
  --app \
  --eslint \
  --no-src-dir \
  --no-tailwind \
  --turbopack \
  --import-alias "@/*"
```

Next, change your terminal's working directory into the newly created project directory and install the Directus SDK into it:

```bash
cd directus-next-multilingual
npm i @directus/sdk
```

Now, open the project directory in your code editor to start building the app. First of all, clear out the CSS in `app/globals.css` and replace the code in `app/page.js` with the following:

```js
export default function Home() {
  return <div />
}
```

### Set up Directus
To make it easy to access the Directus instance through the SDK, you should create a helper file that you can import anywhere in your Next.js app. To do that, create a new directory called `lib` in the project directory and save the following code snippet in a file called `directus.js` in it:

```js
import { createDirectus, rest, authentication } from '@directus/sdk';

const BACKEND_URL = "http://localhost:8055/"

const client = createDirectus(BACKEND_URL)
    .with(authentication("json"))
    .with(rest())

export default client;
```

Important: Because Next.js extends the native fetch API with a `force-cache` configuration by default, you may sometimes run into scenarios where Next.js returns stale data. To fix this, update the `rest()` composable to add the following option:

```js
.with(
  rest({
    onRequest: (options) => ({ ...options, cache: 'no-store' }),
  })
)
```

## Creating the Posts page

Now that the Directus integration is ready, create the app page that will display a post using its slug. To do that, create a new file at `./app/[slug]/page.js` and save the following content in it:

```js
import { React } from 'react';
import client from '@/lib/directus';
import { readItems } from '@directus/sdk';

export default async function Page({ params: {slug} }) {

    try {
    const post = await client.request(readItems(
        'posts',
        {filter: { slug: {_eq: slug}}}
    ));

    console.log(post)

	if (!post) {
		return null;
	}

	const { title, content } = post[0];

    return (<div>
        <div>
            <h1>{ title }</h1>
            <p>{ content }</p>
        </div>
    </div>)
    } catch (e) {
        console.log(e)
        return <div>This post does not exist</div>
    }
}
```

Run the app using the `npm run dev` command. Now, you can try creating a new `posts` record in Directus and try going to `http://localhost:3000/<your-slug>` to view it in your Next.js app:

![Viewing a post](/img/viewing-a-post.png)

Now, you are ready to set up content translations!

## Set Up Content Translations

To set up your Directus instance to allow adding content translations, you will need to add a field to the `posts` collection of type [Translations](https://directus.io/docs/guides/data-model/relationships) while keeping all the default settings.

This will create two new collections in your data models list: `languages` and `posts_translations`

![Data model showing the posts_translations and languages collections](/img/new-translation-collections.png)

The `posts_translations` collection is used to retrieve the translation from Next.js, so you need to make this public by navigating to Settings -> Access Policies -> Public and adding `posts_translations` with `read` permissions.

Next, open the `posts_translations` collection, and add the fields `title` and `content` with their corresponding types (matching the ones listed above).

Finally, create post content with relevant translations in 3-4 languages (feel free to use [Google Translate](https://translate.google.com/)).

- `title`: "Chandrayaan: India's Journey in Lunar Exploration"
- `content`:
```md
Chandrayaan is a series of lunar exploration missions developed by the Indian Space Research Organisation (ISRO) to advance India's space capabilities and scientific understanding of the Moon. The program began with Chandrayaan-1, launched in 2008, which was instrumental in confirming the presence of water molecules on the lunar surface. This groundbreaking discovery reshaped our understanding of the Moon’s geology and its potential for future exploration. The spacecraft carried a mix of Indian and international instruments, including NASA’s Moon Mineralogy Mapper, and operated for nearly a year before losing communication.

Building on this success, Chandrayaan-2 was launched in 2019, featuring an orbiter, lander (Vikram), and rover (Pragyan). While the lander failed to achieve a soft landing, the orbiter continues to send valuable data. In 2023, Chandrayaan-3 made history by successfully landing near the Moon’s south pole, making India the first nation to achieve this feat. The mission deployed the Pragyan rover, which conducted in-situ analysis of lunar soil and confirmed the presence of sulfur and other elements. The Chandrayaan program is a testament to India's growing expertise in space exploration and its ambitions for future interplanetary missions.
```
- `slug`: "chandrayaan-for-lunar-exploration"

Click on the "Translations" interface and select the language you want to add the translation for. You will find below the translations in German, French and Spanish but you can add as many additional languages as you like.

#### German Translation

- `title`: "Chandrayaan: Indiens Reise in die Mondforschung"
- `content`:
```md
Chandrayaan ist eine Reihe von Monderkundungsmissionen, die von der Indian Space Research Organisation (ISRO) entwickelt wurden, um Indiens Weltraumkapazitäten und sein wissenschaftliches Verständnis des Mondes zu verbessern. Das Programm begann mit Chandrayaan-1, das 2008 gestartet wurde und maßgeblich zur Bestätigung der Anwesenheit von Wassermolekülen auf der Mondoberfläche beitrug. Diese bahnbrechende Entdeckung hat unser Verständnis der Geologie des Mondes und seines Potenzials für zukünftige Erkundungen verändert. Die Raumsonde trug eine Mischung aus indischen und internationalen Instrumenten, darunter den Moon Mineralogy Mapper der NASA, und war fast ein Jahr lang in Betrieb, bevor die Kommunikation abbrach.

Aufbauend auf diesem Erfolg wurde Chandrayaan-2 2019 gestartet, bestehend aus einem Orbiter, einem Lander (Vikram) und einem Rover (Pragyan). Während der Lander keine weiche Landung hinbekam, sendet der Orbiter weiterhin wertvolle Daten. Im Jahr 2023 schrieb Chandrayaan-3 Geschichte, indem es erfolgreich in der Nähe des Südpols des Mondes landete, womit Indien die erste Nation war, der dieses Kunststück gelang. Die Mission setzte den Rover Pragyan ein, der vor Ort Analysen des Mondbodens durchführte und das Vorhandensein von Schwefel und anderen Elementen bestätigte. Das Chandrayaan-Programm ist ein Beweis für Indiens wachsende Expertise in der Weltraumforschung und seine Ambitionen für zukünftige interplanetare Missionen.
```

#### French Translation

- `title`: "Chandrayaan : le voyage de l'Inde dans l'exploration lunaire"
- `content`:
```md
Chandrayaan est une série de missions d’exploration lunaire développées par l’Organisation indienne de recherche spatiale (ISRO) pour faire progresser les capacités spatiales de l’Inde et sa compréhension scientifique de la Lune. Le programme a débuté avec Chandrayaan-1, lancé en 2008, qui a permis de confirmer la présence de molécules d’eau à la surface lunaire. Cette découverte révolutionnaire a remodelé notre compréhension de la géologie de la Lune et de son potentiel d’exploration future. Le vaisseau spatial transportait un mélange d’instruments indiens et internationaux, dont le Moon Mineralogy Mapper de la NASA, et a fonctionné pendant près d’un an avant de perdre la communication.

Fort de ce succès, Chandrayaan-2 a été lancé en 2019, avec un orbiteur, un atterrisseur (Vikram) et un rover (Pragyan). Bien que l’atterrisseur n’ait pas réussi à atterrir en douceur, l’orbiteur continue d’envoyer des données précieuses. En 2023, Chandrayaan-3 est entré dans l’histoire en atterrissant avec succès près du pôle sud de la Lune, faisant de l’Inde la première nation à réaliser cet exploit. La mission a déployé le rover Pragyan, qui a procédé à des analyses in situ du sol lunaire et a confirmé la présence de soufre et d'autres éléments. Le programme Chandrayaan témoigne de l'expertise croissante de l'Inde en matière d'exploration spatiale et de ses ambitions pour de futures missions interplanétaires.
```

#### Spanish Translation

- `title`: "Chandrayaan: el viaje de la India hacia la exploración lunar"
- `content`:
```md
Chandrayaan es una serie de misiones de exploración lunar desarrolladas por la Organización de Investigación Espacial de la India (ISRO) para mejorar las capacidades espaciales de la India y la comprensión científica de la Luna. El programa comenzó con Chandrayaan-1, lanzado en 2008, que fue fundamental para confirmar la presencia de moléculas de agua en la superficie lunar. Este descubrimiento revolucionario cambió nuestra comprensión de la geología de la Luna y su potencial para la exploración futura. La nave espacial llevaba una combinación de instrumentos indios e internacionales, incluido el Moon Mineralogy Mapper de la NASA, y funcionó durante casi un año antes de perder la comunicación.

Sobre la base de este éxito, Chandrayaan-2 se lanzó en 2019, con un orbitador, un módulo de aterrizaje (Vikram) y un explorador (Pragyan). Si bien el módulo de aterrizaje no logró un aterrizaje suave, el orbitador continúa enviando datos valiosos. En 2023, Chandrayaan-3 hizo historia al aterrizar con éxito cerca del polo sur de la Luna, convirtiendo a la India en la primera nación en lograr esta hazaña. La misión desplegó el explorador Pragyan, que realizó análisis in situ del suelo lunar y confirmó la presencia de azufre y otros elementos. El programa Chandrayaan es un testimonio de la creciente experiencia de la India en exploración espacial y sus ambiciones para futuras misiones interplanetarias.
```

Here's how your post will look once you've added all the translations

![Post collection listing showing 3 translations](/img/post-with-translations.png)

You will see that the "Translations" column shows the number of translations available for each post.

Now, all you need to do is configure your Next.js app to display these translations based on the language request by the client, and you're all done!

## Set Up Language-Based Dynamic Routing

To do that, move the `./app/[slug]/page.js` file to `./app/[lang]/[slug]/page.js`, which adds a slug that allows the user to access one of `en-US`, `es-ES`, `de-DE`, or `fr-FR` translations of the content.

After moving the file, replace its contents with the following:

```js
import { React } from 'react';
import client from '@/lib/directus';
import { readItems } from '@directus/sdk';

export default async function Page({ params }) {

    const { lang, slug } = await params;

    try {
        const post = await client.request(readItems(
            'posts',
            { filter: { slug: { _eq: slug } } }
        )).then((data) => {
            if (lang == "en-US")
                return data

            return client.request(readItems('posts_translations', {
                filter: {
                    posts_id: {
                        _eq: data[0].id
                    },
                    languages_code: {
                        _eq: lang
                    }
                }
            }))
        })

        if (!post) {
            return null;
        }

        const { title, content } = post[0];

        return (<div>
            <div>
                <h1>{title}</h1>
                <p>{content}</p>
            </div>
        </div>)
    } catch (e) {
        console.log(e)
        return <div>This post does not exist</div>
    }
}
```

This code snippet updates the fetching logic for the post. After fetching the post using it's slug, the app checks if `en-US` was the requested language. If not, it queries the `posts_translations` collection with the entered `lang` value and displays that particular translation.

Make sure you restart the Next.js app after you have saved this file, because adding a new slug to the path of the file while the server is running will result in the server throwing errors.

Now, you can try navigating to the language-specific pages to view the relevant content.

For French, navigate to http://localhost:3000/fr-FR/chandrayaan-for-lunar-exploration to view the French version of the page:

![French version](/img/french-version.png)

For Spanish, navigate to http://localhost:3000/es-ES/chandrayaan-for-lunar-exploration to view the Spanish version of the page:

![Spanish version](/img/spanish-version.png)

For German, navigate to http://localhost:3000/de-DE/chandrayaan-for-lunar-exploration to view the German version of the page:

![German version](/img/german-version.png)

And finally for US English, navigate to http://localhost:3000/en-US/chandrayaan-for-lunar-exploration to view the US English version of the page:

![US English version](/img/us-english-version.png)

## Summary

In this blog, you learned how to create multilingual content in Directus and access it in your Next.js application. Using Next.js dynamic routing, you learned how to retrieve the same content based on the language requested in URL.
