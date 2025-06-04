---
slug: integrating-the-directus-visual-editor-with-nextjs
title: Integrating the Directus Visual Editor with Next.js
technologies:
  - nextjs
authors:
  - name: Kumar Harsh
    title: Guest Author
description: Learn how to integrate the Directus Visual Editor with Next.js.
---

The Directus Visual Editor module allows you to edit your content live on your site. This article shows you how to integrate it with an existing CMS setup using Next.js.

## Before You Start

You will need:
* A new Directus project with admin access.

## Set Up Your Directus Project

Start with a Directus Cloud or self-hosted clean install of Directus. Follow the steps below to configure Directus with the necessary collections and permissions.

First, using the new Directus instance, generate a static token for the admin user by going to the Users Directory. Choose the **Administrative User**, and scroll down to the **Token** field and generate a static token. Copy the token and save it. Do not forget to save the user, or you will encounter an "Invalid token" error.

### Apply the CMS Template

Use the [Directus Template CLI](https://github.com/directus-labs/directus-template-cli) to apply the CMS template for your project by opening your terminal and running the following command: 

```bash
npx directus-template-cli@latest apply
```

Choose *Community templates*, and select the *CMS* template. Fill in your Directus URL, and select *Directus Access Token* as the authentication method, filling in the token created earlier:

```bash
➜  Directus npx directus-template-cli@latest apply
(\   /)
 \\_//
 ( Õ Õ) "Let's apply a template!"
C(")(")
┌  Directus Template CLI - Apply Template
│
◇  What type of template would you like to apply?
│  Community templates
│
◇  Select a template.
│  CMS
│
●  You selected CMS
│
◇  What is your Directus URL?
│  http://localhost:8055
│
◇  How do you want to log in?
│  Directus Access Token
│
◇  What is your Directus Admin Token?
│  HL6bxxxxxxxxxxxxxxxxxxxxzzJ6kS3S
-- Logged in as Admin User
Loading 24 collections and 276 fields... done
Loading 66 relations... done
Loading 4 roles... done
Loading 7 policies... done
Loading 149 permissions... done
Loading 3 users... done
Loading 12 accesses... done
Loading 4 folders... done
Loading 32 files... done
Loading data for 24 collections... done
Updating 31 fields to required... done
Loading 1 dashboards... done
Loading 9 flows... done
Loading settings... done
Loading 1 translations... done
Loading 11 presets... done
Found 17 extensions total: 12 registry extensions (including 2 bundles), and 0 local extensions
-- Installed @directus-labs/ai-image-generation-operation
-- Installed @directus-labs/experimental-m2a-interface
-- Installed @directus-labs/super-header-interface
-- Installed @directus-labs/inline-repeater-interface
-- Installed @directus-labs/seo-plugin
-- Installed directus-extension-wpslug-interface
-- Installed @directus-labs/ai-writer-operation
-- Installed @directus-labs/liquidjs-operation
-- Installed @directus-labs/card-select-interfaces
-- Installed @directus-labs/simple-list-interface
-- Installed @directus-labs/command-palette-module
-- Installed directus-extension-group-tabs-interface
Installing 12 extensions... done
Finished installing extensions
------------------
Template applied successfully.
```

The Directus Template CLI will make the required changes to Directus to add the CMS template. This includes creating the necessary collections, fields, and relationships to manage your content.

## Configure Access Policies and CORS

Directus' preview mode uses an iframe to display your Next.js app with the content from Directus. Depending on your settings, you may need to configure the content security policy of your Directus instance to allow it to access your Next.js app. If you are self-hosting your Directus instance, you can do that by updating your `docker-compose.yml` file to add the following environment node:

```yml
environment:
  CONTENT_SECURITY_POLICY_DIRECTIVES__FRAME_SRC: http://localhost:3000
```
Also, when self-hosting your Directus instance, you might need to configure CORS to enable your Next.js app to interact with it. For the purpose of this tutorial, you can set your Directus instance to receive requests from any origin (through the `CORS_ORIGIN: "true"` environment variable) by setting the following environment variables:

```yaml
environment:
  CORS_ENABLED: "true"
  CORS_ORIGIN: "http://localhost:3000"
```
In a production environment, you should only allow your app's trusted domains in the `CORS_ORIGIN` list. 

## Set Up Your Next.js Project
Follow the instructions for setting up a Next.js project in the [Create a CMS using Directus and Next.js](https://directus.io/docs/tutorials/projects/create-a-cms-using-directus-and-nextjs) tutorial. Once you have the Next.js app from that tutorial set up, you can start with the steps in this article to integrate with the Directus Visual Editor.

You can get the full code for this article [here](https://github.com/krharsh17/directus-next-cms) to skip the setup and go straight to the integration.

### Install Directus Visual Editing Package
On your terminal, run the command below to install Directus visual editing package in your Next.js app.

```bash
npm i @directus/visual-editing
```

## Integrate the Directus Visual Editing Package

Now its time to start setting up the Visual Editor in your app. Start by initializing the Directus Visual Editor by creating a `visual-editor.js` file inside the `./lib` directory and add the following code to it.

```javascript
// lib/visual-editor.js
import { apply, setAttr, remove } from '@directus/visual-editing';

let isApplied = false;

export async function initializeVisualEditor() {
  if (typeof window !== 'undefined' && !isApplied) {
    try {
      await apply({ 
        directusUrl: 'http://localhost:8055',
        onSaved: async (data) => {
          console.log('Content saved successfully:', data);

          try {
            window.location.reload();
            console.log('Page data refreshed successfully');
          } catch (error) {
            console.error('Failed to refresh page data:', error);
            window.location.reload();
          }
        }
      });
      isApplied = true;
    } catch (error) {
      console.error('Failed to initialize visual editor:', error);
    }
  }
}

export function cleanupVisualEditor() {
  if (typeof window !== 'undefined' && isApplied) {
    remove();
    isApplied = false;
  }
}

export { setAttr };
```
The code above sets up a Directus Visual Editor integration inside your Next.js app and also enables live editing of your content.

You'll need to call the `initializeVisualEditor` function in your Home component in the **app/page.js** file to connect your frontend to your Directus instance for live editing. However, you can only call this function on the client-side, so you will need to turn the server-side rendered home page component into a client-side rendered home page component. To do that, and to call the `initializeVisualEditor` function in the component after it loads, replace the code in the **app/page.js** file with the following:

```js
"use client"

import client from '../lib/directus';
import { initializeVisualEditor } from "../lib/visual-editor";
import { readItems } from '@directus/sdk';
import HeroSection from './components/HeroSection';
import RichTextSection from './components/RichTextSection';
import GallerySection from './components/GallerySection';
import PricingSection from './components/PricingSection';
import FormSection from './components/FormSection';
import Header from './components/Header';
import Footer from './components/Footer';
import { useEffect, useState } from 'react';

export default function Home() {

  const [homePageData, setHomePageData] = useState(null);
  const [navigationData, setNavigationData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const result = await client.request(
        readItems('pages', {
          filter: {
            permalink: {
              _eq: '/'
            }
          },
          fields: [
            "*",
            "blocks.*",
            "blocks.item.*.*.*.*",
          ]
        })
      );
      setHomePageData(result);

      const navData = await client.request(
        readItems('navigation', {
          fields: [
            "*.*.*.*",
          ]
        })
      );
      setNavigationData(navData);

      initializeVisualEditor();
    }
    fetchData();
  }, []);

  if (!homePageData || !navigationData) {
    return <div>Loading...</div>;
  }

  const hero_data = homePageData[0].blocks?.filter(block => block.collection === 'block_hero')?.[0];
  const rich_text_data = homePageData[0].blocks?.filter(block => block.collection === 'block_richtext')?.[0];
  const gallery_data = homePageData[0].blocks?.filter(block => block.collection === 'block_gallery')?.[0];
  const pricing_data = homePageData[0].blocks?.filter(block => block.collection === 'block_pricing')?.[0];
  const form_data = homePageData[0].blocks?.filter(block => block.collection === 'block_form')?.[0];

  return (
    <main>
      <Header
        navigation={navigationData}
      />

      <>
        {hero_data && <HeroSection
          id={hero_data.item.id}
          tagline={hero_data.item.tagline}
          headline={hero_data.item.headline}
          description={hero_data.item.description}
          image={hero_data.item.image}
          layout={hero_data.item.layout}
          button_group={hero_data.item.button_group.buttons}
        />}

        {rich_text_data && <RichTextSection
          {...(rich_text_data.item)}
        />}

        {gallery_data && <GallerySection
          {...(gallery_data.item)}
        />}

        {pricing_data && <PricingSection
          {...(pricing_data.item)} />}

        {form_data && <FormSection
          {...(form_data.item)}
        />}

      </>

      <Footer
        navigation={navigationData}
      />

    </main>
  );
}
```

You'll notice that the `generateMetadata` function that would generate the SEO metadata for the home page has now been removed. You can still retain it by replacing the following code in the **app/layout.js** file with it:

```js
// Replace the following
export const metadat = {
  title: "Create Next App",
  description: "Generated by create next app",
}


// With the following
import client from "@/lib/directus";
import { readItems } from "@directus/sdk";

export async function generateMetadata({params}) {
  const { slug } = await params

  // Fetch homepage data for SEO
  const seoData = await client.request(
    readItems('pages', {
      filter: {
        permalink: {
          _eq: `/${slug}`
        }
      },
      fields: [
        "seo"
      ]
    })
  );

  if (!seoData || seoData.length === 0) {
    return {
      title: 'Default Title',
      description: 'Default Description',
    };
  }

  const pageData = seoData[0];

  return {
    title: pageData.seo.title,
    description: pageData.seo.description,
  };
}
```

Once you've done that, you'll need to modify the components of the page to link them to the right collections and fields in Directus. You'll do this for all the components one by one.

### HeroSection
Navigate to `./app/components`, open the `HeroSection.js` file and replace its content with the following:

```js
"use client";

import Image from 'next/image';
import Link from 'next/link';
// Add this import
import { setAttr } from '../../lib/visual-editor.js';

// Add `id` in the list of destructured props
export default function HeroSection({ id, tagline, headline, description, image, layout, button_group = [] }) {

  return (
    <section className="hero-section">
      <div className="container">
        {layout === 'image_left' && image && (
          <div className="hero-image">
            <Image
              src={`http://localhost:8055/assets/${image.id}`}
              alt={image.filename_download || 'Hero Image'}
              width={600}
              height={400}
              priority
              // Add the following attribute
              data-directus={setAttr({ 
                collection: 'block_hero', 
                item: id, 
                fields: 'image',
                mode: 'modal'
              })}
            />
          </div>
        )}

        <div className="hero-content">
          {tagline && (
            <p 
              className="tagline"
              // Add the following attribute
              data-directus={(setAttr({ 
                collection: 'block_hero', 
                item: id, 
                fields: 'tagline',
                mode: 'popover'
              }))}
            >
              {tagline}
            </p>
          )}
          
          {headline && (
            <h1 
              // Add the following attribute
              data-directus={(setAttr({ 
                collection: 'block_hero', 
                item: id, 
                fields: 'headline',
                mode: 'popover'
              }))}
            >
              {headline}
            </h1>
          )}
          
          {description && (
            <p 
              className="description"
              // Add the following attribute
              data-directus={(setAttr({ 
                collection: 'block_hero', 
                item: id, 
                fields: 'description',
                mode: 'popover'
              }))}
            >
              {description}
            </p>
          )}

          {button_group.length > 0 && (
            <div className="button-group" 
              // Add the following attribute
              data-directus={(setAttr({ 
                collection: 'block_hero', 
                item: id, 
                fields: 'button_group',
                mode: 'popover'
              }))}>
              {button_group.map((button, idx) => (
                <Link 
                  key={idx} 
                  href={resolveButtonUrl(button)}
                >
                  <button className={`cta-button ${button.variant || 'default'}`}>
                  {button.label}
                  </button>
                </Link>
              ))}
            </div>
          )}
        </div>

        {(layout === 'image_right' || layout === 'image_center' || layout === null) && image && (
          <div className="hero-image">
            <Image
              src={`http://localhost:8055/assets/${image.id}`}
              alt={image.filename_download || 'Hero Image'}
              width={600}
              height={400}
              priority
              // Add the following attribute
              data-directus={setAttr({ 
                  collection: 'block_hero', 
                  item: id, 
                  fields: 'image',
                  mode: 'modal'
                })}
            />
          </div>
        )}
      </div>

      {/* Leave the remaining same as before */}

    </section>
  );
}
```

The code above renders the hero section. It uses `setAttr()` to tag each part of the content so it can be edited visually from the Directus interface.

### RichTextSection
Open the `./src/lib/components/RichTextSection.js` file and replace its content with the following:

```javascript
"use client";
// Add the following import
import { setAttr } from '../../lib/visual-editor.js';

