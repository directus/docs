---
slug: build-forms-dynamically-using-directus-and-next
title: Build Forms Dynamically using Directus and Next.js
authors:
  - name: Kumar Harsh
    title: Guest Author
description: Learn how to setup Directus fields with Next.js.
---

Directus' data studio allows you to create data for your collections. You can then leverage these collections with Next.js to generate dynamic and interactive forms for your application.

## Before You Start

You will need:

- A Directus project with admin access.
- Fundamental understanding of Next.js and React concepts.
- Optional but recommended: Familiarity with data modeling in Directus.

## Set Up Your Directus Project

To get started, set up a Directus project either using [Directus Cloud](https://directus.io/cloud) or by self-hosting it using [Docker](https://docs.directus.io/self-hosted/docker-guide.html). Then, follow the steps below:

### Create a Collection

Create a new collection called `posts` with the following fields:

- `title` (Type: String) *required
- `content` (Type: markdown) *required
- `slug` (Type: String) *required
- `category` (Type: Dropdown with options of `blog post`, `tutorial` and `announcement`)
- `published` (Type: datetime)

On the data model page for the `posts` collection click on the 3 dots next to the `slug` field and select `half-width` to make the field half the width of the form. Repeat the same for the `category` field.

### Add slug validation

Directus has a default setting that can be applied to the slug field to ensure that only URL safe characters are used however for the sake of illustration we are going to add our own validation to this field which can be shared with the Next.js app on the frontend.

Click on the `slug` field then click Validation and create a Regex validation with the expression `^[a-z0-9]+(?:-[a-z0-9]+)*$`. Add a custom validation message `Slug must use URL valid characters` and save.

![Custom validation for slug field](/img/custom-validation-for-slug-field.png)

### Edit Public Policy

Next, to allow viewing the posts collections and field listings as an unauthenticated user, you will need to modify the public [access policy](https://directus.io/docs/guides/auth/access-control). In a real project, you would want to create a new policy and authenticate users to Directus before allowing them access to your content.

To enable public access for now, navigate to **Settings** -> **Access Policies** -> **Public** and grant full `create` and `read` access to the `posts` collection and full `read` access to the `directus_fields` collection.

### Configure CSP & CORS

You may need set your content security policy and CORS configuration to allow your Next.js app to access the Directus instance. For example if you are self-hosting, or in development, and using Docker, then you can do this by adding the following environment variables to your `docker-compose.yml` file:

```yml
environment:
  CONTENT_SECURITY_POLICY_DIRECTIVES__FRAME_SRC: your-website-url
  CORS_ENABLED: "true"
  CORS_ORIGIN: "true"
```

Make sure to replace `your-website-url` with your Next.js app's URL and the port. eg. if your app URL is in development is `http://localhost:3000`, replace `your-website-url` with `localhost:3000`.

For the purpose of this tutorial, you are setting your Directus instance to receive requests from any origin (through the `CORS_ORIGIN: "true"` environment variable). In a production environment, you should only allow your app's trusted domains in the `CORS_ORIGIN` list.

## Set Up Your Next.js Project

Next, create a new Next.js app by running the following command:

```bash
npx create-next-app \
  directus-next-forms \
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
cd directus-next-forms
npm install @directus/sdk
```

Now, open the project directory in your code editor to start building the app. First of all, clear out the CSS in `app/globals.css` and replace the code in `app/page.js` with the following:

```js
export default function Home() {
  return <div />
}
```

### Set up Directus
To streamline access the Directus instance through the SDK, it is recommended to create a helper file that you can import anywhere in your Next.js app. To do that, create a new directory called `lib` in the project directory and save the following code snippet in a file called `directus.js` in it:

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
## Query the Collection's Fields

Now that the Directus integration is ready, you should start by creating a page that will display the form by querying the fields of the posts collection. To do that, create a new file at `./app/form/page.js` and save the following content in it:

```js
import { React } from 'react';
import client from '@/lib/directus';
import { readFieldsByCollection } from '@directus/sdk';
export default async function Page({ params: {slug} }) {
    try {
    const postsFields = await client.request(readFieldsByCollection('posts'));
    console.log(postsFields)
	
    return (<div>
        Fetching the fields. Check the console output!
    </div>)
    } catch (e) {
        console.log(e)
        return <div>Something went wrong!</div>
    }
}
```

Run the app using the `npm run dev` command. Go to http://localhost:3000/form and open up the browser console to view the output printed by the `readFieldsByCollection` call:

![Printing the available fields to the console](/img/fields-output.png)

This response contains all the information about the fields in the collection. Make sure to look at the meta field `interface` which identifies the form element to be used to manage the field. In this example, there are 4 different interfaces:

1. input
2. input-rich-text-md
3. select-dropdown
4. datetime

You will build a component for each of these form input interfaces and display them based on the configurations of the fields.


## Build a form from the data
Create a new file named `app/components/FieldRenderer.js` add the following code:

```js
import Input from './Input';
import TextArea from './TextArea';
import Select from './Select';
import DateTime from './DateTime';

export default function FieldRenderer({ field, formValue, setFormValue }) {
  if (field?.meta?.hidden) return null;

  const getComponent = () => {
    switch (field.meta?.interface) {
      case 'input':
        return Input;
      case 'input-rich-text-md':
        return TextArea;
      case 'select-dropdown':
        return Select;
      case 'datetime':
        return DateTime;
      default:
        return Input;
    }
  };

  const Component = getComponent();

  return (
    <Component
      field={field}
      defaultValue={field.schema?.default_value}
      label={field.meta?.field}
      value={formValue[field.field]}
      setValue={(value) => setFormValue((prev) => ({ ...prev, [field.field]: value }))}
    />
  );
}
```

This component will take a field and render the appropriate custom component based on the `interface` meta field. If the field is hidden (based on the value of `field.meta.hidden`) it will not render the component.

Next, update the `./app/form/page.js` file to match the following code snippet:

```js
"use client"

import { React, useEffect, useState } from 'react';
import client from '@/lib/directus';
import { readFieldsByCollection } from '@directus/sdk';
import FieldRenderer from '../components/FieldRenderer';

export default function Page({ params: { slug } }) {

    const [postsFields, setPostsFields] = useState([])
    const [formData, setFormData] = useState({})

    // TODO
    const submitForm = () => {}

    useEffect(() => {
        async function fetchFields() {
            try {
                const result = await client.request(readFieldsByCollection('posts'));
                setPostsFields(result);
                console.log(result);
            } catch (e) {
                console.error(e);
            }
        }
        fetchFields();
    }, []);

    try {
        return (<form onSubmit={submitForm}>
            {(postsFields.map((field) => {
                // Don't render a field if it has been hidden
                if (field.meta?.hidden) return null

                return <FieldRenderer field={field} key={field.field} formValue={formData} setFormValue={setFormData} />
            }))}
        </form>)
    } catch (e) {
        console.log(e)
        return <div>Something went wrong!</div>
    }
}
```

This loops through all the fields in the `posts` collection and renders the appropriate Next.js form element for each field.

Create the individual components for each input type. You will use properties from the Directus field to assist with rendering the form element. For example, the `input` interface will use the `default_value` and `label` properties to set the default value and label of the input field. You will also maintain the form layout from directus via the half and full widths. You've already implemented a check above to not render fields that have their hidden values set to "true".

### The `<input>` element

Create a new file `components/Input.js` and add the following code:

```js
"use client"
import { useState } from 'react';

export default function Input({
  defaultValue = '',
  label = '',
  field,
  value,
  setValue
}) {

  const handleChange = (e) => {
    const value = e.target.value;
    setValue(value);
  };

  const fieldWidth = field.meta?.width === 'full' ? '100%' : '50%';

  return (
    <div style={{ width: fieldWidth }}>
      <label htmlFor={field.field}>{label}</label>
      <input
        name={field.schema?.name}
        value={value}
        onChange={handleChange}
        type="text"
        required={field.meta?.required}
        style={{ width: '100%' }}
      />
    </div>
  );
}
```

### input-rich-text-md

We will use a text area to handle the markdown content, in reality you would want to select a markdown WYSIWYG component.
Create a new file `components/TextArea.js` and add the following code:

```js
"use client"
import { useState } from 'react';

export default function TextArea({
  defaultValue = '',
  label = '',
  field,
  value,
  setValue
}) {

  const handleChange = (e) => {
    const value = e.target.value;
    setValue(value);
  };

  const fieldWidth = field.meta?.width === 'full' ? '100%' : '50%';

  return (
    <div style={{ width: fieldWidth }}>
      <label htmlFor={field.field}>{label}</label>
      <textarea
        name={field.schema?.name}
        value={value}
        onChange={handleChange}
        rows={12}
        required={field.meta?.required}
        style={{ width: '100%' }}
      />
    </div>
  );
}
```

### select-dropdown

This component is similar to the others but it makes use of the `options` property to populate the select dropdown options.
Create a new file `components/Select.js` and add the following code:

```js
"use client"
import { useState } from 'react';

export default function Select({
  defaultValue = '',
  label = '',
  field,
  value,
  setValue
}) {

  const handleChange = (e) => {
    console.log(e.target.value)
    const value = e.target.value;
    setValue(value);
  };

  const fieldWidth = field.meta?.width === 'full' ? '100%' : '50%';

  return (
    <div style={{ width: fieldWidth }}>
      <label htmlFor={field.field}>{label}</label>
      <select
        name={field.schema?.name}
        value={value}
        onChange={handleChange}
        required={field.meta?.required}
        style={{ width: '100%' }}
      >
        {field.meta?.options?.choices?.map((choice) => (
          <option key={choice.value} value={choice.value}>
            {choice.text}
          </option>
        ))}
      </select>
    </div>
  );
}
```

### datetime

Create a new file `components/DateTime.js` and add the following code:

```js
"use client"
import { useState } from 'react';

export default function DateTime({
  defaultValue = '',
  label = '',
  field,
  value,
  setValue
}) {

  const handleChange = (e) => {
    const value = e.target.value;
    setValue(value);
  };

  const fieldWidth = field.meta?.width === 'full' ? '100%' : '50%';

  return (
    <div style={{ width: fieldWidth }}>
      <label htmlFor={field.field}>{label}</label>
      <input
        name={field.schema?.name}
        type="datetime-local"
        value={value}
        onChange={handleChange}
        required={field.meta?.required}
        style={{ width: '100%' }}
      />
    </div>
  );
}
```

If you visit the form at [http://localhost:3000/form](http://localhost:3000/form) you will see a form with the fields from the `posts` collection.

## Validate and Save the Data

While Directus validates data on the server-side, you can use the validations from the field data to validate on the client side as well. You can see `app/form/page.jsx` code above that the components are already being checked for the Directus `required` property. This is also being added to the form element to use default HTML validation.

On top of that, when you created the `posts` collection you added a regular expression valadation to the `slug` field. You can now use this validation on the client side to ensure the entered slug is URL-safe before submitting it to Directus.

To do this, you will need to make changes to the `app/form/page.js` file to add the validation and submission logic. Here's how the file should look like when done:

```js
"use client"

import { React, useEffect, useState } from 'react';
import client from '@/lib/directus';
import { createItem, readFieldsByCollection } from '@directus/sdk';
import FieldRenderer from '../components/FieldRenderer';

export default function Page({ params: { slug } }) {

    const [postsFields, setPostsFields] = useState([])
    const [formData, setFormData] = useState({})

    useEffect(() => {
        async function fetchFields() {
            try {
                const result = await client.request(readFieldsByCollection('posts'));
                setPostsFields(result);
                console.log(result);
            } catch (e) {
                console.error(e);
            }
        }
        fetchFields();
    }, []);

    const submitForm = async (e) => {
        e.preventDefault();

        for (const field of postsFields) {
            const value = formData[field.field];
            const validation = field.meta?.validation;

            if (validation?._and) {
                try {
                    for (const rule of validation._and) {
                        const fieldName = Object.keys(rule)[0];
                        if (rule[fieldName]?._regex) {
                            const regex = new RegExp(rule[fieldName]._regex);
                            console.log("here")
                            console.log(regex.test(value))
                            if (!regex.test(value)) {
                                const msg = field.meta?.validation_message || `${field.meta?.field} failed validation`;
                                console.error(`Validation failed for ${field.field}: ${msg}`);
                                alert(msg);
                                return;
                            }
                        }
                    }
                } catch (err) {
                    console.error(`Error parsing validation for ${field.field}:`, err);
                }
            }
        }

        try {
            await client.request(createItem('posts', formData));
            alert('Post created successfully');
        } catch (error) {
            console.error('Error creating post:', error);
            alert(error.message || 'Failed to create post');
        }
    };

    try {
        return (<form onSubmit={submitForm}>
            {(postsFields.map((field) => {
                // Don't render a field if it has been hidden
                if (field.meta?.hidden) return null

                return <FieldRenderer field={field} key={field.field} formValue={formData} setFormValue={setFormData} />
            }))}

            <button type="submit">Submit</button>
        </form>)
    } catch (e) {
        console.log(e)
        return <div>Something went wrong!</div>
    }
}
```

The form will now allow submission of the data to Directus after a validation process in the `submitForm` function. This validation function will loop through each field looking for Directus validation rules and then execute them. If any validation fails the form will not submit and an error message will be displayed.

This example is limited to the regex validation you added to the `slug` field. You can expand this to include other validation rules from Directus.

## Summary

The `readFieldsByCollection` method from the Directus SDK allows you to query the fields of a collection and dynamically generate fully validated forms in Next.js.

From here you could expand the example to include more complex validation rules, custom form elements, an edit form or dynamically display and handle relational data.
