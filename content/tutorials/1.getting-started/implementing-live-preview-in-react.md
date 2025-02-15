---
slug: implementing-live-preview-in-react
title: Implementing Live Preview in React
authors:
  - name: Kumar Harsh
    title: Guest Author
description: Learn how to setup Directus live preview with React.
---

Live Preview can be enabled in Directus Editor and allows content authors to see their changes directly in the Data Studio. It can be combined with content versioning to preview pre-published content. In this tutorial, you'll learn how to implement Live Preview in your React application.

## Before You Start

You will need:

- A Directus project with admin access.
- Fundamental understanding of React concepts.
- Optional but recommended: Familiarity with data modeling in Directus.

## Set Up Your Directus Project

### Create a Collection

Create a new collection called `posts` with the following fields:

- title (Type: String)
- content (Type: markdown)
- slug (Type: String)
- published (Type: Boolean)

In the data model settings for the new collections, enable Live Preview with the following URL pattern: `http://your-website-url/[id]?preview=true`. `[id]` is a template value that can be added by clicking the INLINE_ICON_COMPONENT_WITH_VALUE_PREFILLED icon. 

![Setting the preview URL](/img/initial-preview-url.png)

This value will be dynamic based on the specific item page you are on.

## Edit Public Policy
You also want only posts with *published* set to true to be visible to website visitors. To implement that, you will need to set a custom policy for read access to the content, and add a filter that only shows posts with *published* set to true.

To do that, head over to **Settings** > **Access Policies** > **Public**. On this page, under the **Permissions** section, click on **Add Collection** and choose **Posts**, the collection you created earlier.

Once you've added **Posts** to the collections list, click on **Read** to set a read access rule on this collection. Choose **Use Custom** in the dropdown that opens to set a custom rule for read access. In the sidebar that opens, click **Add Filter** > **published** to create a new filter based on the **published** property.

Check the box next to **published Equals** to set the read filter to only allow viewing posts whose **published** field is set to true. Under the **Field Permissions** section, check all the fields to allow public users to see all the fields of a published post. Now, you can save this policy. 

### Configure Access Policies and CORS

Directus' preview mode uses an iframe to display your React app with the content from Directus. Depending on your settings, you may need to configure the content security policy of your Directus instance to allow it to access your React app. If you are self-hosting your Directus instance, you can do that by updating your `docker-compose.yml` file to add the following environment node:

```yml
environment:
  CONTENT_SECURITY_POLICY_DIRECTIVES__FRAME_SRC: http://localhost:5173
```

Also, when self-hosting your Directus instance, you might need to configure CORS to enable your React app to interact with it. For the purpose of this tutorial, you can set your Directus instance to receive requests from any origin (through the `CORS_ORIGIN: "true"` environment variable) by setting the following environment variables:

```yaml
environment:
  CORS_ENABLED: "true"
  CORS_ORIGIN: "true"
```

In a production environment, you should only allow your app's trusted domains in the `CORS_ORIGIN` list. Now, you are ready connect to this Directus instance from a React app.

## Set Up Your React Project

### Initialize Your Project

To start off, create a new React project by running the following command:

```bash
npm create vite@latest
```

Enter the project name as `directus-live-preview`, choose `React` as the framework, and choose `JavaScript` as the variant. Once the project is created, navigate into the project directory using the following command:

```bash
cd directus-live-preview
```

Now, install the directus composable client by running the following command:

```bash
npm install @directus/sdk
```

Once the directus SDK is installed, you need to initialize it. To do that, create a file named `src/lib/directus.js` and save the following in it:

```bash
// src/lib/directus.js

import { createDirectus, rest } from '@directus/sdk';

const BACKEND_URL = "http://localhost:8055/"

const client = createDirectus(BACKEND_URL)
  .with(rest({credentials: 'include'}));

export default client;
```

Make sure to update the value of `BACKEND_URL` with the URL of your Directus instance.

