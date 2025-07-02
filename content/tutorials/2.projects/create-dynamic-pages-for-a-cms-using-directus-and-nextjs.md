---
id: 11a1c86f-36bf-4dd5-8bce-7eed75451514
slug: create-dynamic-pages-for-a-cms-using-directus-and-nextjs
title: Create Dynamic Pages for a CMS using Directus and Next.js
technologies:
  - nextjs
authors:
  - name: Kumar Harsh
    title: Guest Author
description: Learn how to create dynamic pages you can use in your CMS using Directus and Next.js.
---

Directus provides a headless CMS, which when combined with Next.js will streamline content management. This post covers how to combine the two to create dynamic pages for a content management system.

## Before You Start

You will need:
- A new Directus project with admin access.
- Fundamental understanding of Next.js and React concepts

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
Loading 22 collections and 181 fields... done
Loading 26 relations... done
Loading 4 roles... done
Loading 7 policies... done
Loading 144 permissions... done
Loading 3 users... done
Loading 12 accesses... done
Loading 3 folders... done
Loading 35 files... done
Loading data for 22 collections... done
Updating 27 fields to required... done
Loading 1 dashboards... done
Loading 8 flows... done
Loading settings... done
Loading 1 translations... done
Loading 8 presets... done
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

### Configure CORS

If you are self-hosting your Directus instance, you might need to configure CORS to enable your Next.js app to interact with it. Since Next.js development server serves the app at http://localhost:3000, you can get started by setting the following environment variables:

```yaml
environment:
  CORS_ENABLED: "true"
  CORS_ORIGIN: "http://localhost:3000"
```
In a production environment, you should only allow your app's trusted domains in the `CORS_ORIGIN` list. 

## Set Up Your Next.js Project

Once that's done, create a new Next.js app by running the following command:

```bash
npx create-next-app \
  directus-next-dynamic-pages \
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
cd directus-next-dynamic-pages
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
.with(rest({
      onRequest: (options) => ({ ...options, cache: 'no-store' }),
}))
```

## Create the Posts Listing

The Directus CMS template comes with some example posts that can be used to implement the Next integration.

![Screenshot of the existing posts in Directus](/img/directus-cms-template-posts.png)

You will list these posts on the index page. To do that, update the file `app/page.js` with the following content:

```js
// app/page.js
"use client"
import client from "@/lib/directus";
import { readItems } from "@directus/sdk";
import { useEffect, useState } from "react";

export default function Page() {
  const [posts, setPosts] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await client.request(
          readItems('posts')
        );
        setPosts(response);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }
  , []);

  return (
    <div>
      {posts ? (
        posts.map((post) => (
          <div key={post.id}>
            <h1>{post.title}</h1>
          </div>
        ))
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
```

If you now run the app (using `npm run dev`) and go to http://localhost:3000, you should see a list of the titles of the published posts from the Directus collection you saw earlier. 

![Next app showing titles of published posts](/img/next-app-published-posts-titles.png)

If you look at the posts collection in Directus once again, you will see that the posts have a bunch of fields that you can use to display more information about them on the frontend. 

Next up, you will query and display the `title`, `image`, `description`, and `author` fields for each post on the homepage. You will also query the `sort` and `published_at` fields to control the order in which the posts are displayed.

While the template already implements a public access policy that ensures only posts with the `status` set to `published` and with a `published_at` value less than or equal to the current timestamp are displayed to non logged-in users, you will still implement a frontend filter for the same to ensure that these posts are not shown to logged in users as well.

To better design the home page and display some details about the posts, it makes sense to separate the the post tiles into their own component will allow the reuse of the component in the individual post page. Create a new file `app/components/Post.jsx` with the following content:

```js
// app/components/Post.jsx
"use client";
import Link from 'next/link';

export default function Post({ id, title, author, slug, description, image, content, published_at }) {
  return (
    <div className={content ? 'article' : 'card'}>
      <img
        src={`http://localhost:8055/assets/${image.id}`}
        alt={image.title}
      />
      <h2>{title}</h2>
      <p className="author">by {author.first_name} {author.last_name}</p>
      {content ? (
        <>
          <p>Published on {new Date(published_at).toDateString()}</p>
          <hr/>
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </>
      ) : (
        <div>
          <p>{description}</p>
          <Link href={`/posts/${slug}`}><div className="link">Read more</div></Link>
        </div>
      )}

      <style jsx>{`
        .card {
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          transition: transform 0.3s ease;
          background-color: #fff;
          max-width: 350px;
          height: 450px;
          margin: 1rem;
          position: relative;
        }
        .card:hover {
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }
        .card img {
          width: 100%;
          height: 200px;
          object-fit: cover;
          display: block;
        }
        .article img {
          width: 100%;
          height: 500px;
          object-fit: cover;
          display: block;
        }
        .article .author {
          font-style: italic;
        }
        .card h2 {
          margin: 1rem;
          font-size: 1.5rem;
          color: #333;
        }
        .card p {
          margin: 0 1rem 1rem;
          color: #666;
          line-height: 1.4;
          text-overflow: ellipsis;
          display: box;
          overflow: hidden;
          max-height: 4rem;
        }
        .link {
          margin: 1rem;
          color: #0000EE;
        }
      `}</style>
    </div>
  );
}
```

This file sets up the post props, adds some basic styling, and the HTML includes some conditional statements to present a post as a card or an article based on the presence of the `content` field. This will allow you to use the same component in both the index page to show all posts together and in the posts details page to show just one complete post with its contents.

To use this component to display the published posts on the index page, update the `src/app/page.js` file to the following:

```js
// app/page.js
"use client"
import client from "@/lib/directus";
import { readItems } from "@directus/sdk";
import { useEffect, useState } from "react";
import Post from "./components/Post";

export default function Page() {
  const [posts, setPosts] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await client.request(
          readItems('posts', {
            fields: ['id', 'title', 'slug', {'author': ["first_name", "last_name"]}, 'published_at', 'image.title', 'image.id', 'description'],
            filter: { published_at: { _empty: false } },
            sort: ['sort'],
          })
        );
        setPosts(response);
        console.log("Posts fetched:", response);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }
  , []);

  return (
    <div className="posts-container">
      <h1>Posts</h1>
      {posts ? (
        <div className="posts-grid">
          {posts.map((post) => (
            <div key={post.id}>
              <Post {...post} />
            </div>
          ))}
        </div>
      ) : (
        <div>Loading...</div>
      )}
      
      <style jsx>{`
        .posts-container {
          display: flex;
          flex-wrap: wrap;
          gap: 3rem;
        }
        .posts-grid {
          display: flex;
          gap: 1rem;
          width: 100%;
          flex-direction: row;
          justify-content: flex-start;
        }

        h1 {
          margin-left: 1rem;
        }
      `}</style>
    </div>
  );
}
```

Visit `http://localhost:3000` and you should see a list of the published posts.

![Formatted and enriched post cards](/img/next-app-index-with-post-cards.png)

## Create the Individual Posts' Pages

The next step is to create the individual post pages which have the following fields:

![Fields of the pre-populated posts from the Directus CMS template](/img/directus-cms-post-fields.png)

You will create this page in the `app/posts/[slug]/page.jsx` file. This page will dynamically look up the post from Directus based on the `slug` field and display the full post contents. To do that, create the file and add the code as follows:

```js
// app/posts/[slug]/page.jsx
import { notFound } from 'next/navigation';
import client from "@/lib/directus";
import { readItems } from "@directus/sdk";
import Post from "../../components/Post";

export default async function PostDetail({ params }) {
  try {
    // Get the slug from the params
    const { slug } = await params;
    
    // Fetch post data with the given slug
    const posts = await client.request(
      readItems('posts', {
        filter: {
          slug: { _eq: slug },
        },
        fields: ['id', 'title', 'slug', {'author': ["first_name", "last_name"]}, 'published_at', 'image.title', 'image.id', 'description', 'content', 'seo'],
        limit: 1
      })
    );

    // Handle case where post isn't found
    if (!posts || posts.length === 0) {
      return notFound();
    }

    const post = posts[0];

    return <Post {...post} />;
  } catch (error) {
    console.error("Error fetching post:", error);
    return notFound();
  }
}

// Generate static params for posts at build time (optional)
export async function generateStaticParams() {
  try {
    const posts = await client.request(
      readItems('posts', {
        fields: ['slug'],
        filter: { published_at: { _empty: false } },
      })
    );

    return posts.map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}
```

This page reuses the `Post` component you created earlier to display the post cards on the home page and shows the contents of the post in the posts details page.

### Integrate the SEO Metadata

The CMS front end is now working but the Directus CMS template comes with a set of SEO metadata fields that can be added to each post. Next.js comes with a powerful [Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata) that allows you to add this metadata directly in the post details page. In `app/posts/[slug]/page.jsx`, add the following function:

```js
// Generate metadata for the page
export async function generateMetadata({ params }) {
  try {
    const { slug } = await params;
    
    const posts = await client.request(
      readItems('posts', {
        filter: {
          slug: { _eq: slug },
        },
        fields: ['title', 'seo'],
        limit: 1
      })
    );

    if (!posts || posts.length === 0) {
      return {
        title: 'Post Not Found',
      };
    }

    const post = posts[0];
    
    return {
      title: post.seo?.title || 'Directus CMS Post',
      description: post.seo?.meta_description || '',
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: 'Directus CMS Post',
    };
  }
}
```

