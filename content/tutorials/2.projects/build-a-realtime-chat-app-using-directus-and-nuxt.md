---
slug: build-a-realtime-chat-app-with-directus-and-nuxt
title: Build a Realtime Chat App with Directus and Nuxt
authors:
  - name: Craig Harman
    title: Guest Author
description: Learn how to setup Directus realtime with Nuxt.
---
Directus offers realtime capabilities, powered by websockets. You can use these with the Directus SDK to create your own realtime applications. In this tutorial, you will build a chat application using Nuxt and a Directus project.
a
## Before You Start

You will need:

- A Directus project with admin access.

- Fundamental understanding of Nuxt concepts.

- Optional but recommended: Familiarity with data modeling in Directus.

## Set Up Your Directus Project

### Create a Collection

Create a new collection called `messages` with the following fields:

- `content` (Type: textarea)

After which you can go to the optional fields and activate the following:

- `user_created`

- `date_created`

### Edit Public Policy

So that Nuxt can access the messages collection you need to edit the public policy. Navigate to Settings -> Access Policies -> Public
and under Permissions add `messages` with full access for `create` and `read`.

The frontend will display the name of the user who created the message so the public policy will also need to have access to the `directus_users` collection. Add `directus_users` with custom `read` access and under Field Permissions check `first_name` and `last_name`.

### Create a User for Chatting

Messages will need to be assigned to a user. Create a new user in Directus by navigating to User Directory -> Add User and create a new user. Be sure to remember the email and password you use. Assign the user with the Public policy that was edited in the previous step by clicking "Add Existing" under policies and selecting "Public".

### Configure Realtime

Directus Realtime may disabled on self-hosted projects. To enable it if you are using Docker, edit your `docker-compose.yml` file as follows:

```yml
environment:
  WEBSOCKETS_ENABLED: "true"
  WEBSOCKETS_HEARTBEAT_ENABLED: "true"
```

If you use Directus Cloud to host your project, you do not need to manually enable Realtime.

## Set Up Your Nuxt Project

### Initialize Your Project

