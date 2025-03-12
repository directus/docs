---
slug: using-authentication-in-next-js
title: Using Authentication in Next.js
authors:
  - name: Carmen Huidobro
    title: Developer Educator
description: Learn how to setup Directus authentication with Next.js.
---

### Introduction

Authentication is a critical part of any modern web application, ensuring that users can securely access their data and perform authorized actions. In this tutorial, you will learn how to implement authentication in your Next.js application using Directus' built-in authentication system.

### Before You Start

You will need:

- [A Directus project with admin access](https://github.com/directus-labs/guest-authors/blob/next-live-preview/getting-started/create-a-project).
- Fundamental understanding of Next.js concepts.
- Optional but recommended: Familiarity with data modeling in Directus.

## Set Up Your Directus Project

Before building our authentication system, let's configure Directus with the necessary collections and permissions.

### Create a Collection

Create a new collection called 'posts' with the `user_created` optional field and the following custom fields:

- `title` (Type: String)
- `content` (Type: Markdown)
- `author` (Type: User)

### Configure Roles, Policies, and Permissions

Create a new role called 'Authenticated User'. In this role, you will create a number of policies.

Create a 'Can Read and Create Posts' policy with the following permissions for the `posts` collection:

- Read: Allow
- Create: Custom
   - In Field Permissions, uncheck `author` so the user cannot set any value.
   - In Field Presets, add the following value to set the value automatically:

```
{
    "author": "$CURRENT_USER"
}
```
Create a 'Can Edit and Delete Own Posts' policy with the following permissions for the `posts` collection:

- Update: Custom
   - In Item Permissions, set `user_created` to `$CURRENT_USER` to only allow update actions for items created by the currently-authenticated user.
- Delete: Custom (use the same Item Permissions as Update)

Create a 'Can View and Edit Own Profile' policy with the following permissions for the `directus_users` collection:

- Read: Custom
   - In Item Permissions, set `id` to `$CURRENT_USER` to only allow users to view their own profile.
- Update: Custom (use the same Item Permissions as Read)

### Enable Public Registration

Public registration allows any user to create a user in your Directus project directly from the Data Studio or via API.

Navigate to Project Settings → User Registration and enable the setting. Set the default role to 'Authenticated User'. New users will automatically be given this role, which gives them all of the permissions you set up in the previous step.

![Directus' settings module showing that public registration is activated and the role set to "Authenticated User"](/img/auth_registration.png)

## Set Up Your Next.js Project

### Initialize Your Project

Create a new Next.js application using `create-next-app`:
Use create-next-app to initialize the project:

```bash
npx create-next-app@latest next-auth
cd next-auth
```

Check the following choices:

```
✔ Would you like to use TypeScript? …  Yes
✔ Would you like to use ESLint? …  Yes
✔ Would you like to use Tailwind CSS? …  No
✔ Would you like your code inside a `src/` directory? … No
✔ Would you like to use App Router? (recommended) … Yes
✔ Would you like to use Turbopack for `next dev`? … Yes
✔ Would you like to customize the import alias (`@/*` by default)? … No
```

Install the Directus SDK by running the following:

```bash
 npm install @directus/sdk
```

### Configure the Directus SDK

Create a new file at `./lib/directus.ts` with the following contents:

```typescript
import { authentication, createDirectus, rest } from '@directus/sdk';

const client = createDirectus("http://localhost:8055").with(rest()).with(authentication("cookie", { credentials: "include" }));

export default client;
```

This sets up a Directus client using the SDK that you will import into your pages later on, along with the necessary methods for retrieving posts.

### Implement User Registration

Create an API route for user registration in `./app/api/auth/register/route.ts`:

```typescript
import client from '@/lib/directus';
import { registerUser } from '@directus/sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const formData = await request.formData();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    try {
        await client.request(registerUser(email, password));
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard"
        return NextResponse.redirect(url);
    } catch {
        return NextResponse.json({ error: "Registration failed" }, { status: 500 });
    }
}
```

The above uses the Directus SDK's `registerUser` functionality to take the `email` and `password` fields from the submitted form and redirect to the dashboard page when successful.

Next, create your registration form at `./app/register/page.tsx`:

```typescript
export default function RegistrationPage() {
  return (
    <>
      <h2>Register</h2>
      <form action="/api/auth/register" method="POST">
        <label>Email</label>
        <input type="email" name="email" required />
        <label>Password</label>
        <input type="password" name="password" required />
        <button type="submit">Register</button>
      </form>
    </>
  );
}

```

The above form submits to the API route you created previously.

To give it a try, start your application in development mode with the command `npm run dev` and navigate to `http://localhost:3000/register`. Add an email and password and submit the form. If successful, you'll see a 404 page for navigating to the dashboard, which has yet to be created.

### Implement User Login

Create an API route for user login in `./app/api/auth/login/route.ts`:

```typescript
import client from '@/lib/directus';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    const formData = await request.formData();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    try {
        const response = await client.login(email, password);
        console.log(response);
        if (response.access_token) {
          (await cookies()).set('directus_session_token', response.access_token, { sameSite: 'strict', path: '/', secure: true })
        }
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard"
        return NextResponse.redirect(url);
    } catch (error) {
      console.log(error);
        return NextResponse.json({ error: "Registration failed" }, { status: 500 });
    }
}

```

The above uses the Directus SDK's `login` functionality to take the `email` and `password` fields from the submitted form and redirect to the dashboard page when successful.

Next, create your login form at `./app/login/page.tsx`:

```typescript
export default function LoginPage() {
  return (
    <>
      <h2>Login</h2>
      <form action="/api/auth/login" method="POST">
        <label>Email</label>
        <input type="email" name="email" required />
        <label>Password</label>
        <input type="password" name="password" required />
        <input type="submit" />
      </form>
    </>
  );
}

```

The above form submits to the API route you created previously.

To give it a try, start your application in development mode with the command `npm run dev` and navigate to `http://localhost:3000/login`. Add an email and password and submit the form. If successful, you'll see a 404 page for navigating to the dashboard, which has yet to be created.

### Session Cookie Authentication Mode

You may have noticed in `./lib/directus.ts` that the Directus client is initialized with the parameter `cookie` as a string.

This serves well for server-side rendering applications, such as what this tutorial covers.

### JSON Authentication Mode

For client-side applications, authentication can also be more conveniently done with JSON authentication. If you change the line in `./lib/directus.ts` to use `json` instead of `cookie` and try logging in, you'll notice in the server console that a refresh token is provided along with the access token. This is used to make a new access token after expiration.

For the rest of this tutorial, you'll continue using `cookie` authentication mode.

### Check if the User is Authenticated

Add a Data Access Layer (DAL) to your Next.js application at `./lib/dal.ts`:

```typescript
import 'server-only';
import { cookies } from 'next/headers';
import client from '@/lib/directus';
import { readMe } from '@directus/sdk';
import { redirect } from 'next/navigation';

export async function getUserData() {
    try {
        // Fetch the currently authenticated user's details
        const token = (await cookies()).get("directus_session_token")?.value;

        if (!token) {
          redirect("/login"); // Redirect if unauthorized
        }

        client.setToken(token)
        const user = await client.request(readMe());


        return { success: true, user };
    } catch (error) {
        console.log(error);
        redirect("/login"); // Redirect if unauthorized
    }
}

```

This can now be imported and used in protected routes.

### Authenticate Requests

Create a new page `./app/dashboard/page.tsx` with the following contents:

```typescript
import { getUserData } from '@/lib/dal'; // Import your DAL function
import client from '@/lib/directus';
import { readItems } from '@directus/sdk';

export default async function Dashboard() {
    const response = await getUserData();

    const posts = await client.request(readItems("posts"));

    return (
        <main>
            <h1>Welcome!</h1>
            <p>Your id: {response?.user?.id}</p>
            <section>
                <h2>Posts</h2>
                {posts.length > 0 ? (
                    <ul>
                        {posts.map((post) => (
                            <li key={post.id}>
                                <h3>{post.title}</h3>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No posts available.</p>
                )}
            </section>
        </main>
    );
}

```

Now this page will be shown upon logging in or registering a new account.

Since you're using session cookies, authorization is handled automatically.

You could otherwise make this request using the `Authorization: Bearer <token>`.

Additionally, you can also add the token as a query parameter: `?access_token=<token>`, though this can lead to the token being revealed or logged, so it's not recommended.

### Handling Errors

If a user tries to access a page they are not authorized to view, or if a record does not exist, Directus will return a 403 status code. You can handle this error by checking the response status code and redirecting the user to an error page.

### Refreshing Tokens

Temporary tokens will expire after some time, which can be rectified using the `refresh` functionality offered by the Directus SDK:
```typescript
import { createDirectus, authentication, rest, refresh } from '@directus/sdk';

const client = createDirectus('directus_project_url').with(authentication()).with(rest());

// refresh using the authentication composable
const result = await client.refresh();

// refresh http request using a cookie
const result = await client.request(refresh('cookie'));

// refresh http request using json
const result = await client.request(refresh('json', refresh_token));
```

### Logging Out

Create a new API route at `./app/api/auth/logout/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const url = request.nextUrl.clone();
        url.pathname = "/login"
  const response =  NextResponse.redirect(url);

  response.cookies.set("directus_session_token", "", {});

  return response;
}
```

Back in your dashboard, add a logout button that invokes this API route:

```typescript
import { getUserData } from '@/lib/dal'; // Import your DAL function
import client from '@/lib/directus';
import { readItems } from '@directus/sdk';

export default async function Dashboard() {
  const response = await getUserData();

  const posts = await client.request(readItems('posts'));

  return (
    <main>
      <form action="/api/auth/logout" method="POST">
        <button type="submit">Logout</button>
      </form>
      <h1>Welcome!</h1>
      <p>Your id: {response?.user?.id}</p>
      <section>
        <h2>Posts</h2>
        {posts.length > 0 ? (
          <ul>
            {posts.map((post) => (
              <li key={post.id}>
                <h3>{post.title}</h3>
              </li>
            ))}
          </ul>
        ) : (
          <p>No posts available.</p>
        )}
      </section>
    </main>
  );
}
```

### Summary

This tutorial sets you up to register, log in, log out, and view posts. You can expand on this further to create, update and delete posts.

[The code can be found in our GitHub repository](https://github.com/directus-labs/directus-auth-next).
