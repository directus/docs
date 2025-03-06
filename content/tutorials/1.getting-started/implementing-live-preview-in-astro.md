---
slug: implementing-live-preview-in-astro
title: Implementing Live Preview in Astro
authors:
  - name: Carmen Huidobro
    title: Developer Educator
description: Learn how to setup Directus live preview with Astro.
---

Live Preview can be enabled in Directus Editor and allows content authors to see their changes directly in the Data Studio. It can be combined with content versioning to preview pre-published content. In this tutorial, you'll learn how to implement Live Preview in your Astro application.

## Before You Start

You will need:

- A Directus project with admin access.
- Fundamental understanding of Astro concepts.
- Optional but recommended: Familiarity with data modeling in Directus.

If you're just getting started with Astro and Directus, reference our guide on [getting started with Directus and Astro](/tutorials/getting-started/fetch-data-from-directus-with-astro).

## Set Up Directus

Log in to your Directus dashboard and create a new collection called `posts` with the following fields:

- id (Type: UUID)
- title (Type: String)
- content (Type: Markdown)
- slug (Type: String)
- status (Type: dropdown<Published, Draft, Archived>)
- published_date (Type: Date)

In the data model settings for the new collections, enable Live Preview with the following URL pattern: `http://your-website-url/[id]?preview=true`.

[id] is a template value that can be added by clicking the plus (+) icon in the Preview field interface.

![Live Preview](/img/live-preview.png)

This value will be dynamic based on the specific item page you are on. The `?preview=true` query parameter is added to the URL to indicate that the page is in preview mode.

### Edit Public Policy

- Navigate to Settings → Access Policies → Public
- Under `posts`, you will set a custom policy for `read`.
- Under Item Permissions, set a custom rule where `status` equals `published`.

### Enable CORS

Add the following configuration to your `docker-compose.yml` file to enable CORS requests from Directus to your Astro application:

```yml
CORS_ENABLED: "true"
CORS_ORIGIN: "http://localhost:4321"
CORS_CREDENTIALS: "true"
CONTENT_SECURITY_POLICY_DIRECTIVES__FRAME_SRC: "http://localhost:4321"
```

## Set Up an Astro Project

To set up an Astro project, run the following command in your terminal:

```bash
npm create astro@latest astro-live-preview
```

This command will create a new Astro project with the name `astro-live-preview`.

During installation, when prompted, choose the following configurations:

```bash
How would you like to start your new project? A basic, minimal starter
Install dependencies? Yes
Initialize a new git repository? No
```

Once completed, open the directory in your desired code editor and install the Directus JavaScript SDK using the command:

```bash
npm install @directus/sdk
```

Run `npm run dev` in the terminal to start the development server at `http://localhost:4321`. Open the URL on your browser to be sure Astro is set up correctly.

### Configure the Directus SDK

First, create a `.env` file in the root of your project and add the following environment variable:

```bash
YOUR_DIRECTUS_URL=https://your-directus-project-url.com
```

In the `src` directory, create a new directory called `lib`, and inside the directory, create a file called `directus.ts`. Add the following code to the file:

```jsx
import { createDirectus, rest, readItems, readItem, withToken } from '@directus/sdk';

const DIRECTUS_URL = import.meta.env.YOUR_DIRECTUS_URL;
const client = createDirectus(DIRECTUS_URL as string).with(rest());

export  {client, readItems, readItem, withToken };
```

The code above creates a connection with your Directus instance and allows you to access its rest API. Replace `YOUR_DIRECTUS_URL` with your Directus instance URL, and you are good to go.

### Fetch `posts` Data from Directus

To fetch posts from Directus, you need to have some contents in the collection. Populate the `posts` collection with some sample data.

Now that you have some contents in the `posts` collection, you can fetch these posts and display them on the Astro page.

Navigate to your `pages` directory and update the `index.astro` file with the content:

```astro
---
import { client, readItems } from "../lib/directus"

// fetch the post data from directus and only highlighting the needed fields for this component.
const posts = await client.request(
  readItems('posts', {
    fields: ['id', 'title', 'slug', 'published_date', ],
    sort: '-published_date',
  })
);
//don't forget to check these fields from Fields Permissions in Directus

---

<!doctype html>
<html lang="en">
  <body>
    <main>
   <h1>Blog Posts</h1>
   <ul>
    {
     posts.map((post) => (
      <li>
       <a href={`/${post.id}`}>
        <h2>{post.title}</h2>
       </a>
       <span>
        {post.published_date}
       </span>
      </li>
     ))
    }
   </ul>
    </main>
  </body>
</html>
```

The code above fetches the posts from Directus and displays them on the page. The `post.id` is used to generate a dynamic route for each post. The `post.title` and `post.published_date` are displayed on the page.

Open the browser and navigate to `http://localhost:4321/` to see the page with the posts.

![All Posts Page](/img/page.png)

## Implementing Preview Mode

To implement preview mode, inside of the `pages` directory, create a dynamic route  `[id].astro` file with the content:

```astro
---
import { readItems } from "@directus/sdk";
import { client, readItem, withToken } from "../lib/directus";

//generate static path for each post, then fetch the post data from directus
export const prerender = false;
export async function getStaticPaths() {
  const posts = await client.request(readItems("posts"));
  return posts.map((post) => ({
    params: { id: post.id },
    props: post,
  }));
}

const params = Astro.url.searchParams;
const preview = params.get("preview");
const id = Astro.url.pathname.split("/").pop();
const token = params.get("token");
const version = params.get("version");

let post: {
  title?: string;
  published_date?: string;
  content?: string;
  status?: string;
} = {};
if (preview) {
  if (!token || token !== import.meta.env.DIRECTUS_TOKEN) {
    throw new Error("Invalid auth token");
    //  console.error("Invalid auth token");
    //  return;
  }
  const headers = token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : {};
  post = await client.request(
    withToken(
      token,
      readItem("posts", id as string, {
        fields: ["id", "title", "slug", "published_date", "content", "status"],
        ...(version && { version }),
      })
    )
  );
  console.log(post);
} else {
  post = Astro.props;
}
---

<!-- render the post content -->
<div>
  {preview && <p style="color: #ff0000;">Preview Mode</p>}
  <h1>{post.title}</h1>
  <p>Date Published: {post.published_date}</p>
  <div set:html={post.content} />
  <p>Post Status: <span style="color: #008000;">{post.status}</span></p>
</div>

```

The code above:

- Fetches the post data from Directus based on the `id` parameter.
- Checks if the page is in preview mode.
- If the page is in preview mode, it fetches the post data using the Directus SDK and then render the page as a Server Side Rendered (SSR) page.
- If the page is not in preview mode, it uses the post data passed as props to renders the page as a Static Site Generated (SSG) page.
- Checks for the `token` query parameter to ensure that the request is coming from Directus and not from an unauthorized source.
- Checks for the `version` query parameter to fetch the specific version of the post.

You will add the `token`  later in this tutorial.

## Non-Public Content

The policy created earlier on Directus allows the public to access posts whose status is `published`. To be able to access the non-public posts, create a new user and generate a token for the user, which will allow the user to access non-public posts.

- Navigate to Settings → Access Control. Click on the plus (+) sign in the top right corner of the page to create a new role.
- Give the role a name, `Editor`, and click save.
- Next, create a policy for the `Editor` user role called `Can view drafts with token`. and give the role access to read all `posts` and `directus_versions`.

![User Policy](/img/user-policy.png)

Now that the role is created, you can now assign it to a new user.

Navigate to the `user directory` on the Directus admin dashboard and create a new user. Fill in the user details (`first_name`,`last_name` `email`, `password`, and any other necessary information). Scroll to the bottom of the page, assign the `Editor` role to the new user, and generate a `token` for the user.

![User Token](/img/token.png)

> :info: Also, ensure that the user has access to read all `posts` and `directus_versions`.

With this token, the user can now access the non-public posts. Let's modify our codes. First, create a `.env` file in the root of your Astro project and put the user token there.

```bash
DIRECTUS_TOKEN = "YOUR_GENERATED_TOKEN"
```

Next, update the Directus live preview URL pattern to include the token. The URL pattern should look like this:

```bash
`http://your-website-url/[id]?preview=true&token=<YOUR_GENERATED_TOKEN>`
```

## Live Preview & Content Versioning

Content versioning allows you to create and manage different versions of your contents. The same way code versioning is important to keep different versions of your code changes for future reference or rollback purposes, versioning your content will make it possible to keep the previous state of your contents and still have access to them whenever a review or rollback is needed.

To enable content versioning for the `posts` collection, navigate to Settings → Data Model → Post. Scroll to the content versioning section, and check the box. Add dynamic version value to the preview URL

Next, update the Directus live preview URL pattern to include the version. The URL pattern should look like this:

```bash
`http://your-website-url/[id]?preview=true&token=<YOUR_GENERATED_TOKEN>&version=Version`
```

![Content Versioning](/img/content-versioning.png)

## Testing Live Preview

To test the live preview, navigate to the `http://localhost:4321/` page and click on any of the posts. You will be redirected to the post page, and the post content will be displayed.
At the end of the URL, add `?preview=true&token=YOUR_GENERATED_TOKEN&version=main` to view the post in preview mode.

This should provide you with a preview of the post content that looks like the image below:

![Preview Mode dev](/img/preview-dev.png)

On your Directus dashboard, you can see the preview of the post content when you click on the post to make changes to the content.

![Directus Preview](/img/directus-preview.png)

Make changes to the content and click on the save button. The changes will be reflected on the Astro page in real-time.

Using the Directus interface you can also view the different versions of the post content and also how the post content will look like on various viewports.

![Directus Preview](/img/directus-preview-2.png)

## Summary

Through this article, you have been able to learn how to:

- Set up Directus for Live Preview.
- Configure your Astro application to handle preview mode and fetch dynamic data.

Live Preview provides a seamless content editing experience, ensuring that content authors can see changes in real time before publishing and can also share the preview URL with their team members, stakeholders, or clients to allow them to see how content changes would look.
