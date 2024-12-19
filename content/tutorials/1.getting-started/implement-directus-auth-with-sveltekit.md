---
id: 8dc47c51-9bfc-444c-9e6b-d4af570b862e
slug: implement-directus-auth-with-sveltekit
title: Implement Directus Auth with SvelteKit
authors:
  - name: Eike Thies
    title: Guest Author
---
In this guide, we will set up a complete authentication and authorization mechanism in SvelteKit using Directus. The user session will be persisted via Server-Side Cookies and be used by the Directus SDK to make authenticated requests. As an example, we will create a new Role showing how authorization works.

## A Primer on Authentication

For authentication, a user session is typically used - a mechanism to identify a user between multiple requests. There are different ways how to store the user session, such as cookies or tokens. Cookies are sent by the browser automatically with every request to the same domain, with tokens being stored locally and needing to be sent manually with each request. Both ways have their pros and cons. Cookies are more secure as they are not accessible from the JavaScript context.

In this guide, we will use the most secure form via Server-Side Cookies using the `Same-Site=Strict` attribute which will prevent CSRF Attacks. CSRF Attacks are possible if the user is logged in and the attacker can make the user's browser send requests to the server. This is possible if the attacker can make the user visit a malicious website, which can then make the user's browser send requests to the server. If the user is logged in, the server will accept the request and execute it. This is prevented by the `Same-Site=Strict` attribute which only allows requests from the same domain.

## Adapt Directus Wrapper

In [Getting Started with Directus and SvelteKit](/tutorials/getting-started/fetch-data-from-directus-with-sveltekit), we created a wrapper around the Directus JavaScript SDK to use with SvelteKit. This guide assumes you have worked through the previous post. 

First we need to define the Domain the Cookie is valid for in the  `.env` file of our root project:

```
PUBLIC_APIURL='https://directus.example.com'
PUBLIC_COOKIE_DOMAIN='example.com' // [!code ++]
```

In [Getting Started with Directus and SvelteKit](/tutorials/getting-started/fetch-data-from-directus-with-sveltekit), we create a wrapper which makes the Directus SDK available to our project. In this project, we will adapt the `libs/directus.js` wrapper to utilize the token and define a global cookie options schema:

```js
import { createDirectus, rest  } from "@directus/sdk"; // [!code --]
import { createDirectus, rest, authentication  } from "@directus/sdk"; // [!code ++]
import { PUBLIC_APIURL } from '$env/static/public'; // [!code --]
import { PUBLIC_APIURL,PUBLIC_COOKIE_DOMAIN } from '$env/static/public'; // [!code ++]

function getDirectusInstance(fetch,token) {
	const options = fetch ? { globals: { fetch } } : {};

	const directus = createDirectus(PUBLIC_APIURL, options)
		.with(authentication('cookie', { credentials: 'include' })) // [!code ++]
		.with(rest());

	if(token) directus.setToken(token); // [!code ++]

	return directus;
}

export default getDirectusInstance;

export const constructCookieOpts = (age) => { // [!code ++]
	return { // [!code ++]
    	'domain': PUBLIC_COOKIE_DOMAIN, // [!code ++]
        
        // send cookie for every page // [!code ++]
        'path': '/', // [!code ++]
        
        // server side only cookie so you can't use `document.cookie` // [!code ++]
        'httpOnly': true, // [!code ++]
        
        // only requests from same site can send cookies // [!code ++]
        'sameSite': "strict", // [!code ++]
        
        // only sent over HTTPS in production // [!code ++]
        'secure': process.env.NODE_ENV === 'production', // [!code ++]
 
        // set cookie to expire after a given time // [!code ++]
        'maxAge': age // [!code ++]
	} // [!code ++]
} // [!code ++]
```

## Create the Login Form

Let's start the user journey from adding a login/signup form with a `/signin/+page.svelte` file:

```svelte 
<script lang="ts">
	/** @type {import('./$types').PageData} */
	import { page } from '$app/stores';
	let email,password;
	export let form;
	const redirectedFrom = $page.url.searchParams.get('redirectedFrom')
</script>

{#if form?.message}
	<p>{form.message}</p>
{/if}

<form
	action="?/login{redirectedFrom?`&redirectedFrom=${redirectedFrom}`:''}"
	method="POST">
	<div>
		<label for="email">Email</label>
		<input id="email" name="email" type="text" bind:value={email}	
		/>
	</div>

	<div>
		<label for="password">Password</label>
		<input id="password" name="password" type="password" required bind:value={password}	
		/>
	</div>

	<button type="submit">Log in</button>
	<button formaction="?/register{redirectedFrom?`&redirectedFrom=${redirectedFrom}`:''}">Register</button>
</form>
```

