---
slug: create-a-cms-using-directus-and-astro
title: Create a CMS using Directus and Astro
technologies:
  - astro
authors:
  - name: Carmen Huidobro
    title: Developer Educator
description: Learn how to create a CMS using Directus and Astro.
---

# Create a CMS using Directus and Astro

Directus provides a headless CMS, which when combined with Astro will streamline content management. This post covers how to connect them to create a flexible, modern content management system.

## Before You Start

You will need:

- A new Directus project with admin access. you can use [Directus Cloud](https://directus.cloud/) or [run it yourself](https://directus.io/docs/self-hosting/overview).
- Optional but recommended: Familiarity with data modeling in Directus.
- Basic knowledge of Astro and JavaScript.

## Set Up Your Directus Project

Configure Directus with the necessary collections and permissions.

### Apply the CMS Template

Use the [Directus Template CLI](https://github.com/directus-labs/directus-template-cli) to apply the CMS template for your project. 

First, generate a static token for the admin user by going to the Users Directory. Choose the Administrative User, and scroll down to the Token field and generate a static token. Copy the token and save it. Do not forget to save the user, or you will encounter an "Invalid token" error.

![Token generation in Directus](/img/astro-token-generation.png)

In the directory where you have your `docker-compose.yml` or where you have Directus configured, open your terminal, run the following command: 

```bash
npx directus-template-cli@latest apply
```

When prompted, choose **Community templates**, and select the **CMS template**. Fill in your Directus URL, and select Directus Access Token as the authentication method, filling in the token created earlier.

This will create the necessary collections and fields in your Directus project. You can check the collections created by going to the **Data Model** page in your Directus project.

![CMS Template in Directus](/img/astro-cms-data.png)

## Set Up Your Astro Project

It is now time to build the front end of the project. Astro is a static site generator that allows you to create fast, modern websites. Using the data from Directus, you can create a dynamic site that pulls in content from the CMS at build time and render the page as a static HTML file.

### Initialize Your Project

Create a new Astro project by running the command:

```bash
npx create-astro@latest astro-cms
```

When prompted, select the following configurations:

```bash
How would you like to start your new project? A basic, minimal starter (recommended)
Install dependencies? (recommended) Yes
Initialize a new git repository? (optional) No
```

Navigate into the project directory and install the Directus SDK by running the command:

```bash
npm install @directus/sdk
```

Next, run the command `npm run dev` to start the development server and you should have the Astro project running on `http://localhost:4321/` in your browser.

Open the `astro-cms` directory in an text editor of your choice to start building with Astro.

### Configure the Directus SDK

First, create a `.env` file in the root of your project and add the following environment variables:

```bash
DIRECTUS_URL=https://your-directus-project-url.com
```

In the `src` directory, create a `lib` directory and inside of it, create a `directus.ts` file to set up your Directus client instance:

```ts
/// <reference types="vite/client" />
import { createDirectus, readItems, rest } from "@directus/sdk";


const DIRECTUS_URL = import.meta.env.DIRECTUS_URL;
const client = createDirectus(DIRECTUS_URL).with(rest());

export default client;
```

This will create a Directus client instance with the REST API. You can also use GraphQL if you prefer.

Now that you have the client set up, you can start fetching data from your Directus project and creating components to render for the pages.

## Create the Home Page

Before moving further with creating any pages, head over to Directus to have a look at the data structure and content that was created by the starter template.

In your Dashboard, you'll find pages structure and content already created such as, the Homepage, Contact Us, About, Blog etc.

In this tutorial, we will focus only on the home page. The home page is a great place to start as it contains most of the components that you will be using throughout your project.

This is how the home page looks like from the Directus Dashboard, notice the different sections that are already created for you:
![Home Page in Directus](/img/astro-cms-homepage.png)

In the home page, you will find the following sections:

- Hero Section
- Rich Text Section
- Gallery Section
- Pricing Section
- Form Section
- SEO, Header and Footer

You will create a component for each of these sections and then fetch the date of the home page from Directus to render the sections based on the data fetched.

Before you start creating the components, first fetch the data from Directus.

Update the `directus.ts` file, to include a `getPageData` function that will fetch the data for any page based on the slug. This function will be used to fetch the data for the home page:

```ts
export async function getPageData(slug: string) {
  try {
    const pages = await client.request(
      readItems("pages", {
        fields: ["*",
        "blocks.*",
        "blocks.item.*.*.*.*",],
        filter: {
          permalink: {
            _eq: slug,
          },
        },
        limit: 1, // Fetch only one page
      })
    );

    if (pages.length === 0) {
      throw new Error(`Page with slug "${slug}" not found.`);
    }

    return {
      data: pages[0], // Return the first (and only) page
      error: null,
    };
  } catch (error) {
    console.error(`Failed to fetch page with slug "${slug}":`, error);
    return {
      data: null,
      error: `Failed to fetch page with slug "${slug}". Please try again later.`,
    };
  }
}
```

The function above will fetch the page data based on the slug passed to it. Since there are multiple blocks in the page, you can use the `blocks` field to fetch all the blocks in the page.

The `blocks.item` field will fetch the data for each block and the `blocks.item.*.*.*` field will fetch the data nested deep for each item in the block.
This will allow you to fetch all the data for the page in one request.

Now that you have the data fetching function set up, you can create the components for each section of the home page.

### Create a BlocksToComponents Component

Before creating the components for each section, you need a component that will map each of the blocks coming from the `getPageData` request and render the appropriate component based on the block collection type.

To do this, create a new file in the `src/components` directory called `BlocksToComponents.astro` and add the following code:

```astro
---
import Hero from "./Hero.astro";
import RichText from "./RichText.astro";
import Pricing from "./Pricing.astro";
import Form from "./Form.astro";
import Gallery from "./Gallery.astro";

const { blocks } = Astro.props;
---

{
  blocks.map((block: any) => {
    const View =
      block.collection === "block_hero"
        ? Hero
        : block.collection === "block_richtext"
          ? RichText
          : block.collection === "block_pricing"
            ? Pricing
            : block.collection === "block_form"
              ? Form
              : block.collection === "block_gallery"
                ? Gallery
                : () => null;
    return View && <View {...block} />;
  })
}
```

The code above:

- Imports the components for each block type.
- Maps through the blocks and checks the `collection` field to determine which component to render.
- Renders the appropriate component and passes the block data as props.
- If the block type is not found, it returns null.
- The `View` variable is a function that returns the component to be rendered.
- The `blocks` prop is passed to the component from the parent component.

To use this component, you will need to import it in the home page component and pass the blocks data to it.

Update the `src/pages/index.astro` file to include the following code:

```astro
---
import Layout from "../layouts/Layout.astro";
import { getPageData } from "../lib/directus";
import BlocksToComponents from "../components/BlocksToComponents.astro";

const { data, error } = await getPageData("/");

if (error) {
  console.error("Error fetching page data:", error);
  throw new Error("Failed to fetch page data");
}
---

<Layout>
   <BlocksToComponents blocks={data?.blocks} />
</Layout>
```

The code above fetches the data for the home page using the `getPageData` function and passes the blocks data to the `BlocksToComponents` component.

At the moment, if you open the home page in your browser, you will get an error because the components for each section are not created yet. You will create them in the next step.

To see the data being passed to the `BlocksToComponents` component, add a console log to the page:

```js
console.log("Page data:" data)
```

This will log the blocks data to the console, and you can check if the data is being passed correctly.

![Console log of blocks data](/img/astro-logs.png)

To also avoid the error of the components not being found, you can create an empty component for each section in the `src/components` directory. For example, `Hero.astro`, `RichText.astro`, `Pricing.astro`, `Form.astro`, and `Gallery.astro`.

You will now create the components for each section of the home page.

### Hero Section

Create a new file in the `src/components` directory called `Hero.astro` and add the following code:

```astro
---
import { Image } from "astro:assets";

interface HeroProps {
  id: string;
  sort: number;
  collection: string;
  hide_block: boolean;
  background: string;
  item: {
    headline: string;
    id: string;
    description: string;
    tagline: string;
    layout: "image_right" | "image_left" | "image_center" | null;
    image?: {
      id: string;
      storage: string;
      filename_disk: string;
      width: number;
      height: number;
      title: string;
    };
    button_group?: {
      id: string;
      sort: number | null;
      buttons: Array<{
        id: string;
        label: string;
        url?: string;
        variant: string;
        page?: {
          permalink: string;
        };
        post?: {
          slug: string;
        };
      }>;
    };
  };
}

const { background, item: { headline, description, tagline, layout, image, button_group } } = Astro.props as HeroProps;

const DIRECTUS_URL = import.meta.env.DIRECTUS_URL;
---

<section class={`hero ${background} ${layout}`}>
  <div class="hero-content">
    <span class="tagline">{tagline}</span>
    <h1>{headline}</h1>
    <p>{description}</p>
    {button_group?.buttons && (
      <div class="button-group">
        {button_group.buttons.map((button) => (
          <a
            href={button.url || button.page?.permalink || button.post?.slug || "#"}
            target={button.url ? "_blank" : "_self"}
            class="button"
          >
            {button.label}
          </a>
        ))}
      </div>
    )}
  </div>
  {image && (
    <div class="hero-image-container">
      <Image
        src={`${DIRECTUS_URL}/assets/${image.filename_disk}`}
        alt={image.title}
        width={image.width}
        height={image.height}
        class="hero-image"
      />
    </div>
  )}
</section>

<style>
  .hero {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    gap: 2rem;
    background-color: #ffffff;
  }

  .hero.dark {
    background-color: #333333;
    color: #ffffff; 
  }

  .hero.image_center {
    flex-direction: column;
  }

  .hero.image_left {
    flex-direction: row-reverse;
  }

  .hero.image_right {
    flex-direction: row;
  }

  .hero-content {
    max-width: 600px;
    text-align: center;
  }

  .hero.image_left .hero-content,
  .hero.image_right .hero-content {
    text-align: left;
  }

  h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: #333333;
  }

  p {
    font-size: 1.125rem;
    margin-bottom: 1rem;
    color: #555555;
  }

  .tagline {
    font-size: 1rem;
    font-style: italic;
    color: #888888; 
    margin-bottom: 2rem;
  }

  .hero-image-container {
    flex-shrink: 0;
    max-width: 100%;
  }

  .hero-image {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
  }

  .button-group {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .hero.image_center .button-group {
    justify-content: center;
  }

  .button {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: bold;
    text-decoration: none;
    color: #ffffff;
    background-color: #007bff;
    border-radius: 4px;
    transition: background-color 0.3s ease;
  }

  .button:hover {
    background-color: #0056b3; 
  }

  .button:active {
    background-color: #003f7f; 
  }
</style>
```

The code above creates a hero section that displays the headline, description, tagline, and image. It also includes a button group that links to URL coming from the CMS.

Also based on the layout, it will render the image on the left or right side of the text.

Save the file and open the home page in your browser. You should see the hero section rendered with the data from Directus.

![Hero Section](/img/astro-hero-section.png)

Nice! Now you have the hero section rendered with the data from the CMS.

Using this same approach, create the components for the other sections of the home page.

### Rich Text Section

Create a new file in the `src/components` directory called `RichText.astro` and add the following code:

```astro
---
interface RichTextProps {
  id: string;
  sort: number;
  hide_block: boolean;
  background: string;
  item: {
    content: string;
    headline: string;
    id: string;
    alignment: "left" | "center";
    tagline: string;
  };
}

const { background, item: { content, headline, alignment, tagline } } = Astro.props as RichTextProps;
---

<section class={`richtext ${background}`} style={`text-align: ${alignment};`}>
  <div class="richtext-content">
    <span class="tagline">{tagline}</span>
    <h2>{headline}</h2>
    <div class="content" set:html={content}></div>
  </div>
</section>

<style>
  .richtext {
    padding: 4rem 2rem;
    background-color: #ffffff;
    color: #333333;
  }

  .richtext.dark {
    background-color: #333333;
    color: #ffffff;
  }

  .richtext-content {
    max-width: 800px;
    margin: 0 auto;
  }

  .tagline {
    display: block;
    font-size: 1rem;
    font-style: italic;
    color: #888888;
    margin-bottom: 1rem;
  }

  h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: #333333;
  }

  .content {
    font-size: 1.125rem;
    line-height: 1.6;
    color: #555555;
  }
</style>
```

This will create a rich text section that displays the content, headline, and tagline. The alignment of the text can be set to left or center based on the data from Directus.

![Rich Text Section](/img/astro-richtext-section.png)

### Gallery Section

Create a new file in the `src/components` directory called `Gallery.astro` and add the following code:

```astro
---
import { Image } from "astro:assets";

interface GalleryItem {
  directus_file: {
    id: string;
    filename_disk: string;
    title: string;
    width: number;
    height: number;
  };
}

interface GalleryProps {
  id: string;
  sort: number;
  page: string;
  collection: string;
  hide_block: boolean;
  background: string;
  item: {
    headline: string;
    id: string;
    tagline: string;
    items: Array<GalleryItem>;
  };
}

const { background, item: { headline, tagline, items } } = Astro.props as GalleryProps;

const DIRECTUS_URL = import.meta.env.DIRECTUS_URL;
---

<section class={`gallery ${background}`}>
  <div class="gallery-header">
    <span class="tagline">{tagline}</span>
    <h2>{headline}</h2>
  </div>
  <div class="gallery-grid">
    {items.map((item) => (
      <div class="gallery-item">
        <Image
          src={`${DIRECTUS_URL}/assets/${item.directus_file.filename_disk}`}
          alt={item.directus_file.title}
          width={item.directus_file.width}
          height={item.directus_file.height}
          class="gallery-image"
        />
      </div>
    ))}
  </div>
</section>

<style>
  .gallery {
    padding: 4rem 2rem;
    background-color: #e2e8f0;
    color: #333333;
  }

  .gallery.light {
    background-color: #ffffff;
    color: #333333;
  }

  .gallery-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .tagline {
    display: block;
    font-size: 1rem;
    font-style: italic;
    color: #888888;
    margin-bottom: 1rem;
  }

  h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: #333333;
  }

  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 2rem;
  }

  .gallery-item {
    background-color: #444444;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .gallery-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
  }

  .gallery-image {
    width: 100%;
    height: auto;
    display: block;
  }

  .gallery-item-content {
    padding: 1rem;
  }

  .gallery-item-content h3 {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
    color: #ffffff;
  }

  .gallery-item-content p {
    font-size: 1rem;
    color: #cccccc;
  }
</style>
```

This will create a gallery section that displays the headline, tagline, and images. The images fetched from the CMS will be displayed in a grid layout.

![Gallery Section](/img/astro-gallery-section.png)

### Pricing Section

Create a new file in the `src/components` directory called `Pricing.astro` and add the following code:

```astro
---
interface PricingCard {
  id: string;
  title: string;
  description: string;
  price: string;
  badge?: string | null;
  features: string[];
  is_highlighted: boolean;
  button: {
    label: string;
    url: string;
  };
}

interface PricingProps {
  id: string;
  sort: number;
  page: string;
  collection: string;
  hide_block: boolean;
  background: string;
  item: {
    id: string;
    headline: string;
    tagline: string;
    pricing_cards: Array<PricingCard>;
  };
}

const {
  background,
  item: { headline, tagline, pricing_cards },
} = Astro.props as PricingProps;
---

<section class={`pricing ${background}`}>
  <div class="container">
    <div class="pricing-header">
      <span class="tagline">{tagline}</span>
      <h2>{headline}</h2>
    </div>
    <div class="pricing-grid">
      {
        pricing_cards.map((card) => (
          <div
            class={`pricing-card ${card.is_highlighted ? "highlighted" : ""}`}
          >
            {card.badge && <span class="badge">{card.badge}</span>}
            <h3 class="card-title">{card.title}</h3>
            <p class="card-description">{card.description}</p>
            <p class="card-price">{card.price}</p>
            <ul class="card-features">
              {card.features.map((feature, index) => (
                <li>{feature}</li>
              ))}
            </ul>
            <a href={card.button.url} class="card-cta">
              {card.button.label}
            </a>
          </div>
        ))
      }
    </div>
  </div>
</section>

<style>
  .pricing {
    padding: 4rem 2rem;
    background-color: #fff;
    color: #333; 
  }

  .container {
    max-width: 900px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  .pricing.dark {
    background-color: #333;
    color: #fff;
  }

  .pricing-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .tagline {
    display: block;
    font-size: 1rem;
    font-style: italic;
    color: #888;
    margin-bottom: 1rem;
  }

  h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: #333; 
  }

  .pricing-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    width: 100%;
  }

  .pricing-card {
    background-color: #fff;
    border-radius: 8px;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease;
    position: relative;
  }

  .pricing-card.highlighted {
    border: 2px solid #007bff;
    transform: scale(1.05);
    background-color: #f3f6f8;
  }

  .badge {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background-color: #007bff;
    color: #fff;
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
    font-weight: bold;
    border-radius: 4px;
  }

  .card-title {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: #333;
  }

  .card-description {
    font-size: 1rem;
    margin-bottom: 1rem;
    color: #555; 
  }

  .card-price {
    font-size: 1.25rem;
    font-weight: bold;
    margin-bottom: 1rem;
    color: #007bff; 
  }

  .card-features {
    list-style: none;
    padding: 0;
    margin: 0 0 1rem;
  }
 .card-features li:before {
    content: "✓";
    color: #38a169;
    font-weight: bold;
    margin-right: 10px;
  }
  .card-features li {
    font-size: 1rem;
    margin-bottom: 0.5rem;
    color: #555; 
  }

  .card-cta {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: bold;
    text-decoration: none;
    color: #fff; 
    background-color: #007bff;
    border-radius: 4px;
    transition: background-color 0.3s ease;
  }

  .card-cta:hover {
    background-color: #0056b3;
  }
</style>
```

The code above creates a pricing section that displays the headline, tagline, and pricing cards. Each card includes a title, description, price, features, and a button.

![Pricing Section](/img/astro-pricing-section.png)

### Form Section

Create a new file in the `src/components` directory called `Form.astro` and add the following code:

```astro
---
interface FormField {
  id: string;
  name: string;
  type: "text" | "email" | "textarea" | "checkbox" | "radio" | "select";
  label: string;
  placeholder?: string | null;
  required: boolean;
  choices?: Array<{ label: string; value: string }> | null; // For select, radio, or checkbox fields
}

interface FormProps {
  id: string;
  sort: number | null;
  page: string;
  hide_block: boolean;
  background: string;
  item: {
    id: string;
    headline: string;
    tagline: string;
    form: {
      id: string;
      title: string;
      is_active: boolean;
      submit_label: string;
      on_success: "message" | "redirect";
      success_message: string;
      success_redirect_url?: string | null;
      fields: Array<FormField>;
    };
  };
}

const {
  background,
  item: { headline, tagline, form },
} = Astro.props as FormProps;

let formData: Record<string, string> = {};
let message = '';
let error = false;

if (Astro.request.method === "POST") {
  try {
    const data = await Astro.request.formData();

    if (!error) {
      message = form.success_message;
    }
  } catch (error: any) {
    console.error('Error submitting the form', error);
    error = true;
    message = error.message || 'Failed to create post';
  }
}

---

<section class={`form-section ${background}`}>
  <div class="form-header">
    <span class="tagline">{tagline}</span>
    <h2>{headline}</h2>
  </div>
  <form class="newsletter-form" method="post">
    {form.fields.map((field) => (
      <div class="form-field" >
        <label for={field.name}>
          {field.label}
          {field.required && <span class="required">*</span>}
        </label>
        {field.type === "text" || field.type === "email" ? (
          <input
            type={field.type}
            id={field.name}
            name={field.name}
            placeholder={field.placeholder || ""}
            required={field.required}
          />
        ) : field.type === "textarea" ? (
          <textarea
            id={field.name}
            name={field.name}
            placeholder={field.placeholder || ""}
            required={field.required}
          ></textarea>
        ) : field.type === "select" && field.choices ? (
          <select id={field.name} name={field.name} required={field.required}>
            {field.choices.map((choice) => (
              <option value={choice.value}>
                {choice.label}
              </option>
            ))}
          </select>
        ) : null}
      </div>
    ))}
    <button type="submit" class="submit-button">{form.submit_label}</button>
  </form>
  <div id="form-success-message" class="success-message hidden">
    {form.success_message}
  </div>
</section>


<style>
  .form-section {
    padding: 4rem 2rem;
    background-color: #ffffff;
    color: #333;
  }

  .form-section.dark {
    background-color: #333;
    color: #fff;
  }

  .form-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .tagline {
    display: block;
    font-size: 1rem;
    font-style: italic;
    color: #888;
    margin-bottom: 1rem;
  }

  h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  .newsletter-form {
    max-width: 600px;
    margin: 0 auto;
  }

  .form-field {
    margin-bottom: 1.5rem;
  }

  .form-field label {
    display: block;
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }

  .form-field .required {
    color: red;
    margin-left: 0.25rem;
  }

  .form-field input,
  .form-field textarea,
  .form-field select {
    width: 100%;
    padding: 0.75rem;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .form-field textarea {
    resize: vertical;
  }

  .submit-button {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: bold;
    color: #fff;
    background-color: #007bff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .submit-button:hover {
    background-color: #0056b3;
  }

  .success-message {
    margin-top: 2rem;
    text-align: center;
    font-size: 1.25rem;
    color: #28a745;
  }

  .success-message.hidden {
    display: none;
  }
</style>
```

This will create a form section that displays the headline, tagline, and a form with fields coming from the CMS.

![Form Section](/img/astro-form-section.png)

### SEO, Header and Footer

The data coming from the CMS also includes SEO, header and footer data. You can use the `Layout` component to render the header and footer.

The `Layout` component is already created for you in the `src/layouts` directory. You can use the `Layout` component to render the header and footer.

Each page coming from the CMS has its own SEO data. You can use the `seo` field to set the title, description, and keywords for each page.

To do this, update rendering of the `Layout` component in the `src/pages/index.astro` file to include the SEO data:

```astro
<Layout seo={data?.seo}>
   <BlocksToComponents blocks={data?.blocks} />
</Layout>
```

Next, update the `src/layouts/Layout.astro` file to include the SEO data:

```astro
---

const { seo } = Astro.props;
const { title, description } = seo || { title: "Default Title", description: "Default Description" };
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="description" content={description} />
    <title>{title}</title>
  </head>
  <body>

    <slot />
  </body>
</html>

```

The code above will set the title and description for each page based on the data coming from the CMS. If the SEO data is not available, it will use the default title and description.

The CMS also has a navigation collection that has a header and footer data. You can use the `header` and `footer` fields to set the header and footer in the `Layout` component so it is reuseable for all pages.

To do this, you first need the header and footer data from the CMS.

In the `src/lib/directus.ts` file, create a new function called `getNavigation` that will fetch the header and footer data from the CMS:

```ts
interface NavigationItem {
  id: string;
  sort: number;
  title: string;
  type: "page" | "url" | "group";
  url?: string | null;
  page?: {
    id: string;
    sort: number;
    title: string;
    permalink: string;
  } | null;
  children?: Array<NavigationItem>;
}

interface NavigationResponse {
  id: string;
  title: string;
  is_active: boolean;
  items: Array<NavigationItem>;
}

interface NavigationData {
  data: Array<NavigationResponse>;
  error?: string;
}
export async function getNavigation(): Promise<NavigationData> {
  try {
    const navigation = await client.request(
      readItems("navigation", {
        fields: ["*.*.*"],
      })
    );

    return {
      data: navigation as Array<NavigationResponse>,
    };
  } catch (error) {
    console.error("Failed to fetch navigation:", error);
    return {
      data: [],
      error: "Failed to fetch navigation. Please try again later.",
    };
  }
}
```

The function above will fetch the header and footer data from the CMS. The using the `*.*.*` query will fetch all the items in the navigation collection.

To use the `getNavigation` function, you need to import it in the `src/layouts/Layout.astro` file and call it to get the header and footer data.

```astro
---
import { getNavigation } from "../lib/directus";


const { seo } = Astro.props;
const { title, description } = seo || { title: "Default Title", description: "Default Description" };

const navigation = await getNavigation();
const { data, error } = navigation;

if (error) {
  console.error("Error fetching navigation:", error);
}

const mainNav = data?.find((item) => item.id === "main");
const mainNavItems = mainNav?.items ?? [];

const footerNav = data?.find((item) => item.id === "footer");
const footerNavItems = footerNav?.items ?? [];
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="description" content={description} />
    <title>{title}</title>
  </head>
  <body>
    <nav>
      <ul>
        <li><a href="/">Home</a></li>
        {mainNavItems.map((navItem) => (
          <li >
            {navItem.type === "page" && navItem.page ? (
              <a href={navItem.page.permalink}>{navItem.title}</a>
            ) : navItem.type === "group" && (navItem.children ?? []).length > 0 ? (
              <div class="dropdown">
                <span class="dropdown-title">{navItem.title}</span>
                <ul class="dropdown-menu">
                  {navItem.children?.map((child) => (
                    <li >
                      {child.type === "page" && child.page ? (
                        <a href={child.page.permalink}>{child.title}</a>
                      ) : child.type === "url" && child.url ? (
                        <a href={child.url}>{child.title}</a>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : navItem.type === "url" && navItem.url ? (
              <a href={navItem.url}>{navItem.title}</a>
            ) : null}
          </li>
        ))}
      </ul>
    </nav>

    <slot />

    <footer>
      <ul>
        {footerNavItems.map((navItem) => (
          <li>
            {navItem.type === "page" && navItem.page ? (
              <a href={navItem.page.permalink}>{navItem.title}</a>
            ) : navItem.type === "url" && navItem.url ? (
              <a href={navItem.url}>{navItem.title}</a>
            ) : null}
          </li>
        ))}
      </ul>
    </footer>
  </body>
</html>

<style>
  html,
  body {
    margin: 0;
    width: 100%;
    height: 100%;
    font-family: Arial, sans-serif;
  }

  nav {
    background-color: #f8f9fa;
    padding: 1rem;
  }

  nav ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    gap: 2rem;
    justify-content: center;
  }

  nav a {
    text-decoration: none;
    color: #333;
    font-weight: 500;
    transition: color 0.3s ease;
  }

  nav a:hover {
    color: #666;
  }

  .dropdown {
    position: relative;
  }

  .dropdown-title {
    cursor: pointer;
    font-weight: 500;
    color: #333;
    transition: color 0.3s ease;
  }

  .dropdown-title:hover {
    color: #666;
  }

  .dropdown ul.dropdown-menu {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    background-color: #fff;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    list-style: none;
    padding: 0.5rem 0;
    margin: 0;
    width: 200px;
    border-radius: 4px;
    z-index: 1000; 
  }

  .dropdown:hover .dropdown-menu {
    display: block; 
  }

  .dropdown-menu li {
    padding: 0.5rem 1rem;
  }

  .dropdown-menu li a {
    color: #333;
    text-decoration: none;
    display: block;
    cursor: pointer;
  }

  .dropdown-menu li a:hover {
    color: #007bff;
  }

  footer {
    background-color: #333;
    color: #fff;
    padding: 1rem;
    text-align: center;
  }

  footer ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  footer a {
    text-decoration: none;
    color: #fff;
    font-weight: 500;
    transition: color 0.3s ease;
  }

  footer a:hover {
    color: #007bff;
  }
</style>
```

The code above:

- Fetches the header and footer data from the CMS using the `getNavigation` function.
- Renders the header and footer in the `Layout` component.
- Styles the header and footer with CSS to match the design of the home page.

Some of the links for header are nested in a `children` field. The code above will render the header with a dropdown for the links that have children.
The dropdown will show the child links when hovered over:
![Header with dropdown](/img/astro-header.gif)

The footer will also render links based on the data coming from the CMS like this:
![Footer](/img/astro-footer.png)

## Conclusion

In this tutorial, you learned how to create a CMS-driven home page using Directus and Astro. You created components for each section of the home page and used the `BlocksToComponents` component to render the blocks dynamically based on the data coming from the CMS.
You also covered fetching data for the Layout components such as the header, footer, and SEO for each pages.

Using this same approach, you can create other pages in your application such as the About page, Contact page, Privacy policy etc and also customize the components to match your design and add more features as needed.