Once you've saved this, refresh a post page and the page title will have changed to reflect the set titled in the Directus post in the SEO section. You can confirm this by looking at the page source as well.

### Add Breadcrumbs

Breadcrumbs are used to make navigation between pages clearer with extra visibility on the current page path. To add breadcrumbs to all pages in the Next.js app, create a new file `app/components/Breadcrumb.jsx` with the following contents:

```jsx
// app/components/Breadcrumb.jsx
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import PropTypes from 'prop-types';

export default function Breadcrumb({ breadcrumbs }) {
  const pathname = usePathname();

  return (
    <div className="breadcrumb-container">
      {breadcrumbs.map((link, index) => (
        <span key={link.href}>
          {pathname === link.href ? (
            <span>{link.text}</span>
          ) : (
            <Link href={link.href}>{link.text}</Link>
          )}
          {index !== breadcrumbs.length - 1 && <span> / </span>}
        </span>
      ))}
      
      <style jsx>{`
        .breadcrumb-container {
          margin-bottom: 16px;
        }
      `}</style>
    </div>
  );
}
```

This component will take a list of links and display them as breadcrumbs. To use it you need to apply this component to all pages by adding it to the `app/layout.js` file. Replace your `app/layout.js` file with the following code:

```js
"use client"

import Breadcrumb from "./components/Breadcrumb";
import { useState, createContext } from "react";

export const BreadcrumbContext = createContext();

export default function RootLayout({ children }) {
  const [breadcrumbs, setBreadcrumbs] = useState([
    { text: 'Posts', href: '/' }
  ]);

  const resetBreadcrumbs = () => {
    setBreadcrumbs([{ text: 'Posts', href: '/' }]);
  };

  const updateBreadcrumb = (link) => {
    if (link) {
      setBreadcrumbs(prev => [
        { text: 'Posts', href: '/' },
        { text: link.text, href: link.href }
      ]);
    } else {
      resetBreadcrumbs();
    }
  };

  return (
    <html lang="en">
      <body>
        <div>
          <Breadcrumb breadcrumbs={breadcrumbs} />
          <BreadcrumbContext.Provider value={{ updateBreadcrumb }}>
            {children}
          </BreadcrumbContext.Provider>
        </div>
      </body>
    </html>
  );
}
```

We are now tracking the pages we visit at the app level and listening for a `navigated` event to update the breadcrumbs. The last step is to emit this event when we navigate to pages. 

In `app/page.js` add the following code:

```ts
// app/page.js
"use client"
import client from "@/lib/directus";
import { readItems } from "@directus/sdk";
// Add import for useContext
import { useEffect, useState, useContext } from "react";
import Post from "./components/Post";
// Add import for BreadcrumbContext
import { BreadcrumbContext } from './layout';

export default function Page() {
  const [posts, setPosts] = useState(null);
  
  // Add initialization
  const { updateBreadcrumb } = useContext(BreadcrumbContext);
  
  // Add logic to reset breadcrumbs when component mounts
  useEffect(() => {
    updateBreadcrumb(null);
  }, []);

  // ... rest of the code
}
```

Finally, add the breadcrumb logic to the Posts component to allow setting up breadcrumbs when a post is viewed in full:

```js
// app/components/Post.jsx
"use client";

import Link from 'next/link';

// Add the two imports
import { BreadcrumbContext } from '../layout';
import { useContext, useEffect } from 'react';


export default function Post({ id, title, author, slug, description, image, content, published_at }) {
  // Set up the context
  const { updateBreadcrumb } = useContext(BreadcrumbContext);

  // Set up an effect to configure the breadcrumbs whenever the post is viewed with content
  useEffect(() => {
    if (content)
      updateBreadcrumb({
        text: title,
        href: `/posts/${slug}`
      });
  }, [])

  // ... rest of the code
}

```

If you visit `http://localhost:3000` now, you will see the breadcrumbs at the top of the page. If you click on a post, the breadcrumbs will update to show the current post and a link back to the posts page.

## Conclusion

The Directus CMS template provides a solid starting point for building content-managed websites. By integrating it with Next.js, you can create dynamic pages that are both powerful and quick to update. This tutorial has walked you through setting up a Next.js project, connecting it to Directus, and implementing key components like Posts and Breadcrumbs to create a functional blog. You can now expand this foundation by exploring the other collections in the Directus CMS template and extending your Next.js application to create a fully dynamic frontend that leverages the best of both technologies.