// Add `id` in the list of destructured props
export default function RichTextSection({ id, tagline, headline, content, alignment = 'center' }) {
  return (
    <section className="rich-text-section">
      <div className="container" style={{ textAlign: alignment }}>
        {tagline && (
          <p 
            className="tagline"
            // Add the following attribute
            data-directus={(setAttr({ 
              collection: 'block_richtext', 
              item: id, 
              fields: 'tagline',
              mode: 'popover'
            }))}
          >
            {tagline}
          </p>
        )}
        {headline && (
          <h2 
            // Add the following attribute
            data-directus={(setAttr({ 
              collection: 'block_richtext', 
              item: id, 
              fields: 'headline',
              mode: 'popover'
            }))}
          >
            {headline}
          </h2>
        )}
        {content && (
          <div 
            className="content" 
            dangerouslySetInnerHTML={{ __html: content }}
              // Add the following attribute
            data-directus={(setAttr({ 
              collection: 'block_richtext', 
              item: id, 
              fields: 'content',
              mode: 'modal'
            }))}
          />
        )}
      </div>

      // Leave the remaining same as before

    </section>
  );
}
```

The code above displays a rich-text content block with a headline and HTML content, both editable via **Directus Visual Editor**. Each part is tagged with `setAttr()` so the editor knows what parts need to be made editable. 

### GallerySection
Open the `GallerySection.js` file and replace its content with the following:

```javascript
"use client";
// Add the following import
import { setAttr } from '../../lib/visual-editor.js';