The small function lets us redirect the user to a page they were trying to access before needing to login/signup. Also any message from the server side will be displayed, e.g. if the user entered a wrong password. The SvelteKit form action below will handle the actual request. 

The Directus SDK is not saving Cookies with the HTTP-only Option enabled and we want to set the Cookie on the server, thus we need to access the Directus API directly from SvelteKit ourself and save the tokens in a secure cookie via SvelteKit's cookie handler. Open a `/signin/+page.server.js` file:

```js
import { redirect,fail } from '@sveltejs/kit';
import { PUBLIC_APIURL } from '$env/static/public';
import { constructCookieOpts } from '$lib/directus';

// Set in days - sync this with the Setting from Directus.
const REFRESH_TOKEN_TTL = 7; 

// This makes sure that the login page is only available if the user is not logged in yet
export const load = async ({ locals,url }) => {
	if (locals.token) redirect(302, '/profile')
	return {};
}

// This calls the Directus API login endpoint
const loginUser = async (request,email,password) => {
	let req = await fetch(`${PUBLIC_APIURL}/auth/login`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'user-agent':request.headers.get("user-agent"),
		},
		body: JSON.stringify({
			email,
			password
		})
	});
	if(req.status >= 300){
		throw new Error(await req.text());
	}
	req = await req.json();
	return req.data;
}

const login = async ({ cookies, request, url }) => {
	const data = await request.formData();
	const email = data.get('email');
	const password = data.get('password');
	const redirectedFrom = url.searchParams.get('redirectedFrom');

	try {
		let tokens = await loginUser(request,email,password);

		// save cookies
		cookies.set('access_token',tokens.access_token, constructCookieOpts(Math.floor(tokens.expires/1000)));
		cookies.set('refresh_token', tokens.refresh_token, constructCookieOpts(60 * 60 * 24 * REFRESH_TOKEN_TTL));
	} catch (err) {
		return fail(400, { message: err.message});
	}

	// redirect to the page the user was trying to access before. If there is no such page, redirect to the profile page
	redirect(302, redirectedFrom ? redirectedFrom : `/profile`)
}
```

Registering a new user works similar to the login. We will first create the user and then login the user. The only difference is that we need to create a new user via the Directus API. We will also use the same login function as before to login the user after creating the user. Within `/signin/+page.server.js`:

```js
const register = async ({ cookies, request, url }) => {
	const data = await request.formData();
	const email = data.get('email');
	const password = data.get('password');
	const redirectedFrom = url.searchParams.get('redirectedFrom')

	//a) First create the user
	let signupRequest = await fetch(`${PUBLIC_APIURL}/users/register`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'user-agent':request.headers.get("user-agent")
		},
		body: JSON.stringify({
			email,
			password
		})
	});
	if(signupRequest.status >= 300){
		return fail(400, { message: await signupRequest.text() });
	}

	try {
		// b) then login the user as usual
		let tokens = await loginUser(request,email,password);

		// save cookies
		cookies.set('access_token',tokens.access_token, constructCookieOpts(Math.floor(tokens.expires/1000)));
		cookies.set('refresh_token', tokens.refresh_token, constructCookieOpts(60 * 60 * 24 * REFRESH_TOKEN_TTL));
	} catch (err) {
		return fail(400, { message: err.message });
	}

	redirect(302, redirectedFrom ? redirectedFrom : `/profile`)
}

export const actions = { login,register }
```

## Enable User Registration and Setup Directus Roles

Before you open `http://localhost:5173/signup` and create a new test user, let's define a new default role called `user` which all new users will inherit upon creating an account. Within the Directus Admin App go to Settings -> Access Control -> Create new Role and name it `Users`. App Access should be enabled.

Public user registration is disabled by default. To make use of it, it must first be enabled via your project settings. When enabling it, select your new author role as the role given to newly-registered users.

::callout{type="info" title="Email Verification"}