To set up routing in your React app, you will need to install React Router DOM. To do that, run the following command:

```bash
npm install react-router-dom
```

Next, delete the following files in the `src` folder:
* App.css
* App.jsx
* index.css

You are now ready to start building your blog app.

## Set up app routing
To set up the app routes, replace the contents of the `src/main.jsx` file with the following code to set up routing in your React application:

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Post from './Post'
import Home from './Home'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:id" element={<Post />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)

```

Now, your app contains two routes: `/` that will display a home page and `/:id` which will display a post.

To set up the home page, create a file `src/Home.jsx` and save the following code in it:

```jsx
const Home = () => {
    return <div>Home page</div>
}

export default Home
```

This will render a "Home page" text when you navigate to `http://your-app-url/`. However, the app will not run correctly unless you implement the `Post` component in the next section.

## Set up the post page
Next, create a file named `src/Post.jsx` and add the following contents to it:

```jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import client from './lib/directus';
import { readItem } from '@directus/sdk';

const Post = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);


  // Fetch the article using its id
  const fetchArticle = async () => {
    let result
    
    try {
      result = await client.request(readItem('posts', id));
    } catch (error) {
      if (error.response.status === 403) {
        console.error('Either this post is private or you do not have access to it');
      } else console.error('Error fetching article:', error);
      result = {
        title: "Post not found",
        content: "We couldn't find this post"
      }
    }
    setArticle(result);
  };

  useEffect(() => {
    fetchArticle();
  }, [id]);

  if (!article) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{article.title}</h1>
      <p>{article.content}</p>
    </div>
  );
};

export default Post;
```

Now, when you run the app in development mode using `npm run dev`, you will be able to view posts by going to the URL `http://localhost:5173/[post_id]`. For example, you can create a new post in Directus and try going to `http://localhost:5173/1` to view the post in your React app:

![Viewing a post in the React app](/img/view-post-react-app.png)

Now, you're ready to start implementing preview mode in your React app.


## Implement Preview Mode

Preview mode essentially means the ability to render a quick preview of the blog post you're editing in Directus side by side to see how the changes will look in the final page. You can further enhance the preview mode to render non-public blog posts as well to share drafts for feedback internally before making them live.

To set up preview mode in your React app, you will first of all need to check the URL to see if preview mode has been requested or not. To do that, add the following function to **src/Post.jsx** file:

```jsx
// Add useLocation to the imports at the top
import { useParams, useLocation } from 'react-router-dom';

// Add the following function
function useQuery() {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
}
```

Next, you will need to use this `useQuery` function to get the query params from the URL inside your `Post` component. To do that, add the following line inside the `Post` component:

```jsx
const Post = () => {
  // Add this line
  const query = useQuery();
  
  // existing contents...  
  const [article, setArticle] = useState(null);

};
```

Now, you can use `query.get("preview")` to check if a query parameter named `preview` is present in the URL or not and if it is, then get its value. Update the return statement of the `Post` component to render a banner in the preview mode based on this parameter:

```jsx
return (
    <div>
      {/* Add this line */}
      {(query.get("preview") ? <p>This a preview of the post</p> : <p/>)}
      
      <h1>{article.title}</h1>
      <p>{article.content}</p>
    </div>
  );
```

Once you save the file, you can now go to Directus, edit a post, and click on the live preview icon on the top right to view the post in your app's preview mode:

![Viewing the live preview](/img/viewing-live-preview.gif)

You can try editing and saving the post and view the changes get updated in the preview in real-time!

## Non-Public Content

As mentioned earlier, a popular use-case of the preview mode is to view previews of non-public content. To implement that, you will need to create a new Directus user who has the privilege to preview non-public posts. To do that, head over to **User Directory** and click on the plus icon on the top right to create a new user. Name the user "Post Previewer" and scroll down to the **Admin Options** section. Here, click on the **Create New** button to create a new policy for this user.

