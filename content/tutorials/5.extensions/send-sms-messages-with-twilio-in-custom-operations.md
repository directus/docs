---
id: 79c82730-7768-4722-8538-7f3fecac3d43
slug: send-sms-messages-with-twilio-in-custom-operations
title: Send SMS Messages with Twilio in Custom Operations
authors:
  - name: Tim Butterfield
    title: Guest Author
description: Learn how to build a custom operation that uses the Twilio SDK.
---
Operations allow you to trigger your own code in a Flow. This guide will show you how to use the Twilio Node.js helper
library to send SMS messages in Flows.

![A Twilio SMS operation in a Flow](/img/63e8cd6f-d2d4-49a9-ab2f-0bb9d0da4446.webp)

## Install Dependencies

To follow this guide, you will need a Twilio API Key.

Open a console to your preferred working directory and initialize a new extension, which will create the boilerplate
code for your operation.

```shell
npx create-directus-extension@latest
```

A list of options will appear (choose operation), and type a name for your extension (for example,
`directus-operation-twilio-sms`). For this guide, select JavaScript.

Now the boilerplate has been created, install the Twilio library, and then open the directory in your code editor.

```shell
cd directus-operation-twilio-sms
npm install twilio
```

## Build the Operation UI

Operations have 2 parts - the `api.js` file that performs logic, and the `app.js` file that describes the front-end UI
for the operation.

Open `app.js` and change the `id`, `name`, `icon`, and `description`.

```js
id: 'operation-twilio-sms',
name: 'Twilio SMS',
icon: 'forum',
description: 'Send SMS using the Twilio API.',
```