If you want to test the registration process, you should also disable "Verify Email" on the same screen. Otherwise, you will need to adapt the registration code above to not directly login the user but instead show a message that the user needs to verify their email first.

::

Let's now try to register a new user for example `test@example.com` and password `test123`. You should see a 404 page as we do not yet have a profile page.  Even though the actual user is created in Directus and the cookie is set, the user is not logged in. This is because the cookie is only saved, but not read for every request.

## Handle Authentication State

Next up, we need to handle the actual Cookie and keep the user remain logged in. For that, adapt the `hooks.server.js` file.

```js
import jwt from "jsonwebtoken";
import { PUBLIC_APIURL } from '$env/static/public';
import { redirect } from '@sveltejs/kit';
import { constructCookieOpts } from '$lib/directus';

const TOKEN_EXPIRATION_BUFFER = 300;

// exchange the refresh token for an access token
async function refreshAccessToken(cookies) {
		let res = await fetch(PUBLIC_APIURL + "/auth/refresh", {
			method: "POST",
			mode: "cors",
			headers: {
				Accept: "application/json, text/plain, */*",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ refresh_token: cookies.get('refresh_token') }),
		});

		if (res.status >= 300) {
			cookies.delete('refresh_token', { path:'/' });
			cookies.delete('access_token', { path:'/' });
			throw new Error("Refresh Token Status != 200");
		}
		let data = (await res.json()).data;

		cookies.set("refresh_token", data.refresh_token, constructCookieOpts(60 * 60 * 24 * 30));
		cookies.set("access_token", data.access_token, constructCookieOpts(Math.floor(data.expires/1000)));
	}

function isTokenExpired(jwtPayload){
		return jwtPayload?.exp < Math.floor(Date.now()/1000) + TOKEN_EXPIRATION_BUFFER;
}

function shouldProtectRoute(url) {
		return url.split("/").includes("(protected)")
}

export async function handle({event, resolve}) {
		const { cookies,url } = event

		if (cookies.get('access_token') || cookies.get('refresh_token')) {
				let jwtPayload = cookies.get('access_token') ? jwt.decode(cookies.get('access_token')) : false;

				//check if token is expired and renew it if necessary
				if (isTokenExpired(jwtPayload) || !cookies.get('access_token')) {
					try {
						await refreshAccessToken(cookies);
						jwtPayload = cookies.get('access_token') ? jwt.decode(cookies.get('access_token')) : false;
					} catch (err) {
						cookies.delete('refresh_token', { path:'/' });
						cookies.delete('access_token', { path:'/' });
					}
				}

				event.locals.user = jwtPayload?.id;
				event.locals.token = cookies.get('access_token');
		}

		if (event.route.id && shouldProtectRoute(event.route.id) && !event.locals.user) {
				redirect(302,`/signin?redirectedFrom=${encodeURIComponent(url.pathname)}`)
		}

		// this is needed so that the response headers from SvelteKit do include the correct header to allow the browser to parse json requests
		return await resolve(event, {
				filterSerializedResponseHeaders: (key, value) => {
						return key.toLowerCase() === 'content-type'
				}
		});
}
```

Every request will touch the logic in this file. It checks tokens and, if valid, sets the user id and the token to the locals object, which can be accessed throughout SvelteKit's load functions. If the Access Token is expired, a new one will be generated. Finally, we can define routes under the `(protected)` Directory. The "protected" keyword will not appear in the url, but is only visible in our file structure.

In order for the authentication to work, however, we also need to tell SvelteKit to actually pass those local variables through to every other load function.

Create a `/+layout.server.js` file:

```js
/** @type {import('./$types').LayoutServerLoad} */
export async function load({locals}) {
	return {
		user: locals.user,
		token: locals.token
	};
}
```

## Create a Profile Page

The locals will now be used in every `+page.js` file to initialize the Directus SDK with the user's session token. To test this out, let's now create our `profile` page, which is only accessible if the user is logged in.

```js [/(protected)/profile/+page.js]
import getDirectusInstance from "$lib/directus";
import { readMe } from "@directus/sdk";
import { error } from "@sveltejs/kit";
export async function load({ parent, fetch }) {
	const { token } = await parent();
	const directus = getDirectusInstance(fetch, token);
	try {
		return {
			user: await directus.request(
				readMe({
					fields: ["*"],
				})
			),
		};
	} catch (err) {
		error(404, "User not found");
	}
}
```