Name the policy "Can read non-public posts" and add the **Posts** Collection to the permissions list with the **Read** action set to **All access**. Click on the check icon on the top right to save this policy. 

Next, click the **Generate token** button on the **Token** input field to generate an access token for your user. Your app will verify if this token is passed via a URL parameter to allow viewing non-public posts as preview.

![Creating a new access token](/img/creating-a-new-access-token.png)

Once the token is generated, copy and save it in a safe place. Click on the check icon at the top right to create the new user.

Now, head over to **Settings** > **Data Model** > **Posts** and add the token to the live preview URL like this: `http://localhost:5173/[ID]?preview=true&token=<your-token-here>`

This is how it should look like:

![Adding the access token to preview URL](/img/adding-access-token-to-preview-url.png)

Now, you just need to update the React app to check for this token and if its present, render the post by getting it from Directus using this token.

To do that, you will need to update the `fetchArticle()` function in the `Post` component. Replace it with the following:

```jsx
const fetchArticle = async () => {
  const token = query.get("token");
  const isPreview = query.get("preview");
  let result
  
  
  const getPost = (id) => readItem('posts', id)

  try {
    if (isPreview && token)
      result = await client.request(withToken(token, getPost(id)));
    else
      result = await client.request(getPost(id));
  } catch (error) {
    console.log('Error fetching article:', error);
    result = {
      title: "Post not found",
      content: "We couldn't find this post"
    }
  }
  setArticle(result);
};
```

Now, you can try creating a new post with `published` set to **Disabled**, and you will still be able to access it using the following link: `http://localhost:5173/2?preview=true&token=<your-token>`

## Live Preview & Content Versioning

You can also combine content versioning with your live preview in React to be able to view previews of different versions. To implemnent that, go to **Settings** > **Data Model** > **Posts**, and enable content versioning by checking the content versioning box. Save the changes and refresh the page and then append `&version=<VERSION>` to the existing preview URL. This is how the page should look like:

![Enabling content versioning and adding version to preview URL](/img/adding-content-versioning-to-preview.png)

You will also need to update the "Post Previewer" user to allow it to read `directus_versions` so that it can access versioning data of the collection:

![Adding version access permissions to the non-public preview user](/img/adding-version-permission-to-review-user.png)

Next, update the `Post` component to retrieve the post version from the URL query parameter and pass it to the `readItem` call from Directus SDK:

```js
// Fetch the article using its id
const fetchArticle = async () => {
  const token = query.get("token");
  const isPreview = query.get("preview");
  let result
  
  // Replace the following line..
  // const getPost = (id) => readItem('posts', id)

  // ...with these two
  const version = query.get("version")
  const getPost = (id) => readItem('posts', id, {version})

  try {
    if (isPreview && token)
      result = await client.request(withToken(token, getPost(id)));
    else
      result = await client.request(getPost(id));
  } catch (error) {
    console.log('Error fetching article:', error);
    result = {
      title: "Post not found",
      content: "We couldn't find this post"
    }
  }
  setArticle(result);
};
```

And now, you can start versioning in your posts and view the previews for each of the versions independently.

![Viewing live preview of various content versions](/img/live-preview-of-content-versions.gif)

## Test Live Preview

At this point, you have implemented live preview for public and non-public posts with versioning support in your React app. You can try creating a new post and playing around with versions while the live preview correctly displays how your post would look like on your React app:

![Demo of live preview feature](/img/live-preview-complete-demo.gif)

You can also choose different viewpost sizes in the live preview to test how your blog post would look on various screen sizes and zoom settings:

![Various viewports available in live preview](/img/live-preview-viewports.gif)

## Summary

The live preview feature can help you improve your editing and review processes by integrating your React frontend directly in your Directus Data Studio. As you saw, you can set up live previews to be able to show non-public content as well as various versions of the same post very easily.

You can find the complete code for the React app built in this tutorial in [this GitHub repo](https://github.com/directus-labs/directus-live-preview-react.git).