import Image from 'next/image';

// Add `id` in the list of destructured props
export default function GallerySection({ id, tagline, headline, items = [] }) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className="gallery-section">
      <div className="container">
        {tagline && <p 
          className="tagline" 
          // Add the following attribute
          data-directus={setAttr({
            collection: 'block_gallery',
            item: id,
            fields: 'tagline',
            mode: 'popover'
          })}>{tagline}</p>}
        {headline && (
          <h2
            className="headline"
            // Add the following attribute
            data-directus={setAttr({
              collection: 'block_gallery',
              item: id,
              fields: 'headline',
              mode: 'popover'
            })}
          >
            {headline}
          </h2>
        )}
        <div className="gallery-grid"
            // Add the following attribute
            data-directus={setAttr({
              collection: 'block_gallery',
              item: id,
              fields: 'items',
              mode: 'popover'
            })}>
          {items.map((item, index) => (
            <div className="gallery-item" key={index}>
              {item.directus_file?.id && (
                <Image
                  src={`http://localhost:8055/assets/${item.directus_file.id}`}
                  alt={item.directus_file.filename_download || 'Gallery image'}
                  width={400}
                  height={300}
                  className="gallery-image"
                  
                />
              )}
            </div>
          ))}
        </div>
      </div>

    // Leave the remaining same as before
    </section>
  );
}