```svelte [/(protected)/profile/+page.svelte]
<script>
	export let data;
</script>

<p>This is only visible if you are logged in</p>

<p>Your Email: {data.user.email}</p>
```

As you see, we are getting the token and initialize our Directus Instance as usual. This time however, we also give it the Access Token so that every request will now have the User's Session attached. In this case, we are reading the user's profile. If you try this without the token, the request will fail because of missing permissions.

To use data from Directus in the page we must export a `data` variable.

You should now see a simple profile page if you are logged in under `http://localhost:5173/profile`.

![An example of a profile page showing the users email](https://product-team.directus.app/assets/f55a140e-95b5-4c8d-a3d1-dcf4c7372daf.webp)

## Authenticated Client Requests

Until now we have used the Directus SDK solely in the load functions. In order to also use it on the client we can define a global context object, which we can use on every svelte component. For this the `+layout.svelte` file needs to be adapted:

```svelte
<script>
		export let data;
		import getDirectusInstance from '$lib/directus'; // [!code ++]
		import { setContext } from 'svelte'; // [!code ++]
		const directus = getDirectusInstance(fetch,data.token) // [!code ++]
		setContext('directus', directus); // [!code ++]
</script>

<a href="/">Home</a>
<a href="/pages/about">About</a>
<a href="/pages/conduct">Code of Conduct</a>
<a href="/pages/privacy">Privacy Policy</a>
<a href="/blog">Blog</a>

{#if data.token} // [!code ++]
		<a href="/logout" data-sveltekit-preload-data="off">logout</a> // [!code ++]
{:else} // [!code ++]
		<a href="/signin">signin</a> // [!code ++]
{/if} // [!code ++]

<div>
		<slot></slot>
</div>
```

As you see, we also change the layout based on the login state and already add a logout endpoint for later usage. The actual logout link has a attribute which prevents SvelteKit from preloading the data. This is important because we do not want to call the logout endpoint on hovering the link.

An example to use the Directus SDK on the client is now to change the user's email in the profile page. Do the following changes to the profile component (`/(protected)/profile/+page.svelte`):

```svelte
<script>
	import { getContext } from 'svelte'; // [!code ++]
	import { updateMe } from '@directus/sdk'; // [!code ++]
	export let data;

	const directus = getContext('directus'); // [!code ++]
    
	async function changeEmail() { // [!code ++]
		await directus.request(updateMe({email:data.user.email})) // [!code ++]
	} // [!code ++]
</script>

<p>This is only visible if you are logged in</p>

<p>Your Email: {data.user.email}</p>

<div> // [!code ++]
	<label for="email">Your E-Mail</label> // [!code ++]
	<input bind:value={data.user.email} required type="email" autocomplete="email" autocapitalize="off" /> // [!code ++]
	<button on:click={changeEmail}>Change Email</button> // [!code ++]
</div> // [!code ++]
```

Open `http://localhost:5173/profile` and change the email of your current logged-in user. Refresh the page to make sure that the value was persisted correctly.

## Logout Functionality

Lastly, let's define a server endpoint to enable logout functionality. Create a `/(protected)/logout/+server.js` file:

```js 
import { redirect,error } from '@sveltejs/kit';
import { PUBLIC_APIURL } from '$env/static/public';

export async function GET({locals,request,cookies}) {
	try {
		if(cookies.get('refresh_token'))
			await fetch(`${PUBLIC_APIURL}/auth/logout`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'user-agent':request.headers.get("user-agent")
				},
				body: JSON.stringify({ refresh_token: cookies.get('refresh_token') })
			});
	} catch (err) {
		error(400,err);
	}

	cookies.delete('refresh_token', { path: '/' });
	cookies.delete('access_token', { path: '/' });

	redirect(302,`/signin`);
}
```

This will simply delete the cookies and also calls the Directus API to invalidate the stored session in the Database. Then redirecting the user back to the login page. You can try this out by just opening `http://localhost:5173/logout`.

Add a `data-sveltekit-reload` attribute to your logout links and it will automatically update layouts with your new logged-out status. 

# Summary

In this guide, we have set up authentication and authorization in SvelteKit using Directus. It allows complex role based authorization schemas with granular control over what a logged-in user can access and do in your Directus-backed App.