Make sure the `id` is unique between all extensions including ones created by 3rd parties - a good practice is to
include a professional prefix. You can choose an icon from the library [here](https://fonts.google.com/icons).

With the information above, the operation will appear in the list like this:

<img src="/img/95933155-54a6-4292-82c0-4b4a9eaaffb6.webp" alt="Twilio SMS - Send SMS using the Twilio API. A chat icon is displayed in the box." style="padding: 2px 6px;">

`options` are the fields presented in the frontend when adding this operation to the Flow. To send an SMS, you will need
the phone number and a message. Replace the placeholder options with the following:

```js
options: [
	{
		field: 'phone_number',
		name: 'Phone Number',
		type: 'string',
		meta: {
			width: 'half',
			interface: 'input',
		},
	},
	{
		field: 'message',
		name: 'Message',
		type: 'text',
		meta: {
			width: 'full',
			interface: 'input-multiline',
		},
	},
],
```

- `phone_number` is a standard string input to allow for international numbers that begin with a plus (+).
- `message` uses an input-multiline field (textarea) to allow for a long message to be sent.

<img alt="A form shows all of the defined fields above" src="/img/e33c42fd-584c-4c13-9711-c6355980df1c.webp" style="padding: 8px 12px;">

The `overview` section defines what is visible inside the operation’s card on the Flow canvas. An overview object
contains 2 parameters, `label` and `text`. The label can be any string and does not need to match the field name. The
text parameter can be a variable or just another string.

It will be useful to see both fields on the card. Replace the placeholder objects with the following:

```js
overview: ({ phone_number, message }) => [
	{
		label: 'Phone Number',
		text: phone_number,
	},
	{
		label: 'Message',
		text: message,
	},
],
```

Now, the overview of the operation looks like this:

<img src="/img/63ed0382-11ba-49db-b458-e8ddcacfb035.webp" alt="The flow overview card shows a phone number and message." style="max-width: 400px;"/>

## Build the API Function

Open the `api.js` file, import the Twilio library and update the `id` to match the one used in the `app.js` file:

```js
import twilio from 'twilio';

export default {
	id: 'operation-twilio-sms',
	handler: () => {
		// ...
	},
};
```

The handler needs to include the fields from the `app.js` options and the environment variables from Directus. Replace
the handler definition with the following:

```js
handler: ({ phone_number: toNumber, message }, { env }) => {
```

Set up the Twilio API and environment variables with the following code. These environment variables will need to be
added to the project when installing this extension.

```js
const accountSid = env.TWILIO_ACCOUNT_SID;
const authToken = env.TWILIO_AUTH_TOKEN;
const fromNumber = env.TWILIO_PHONE_NUMBER;
const client = new twilio(accountSid, authToken);
```

Use the Twilio `messages` endpoint and create a new message, setting the `body`, `to`, and `from` parameters. `body`
will use the message variable from our handler, `to` will use the `phone_number` variable from our handler, aliased as
`toNumber` for clarity, and `from` will use the `fromNumber` constant from the environment variable
`TWILIO_PHONE_NUMBER`.

```js
client.messages
	.create({
		body: message,
		to: toNumber,
		from: fromNumber,
	})
	.then((response) => {
		return response;
	})
	.catch((error) => {
		return error;
	});
```

Make sure the return the `response` and `error` so they can be included in the Flow’s log.

Both files are now complete. Build the operation with the latest changes.

```
npm run build
```

## Add Operation to Directus

When Directus starts, it will look in the `extensions` directory for any subdirectory starting with
`directus-extension-`, and attempt to load them.

To install an extension, copy the entire directory with all source code, the `package.json` file, and the `dist`
directory into the Directus `extensions` directory. Make sure the directory with your extension has a name that starts
with `directus-extension`. In this case, you may choose to use `directus-extension-operation-twilio-sms`.

Ensure the `.env` file has `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER` variables.

Restart Directus to load the extension.

::callout{icon="material-symbols:info-outline"}

Only the `package.json` and `dist` directory are required inside of your extension directory. However, adding the source
code has no negative effect.

::

## Use the Operation

In the Directus Data Studio, open the Flows section in Settings. Create a new flow with an event trigger. Select the
collection(s) to include.

If the payload does not contain the phone number, use the **Read Data** operation to fetch the phone number from the
relevant collection. Add a new operation by clicking the tick/plus on the card, then choose **Twilio SMS** from the
list.

<img alt="The full form is filled with values." src="/img/c42f757f-734c-4c11-96c5-6090e7e7bc97.webp" style="padding: 8px;">

- For the **Phone Number**, you can use a dynamic value from a payload such as
  `{{$trigger.payload.phone_number}}` or type a static number in the field.
- For the **Message**, type anything that you would like to send and remember to shorten your links.

Save the operation, save the Flow, and then trigger the flow by creating a record in the chosen collection.

## Summary

This operation will create a Twilio API request to send an SMS using the supplied number and message and the response is
captured in the logs for reference. Now that you know how to interact with a third party API, you can investigate other
services that can be used in your workflows.

## Complete Code

`app.js`

```js
export default {
	id: 'operation-twilio-sms',
	name: 'Twilio SMS',
	icon: 'forum',
	description: 'Send SMS using the Twilio API.',
	overview: ({ phone_number, message }) => [
		{
			label: 'Phone Number',
			text: phone_number,
		},
		{
			label: 'Message',
			text: message,
		},
	],
	options: [
		{
			field: 'phone_number',
			name: 'Phone Number',
			type: 'string',
			meta: {
				width: 'full',
				interface: 'input',
			},
		},
		{
			field: 'message',
			name: 'Message',
			type: 'text',
			meta: {
				width: 'full',
				interface: 'input-multiline',
			},
		},
	],
};
```

`api.js`

```js
import twilio from 'twilio';

export default {
	id: 'operation-twilio-sms',
	handler: ({ phone_number: toNumber, message }, { env }) => {
		const accountSid = env.TWILIO_ACCOUNT_SID;
		const authToken = env.TWILIO_AUTH_TOKEN;
		const fromNumber = env.TWILIO_PHONE_NUMBER;
		const client = new twilio(accountSid, authToken);

		client.messages
			.create({
				body: message,
				to: toNumber,
				from: fromNumber,
			})
			.then((response) => {
				return response;
			})
			.catch((error) => {
				return error;
			});
	},
};
```