```
The code above renders a gallery block with a headline and a grid of images. We make the entire block editable in a drawer, while the headline has its own popover editor. Each gallery item shows an image and an optional title. It also safely handles empty data and uses responsive grid styling for layout.

### PricingSection
Open the `PricingSection.js` file and replace its content with the following:

```js
"use client";
// Add the following import
import { setAttr } from '../../lib/visual-editor.js';

import Link from 'next/link';

// Add `id` in the list of destructured props
export default function PricingSection({ id, tagline, headline, pricing_cards = [] }) {
  if (!pricing_cards || pricing_cards.length === 0) {
    return null;
  }

  return (
    <section className="pricing-section">
      <div className="container">
        <div className="pricing-header">
          {tagline && <p
            className="tagline"
            // Add the following attribute
            data-directus={setAttr({
              collection: 'block_pricing',
              item: id,
              fields: 'tagline',
              mode: 'popover'
            })}
          >
            {tagline}
          </p>}
          {headline && <h2
            // Add the following attribute
            data-directus={setAttr({
              collection: 'block_pricing',
              item: id,
              fields: 'headline',
              mode: 'popover'
            })}>{headline}</h2>}
        </div>

        <div className="pricing-plans">
          {pricing_cards.map((plan, index) => (
            <div className={`pricing-plan ${plan.is_highlighted ? 'featured' : ''}`} key={index}
              // Add the following attribute
              data-directus={setAttr({
                collection: 'block_pricing_cards',
                item: plan.id,
                fields: ['title', 'price', 'description', 'badge', 'is_highlighted', 'features', 'button'],
                mode: 'drawer'
              })}>
              {plan.badge && <span className="badge">{plan.badge}</span>}
              <h3>{plan.title}</h3>
              <div className="price">{plan.price}</div>
              {plan.description && <p className="plan-description">{plan.description}</p>}

              {plan.features && (
                <ul className="features">
                  {plan.features.map((feature, idx) => (
                    <li key={idx}>{feature.trim()}</li>
                  ))}
                </ul>
              )}

              {plan.button && plan.button.label && (
                <Link
                  href={resolveButtonUrl(plan.button)}
                  className={`cta-button ${plan.is_highlighted ? 'featured-cta' : ''}`}
                >
                  {plan.button.label}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

    // Leave the remaining same as before
    </section>
  );
}
```

The code above renders the pricing block with a tagline, headline, and a grid of pricing plans. The entire pricing block is made editable, with each plan being editable in its own drawer.

### FormSection
Open the `FormSection.js` file and replace its content with the following:

```js
'use client';
// Add the following import
import { setAttr } from '../../lib/visual-editor.js';

import { useState } from 'react';

// Add `id` in the list of destructured props
export default function FormSection({ id, tagline, headline, form }) {
  const [formData, setFormData] = useState(
    () => form.fields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {})
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8055/items/form_submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      setIsSubmitted(true);
      setFormData(form.fields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {}));
    } catch (err) {
      console.error(err);
      setError('There was an error submitting your form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!form || !form.fields) return null;

  return (
    <section className="form-section">
      <div className="container">
        <div className="form-header">
          {tagline && <p 
            // Add the following attribute
            data-directus={setAttr({
              collection: 'block_form',
              item: id,
              fields: 'tagline',
              mode: 'popover'
            })} className="tagline">{tagline}</p>}
          {headline && <h2 
            // Add the following attribute
            data-directus={setAttr({
              collection: 'block_form',
              item: id,
              fields: 'headline',
              mode: 'popover'
            })}>{headline}</h2>}
        </div>

        {isSubmitted ? (
          <div className="success-message">
            <h3>Thank you!</h3>
            <p>{form.success_message || 'Your form has been successfully submitted.'}</p>
            <button onClick={() => setIsSubmitted(false)} className="reset-button">
              Submit another response
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="contact-form"
            // Add the following attribute 
            data-directus={setAttr({
              collection: 'block_form',
              item: id,
              fields: 'form',
              mode: 'popover'
            })}>
            {error && <div className="error-message">{error}</div>}

            {form.fields.map((field) => (
              <div className="form-group" key={field.id}>
                <label htmlFor={field.name}>{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    id={field.name}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    rows="5"
                    required={field.required}
                  />
                ) : (
                  <input
                    id={field.name}
                    type={field.type || 'text'}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    required={field.required}
                  />
                )}
              </div>
            ))}

            <button 
              type="submit" 
              className="submit-button" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : (form.submit_label || 'Submit')}
            </button>
          </form>
        )}
      </div>

    // Leave the remaining same as before
    </section>
  );
}
```

## Configure the Visual Editor on Directus

Now, it's time to test it out. Run this command to start the application: 

```bash
npm run dev
```

On your Directus dashboard sidebar, click on **Settings** and scroll down to the **Visual Editor** section. Then, click on **Create New**, add http://localhost:3000/, and save it.
 
## Testing the Visual Editor

With all the components set up, navigate to the Visual Editor page in Directus Studio and browse the page. You can try hovering your mouse over each component element (and sub-elements) and clicking the **Edit** icon on each to see how the editing experience works.

## Conclusion 

By coupling frontend elements with Directus fields the Visual Editor gives visual website editors a way to edit content directly on the page.

The visual editor offers a lot more features, such as handling [sensitive data](https://directus.io/docs/guides/content/visual-editor/frontend-library#:~:text=Be%20careful%20with%20sensitive%20data%20in%20attributes) carefully, [customizing the various editable elements](https://directus.io/docs/guides/content/visual-editor/customization) beyond their default styles via CSS, and [managing multiple websites](https://directus.io/docs/guides/content/visual-editor/studio-module) from one Directus instance.