Create a new Nuxt project using [Nuxi](https://nuxt.com/docs/api/commands/init):

```bash
npx nuxi@latest init directus-realtime
cd directus-realtime
```

Note: Just hit enter when asked to select additional packages (none are required for this project).

### Configure Nuxt

Configure Nuxt so that it is able to communicate with the (external) Directus API. 

Create a `.env` file with the Directus URL:  

```
API_URL="http://0.0.0.0:8055"
```

Add a type definition for our new environment variable by creating an `env.d.ts` file with the following content:

  ```ts
  /// <reference types="vite/client" />
  interface ImportMetaEnv {
  	readonly API_URL: string;
  }
    
  interface ImportMeta {
  	readonly env: ImportMetaEnv;
  }
  ```

Depending on your project configuration and if you are in development or production you may need to configure a Nuxt proxy to allow access between your Nuxt project and Directus in your `nuxt.config.ts`:

  ```ts
  routeRules: {
      "/directus/**": { proxy: `${import.meta.env.API_URL}/**` },
    },
  ```

This will allow your Nuxt project to access directus via your Nuxt URL, eg. [http://localhost:3000/directus](http://localhost:3000/directus)

Inside your Nuxt project, install the Directus SDK package by running:

```bash
npm install @directus/sdk
```

### Define a Directus Schema

TypeScript needs to know what the structure of the Directus data is. To achieve this create a `directus.d.ts` file in the root of our project which defines our schema:

```ts
/// <reference types="@directus/extensions/api.d.ts" />
interface DirectusSchema {
	messages: Message[];
}
interface Message {
	id: number;
	content: string;
	user_created: string;
	date_created: string;
}
```

### Use Nuxt page router

Configure Nuxt to use the page router by editing `app.vue` replacing the content with:

```html
<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>
```

### Create a Directus plugin

Create a Nuxt plugin to streamline accessing Directus throughout your application. Create a new file `plugins/directus.ts`
Copy and paste in the code below, replace the `your-website-url` with your Nuxt URL and port:

```ts
import { createDirectus, realtime } from "@directus/sdk";
const directus = createDirectus<DirectusSchema>(
	"http://your-website-url/directus",
).with(realtime());
export default defineNuxtPlugin(() => {
	return {
		provide: { directus },
	};
});
```

This file handles all the interaction with Directus and provides Nuxt with the required Directus SDK features.


### Create a Login Form

The chat system will need to know who is sending messages to Directus so the user will need to login before they can send messages. The websocket will return a refresh token Nuxt can use this to determine if a user is logged in. In `pages/index.vue` script set up add some variables to store the token and the login credentials.

```ts
<script setup lang="ts">
const { $directus } = useNuxtApp()

const refreshToken: Ref<string | undefined> = ref()
const credentials = ref({
	email: '',
	password: ''
})
</script>
```

Then, in the template, add a form to capture the user's email and password and display it if there is no token.

```html
<template>
	<div>
		<h1>Directus Realtime Chat</h1>
		<div v-if="refreshToken === undefined">
			<h2>Login</h2>
			<input v-model="credentials.email" type="text" placeholder="Email" /><br />
			<input v-model="credentials.password" type="password" placeholder="Password" /><br />
			<button @click="login" type="button">Login</button>
		</div>
		<div v-else>
			<h2>Chat</h2>
			<div>Logged in</div>
		</div>
	</div>
</template>
```

If you run `npm run dev` and navigate to `http://localhost:3000` you should see a login form.

Directus Realtime (Websockets) will be used to authenticate the user as well as send and receive messages. To connect the client to Directus use [handshake mode](https://directus.io/docs/guides/realtime/authentication#handshake-mode) which requires a connection followed quickly and immediately by an authentication.

After the variable definitions in `pages/index.vue` script setup add the following code:

```ts
const saveRefreshToken = (token: string) => {
	refreshToken.value = token
	localStorage.setItem('directus_refresh_token', token)
}

onMounted(() => {
	const storedToken = localStorage.getItem('directus_refresh_token')
	if (storedToken) {
		refreshToken.value = storedToken
		$directus.connect()
		$directus.onWebSocket('open', () => {
			$directus.sendMessage({
				type: 'auth',
				refresh_token: storedToken
			})
		})
	} else {
		$directus.connect()
	}


	const cleanup = $directus.onWebSocket('message', (message) => {
		if (message.type === 'auth' && message.status === 'ok') {
			saveRefreshToken(message.refresh_token)
		}
	})

	onBeforeUnmount(cleanup)
})

const login = async () => {
	const login = {
		type: 'auth',
		email: credentials.value.email,
		password: credentials.value.password
	}
	$directus.sendMessage(JSON.stringify(login))
}
```

The code added above does the following:

1. Check if there is an existing refresh token in local storage. If there is, connect to Directus and authenticate using the refresh token. If not, just connect to Directus.
2. Set up a listener for the `message` event on the websocket. When any message is received, check if it is an authentication message and if it is, save the refresh token to local storage.
3. Provide a login function that sends the credentials from the login form to Directus for authentication.

Visit `http://your-website-url` and try logging in with the user you created in Directus in the steps above.

### Subscribe to Incoming Messages

Although `$directus.onWebSocket('message', (message) => {}` will receive all messages, the Directus SDK provides a more convenient way to subscribe to specific events. In this case the client can subscribe to the `messages` collection to receive specific fields from any messages as they are created and uniquely identify our subscription with a [UID](https://directus.io/docs/guides/realtime/actions#use-uids-to-better-understand-responses) for [best practice](https://directus.io/docs/guides/realtime/subscriptions#using-uids).

At the bottom of the setup script in `pages/index.vue` add the following code:

```ts
const messageList: Ref<Message[]> = ref([])

const subscribe = async (event) => {
	const { subscription } = await $directus.subscribe('messages', {
		event,
		query: {
			fields: ['*', 'user_created.first_name'],
		},
		uid: "messages-subscription"
	})

	for await (const message of subscription) {
		receiveMessage(message)
	}
}

const receiveMessage = (data) => {
	if (data.type === 'ping') {
		$directus.sendMessage({
			type: 'pong',
		})
	}
	if (data.type === 'subscription' && data.event === 'create') {
		const message = data.data[0]
		addMessageToList(message)
	}
}

const addMessageToList = (message: Message) => {
	messageList.value.push(message)
}
```

This subscribes to the `messages` collection when the user is authenticated. Update the cleanup function to include the subscription:

```ts
const cleanup = $directus.onWebSocket('message', (message) => {
  if (message.type === 'auth' && message.status === 'ok') {
    saveRefreshToken(message.refresh_token)
    subscribe('create')
  }
})
```

Then display the message list in the template by updating the `else` condition:

```html
<div v-else>
  <h2>Chat</h2>
  <div v-for="message in messageList" :key="message.id">
    {{ message.user_created.first_name }}: {{ message.content }}
  </div>
</div>
```

Visit `http://your-website-url` and you should see an empty chat window after logging in. **Be sure to refresh the page rather than relying on hot reload which may cause connections issues with websockets**. Go back to Directus (hint: this is best done with 2 browser windows side by side) and create a new message in the `messages` collection. You should see the message appear in the chat window.

## Send Messages

Having proven that Nuxt can receive messages created in Directus, add a new form to our template to send messages from Nuxt. In the template section of `pages/index.vue` replace the existing `else` statement with the following:

```html
<div v-else>
  <h2>Chat</h2>
  <div v-for="message in messageList" :key="message.id">
    {{ message.user_created.first_name }}: {{ message.content }}
  </div>
  <form @submit.prevent="messageSubmit">
    <label for="message">Message</label>
    <input v-model="newMessage" type="text" id="text" />
    <input type="submit" />
  </form>
  <button type="button" @click="logout">Logout</button>
</div>
```

Now add code to the script setup section of `pages/index.vue` to make the form work. Directly under the last function, add the following:

```ts
const newMessage: Ref<string> = ref('')
const messageSubmit = () => {
	$directus.sendMessage({
		type: 'items',
		collection: 'messages',
		action: 'create',
		data: { content: newMessage.value },
	})

	newMessage.value = ''
}

const logout = () => {
	$directus.sendMessage({
		type: 'auth',
		action: 'logout',
	})
	refreshToken.value = undefined
	localStorage.removeItem('directus_refresh_token')
}
```

Visit your website url again (remember to refresh) and enter a message in the form and submit it. The message should appear in the chat window, with the first name of the user. You can also logout of the chat by clicking the logout button but if you do this you will notice the previously added messages have disappeared.

## Fetching the Latest Messages On Load

When the page first loads there are no messages in the chat window. This can be fixed by making a request for the latest messages from Directus using a realtime message when the page first loads. Add another function to the script setup section of `pages/index.vue`:

```ts
const readAllMessages = () => {
	$directus.sendMessage({
		type: 'items',
		collection: 'messages',
		action: 'read',
		query: {
			limit: 10,
			sort: '-date_created',
			fields: ['*', 'user_created.first_name'],
		},
		uid: 'get-recent-messages'
	})
}
```

To call this function when the page loads, replace the `cleanup` function with the following:

```ts
const cleanup = $directus.onWebSocket('message', (message) => {
  if (message.type === 'auth' && message.status === 'ok') {
    saveRefreshToken(message.refresh_token)
    if (messageList.value.length === 0) {
      readAllMessages()
      subscribe('create')
    }
  }

  // The only message of type items required to process is the initial array of messages
  // All other messages are handled by the subscription
  if (message.uid === 'get-recent-messages' && message.type === 'items') {
    for (const item of message.data) {
      messageList.value.unshift(item)
    }
  }
})
```

When the message list is returned Nuxt can identify it by the `uid` that was set in the `readAllMessages` function. Messages are then added to the message list in reverse order so that the most recent messages are at the bottom.

Visit your website url again and refresh the page. You should see the last 10 messages in the chat window.

## Handling Connection Stability

Directus Realtime uses websockets to maintain a connection to the server. Behind the scenes Directus is sending a heartbeat or ping message every 30 seconds to keep the connection alive. If the connection is lost, then the user will not receive updates. Nuxt already responds to this message in `receiveMessage` by sending a pong message back to Directus.

To ensure a stable connection [use the refresh token from handshake mode](https://directus.io/docs/guides/realtime/authentication#handshake-mode) to re-authenticate the user and re-subscribe to the messages collection.

At the bottom of the script setup section in `pages/index.vue` add the following code:

```ts
$directus.onWebSocket('close', () => {
	if (refreshToken.value) {
		$directus.connect()
		$directus.sendMessage({
			type: 'auth',
			refresh_token: refreshToken.value
		})
	}
})
```

Now if the connection is lost, Nuxt will attempt to reconnect and re-authenticate the user.

## Summary

Realtime communication via websockets is a powerful feature of Directus that can be used, not just for message communication but also user authentication and data filtering and synchronization. 

The full code from this tutorial can be found on [Github](https://github.com/craigharman/directus-guest-authoring/tree/master/019-directus-realtime-chat).
