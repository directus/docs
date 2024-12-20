---
id: ca326a34-f92f-4967-96d8-4c9be74a23fd
slug: use-dynamic-values-in-custom-email-templates
title: Use Dynamic Values in Custom Email Templates
authors:
  - name: Tim Butterfield
    title: Guest Author
description: Learn how to inject dynamic data into liquid templates.
---
Email templates allow you to design your own email look and feel, then populate the template with data from Directus
before sending it to the recipient. This guide will introduce you to the basics of LiquidJS and how to render data
inside your email template.

Unlike many extensions types, email templates are not included in the Directus Extensions SDK so all you will need to
get started is your favorite text editor and some knowledge of [LiquidJS](https://liquidjs.com/). A useful feature of
LiquidJS is the ability to split the template into blocks such as base, header, footer, content etc then import the base
and overwrite what needed.

## Use a Base Template

For the base template, start with the raw essentials:

```liquid
<!doctype html>
<html lang="en">
<head>
	<title></title>
</head>
<body>
	{% block header %}{% endblock %}
	{% block content %}{% endblock %}
	{% block footer %}{% endblock %}
</body>
</html>
```

You can use a free responsive email template and adjust it to fit your brand. Be aware that images cannot be uploaded
alongside your template and must be hosted. If you host them in Directus, make sure the image permission is set to
public and you use the full URL in the template.

## Extend the Template

Once you have your base template, you can create smaller templates with a specific purpose that reference your base
template.

```liquid
{% layout "my-custom-base" %}
{% block content %}
    <p>Content Here</p>
{% endblock %}
```

In this example, anything inside this content block will replace the content block in the base template.

## Variables in Templates

There are a few predefined variables available to email templates. They are:

| Variable       | Description | Default    |
| -------------- | ----------- | ---------- |
| `projectName`  | String      | `Directus` |
| `projectColor` | Hex Color   | `#546e7a`  |
| `projectLogo`  | Image URL   |            |
| `projectUrl`   | URL         |            |

Beyond this, you can inject whatever data you need. If you are using an extension, you can include information inside
the data section:

```js
await mailService.send({
	to: 'name@example.com',
	subject: 'This is an example email',
	template: {
		name: 'my-custom-email-template',
		data: {
			firstname: user.firstname,
		},
	},
});
```

If you are using Flows, you can also inject data into emails:

![Type template. Template name 'my custom template' and data is a JSON object with a property named first name and a value of trigger.payload.firstname.](/img/36562249-81e0-483e-9943-54c88db33ae1.webp)

In your template, you can use the `firstname` variable like this:

```liquid
{% layout "my-custom-base" %}
{% block content %}
    <p>Hi {{ firstname }},</p>
{% endblock %}
```

You may also provide a fallback if this variable is not provided.

```liquid
{% layout "my-custom-base" %}
{% block content %}
    <p>Hi{% if firstname %}{{ firstname }}{% endif %},</p>
{% endblock %}
```

## Items and For Loops

You can provide an array of data to a template and use a for loop to render the items.

```liquid
{% layout "my-custom-base" %}
{% block content %}
    <div>
        {% for item in items %}
            <div><a href="{{ item.url }}">{{ item.title }}</a></div>
        {% endfor %}
    </div>
{% endblock %}
```

## Real-World Example

A team needs a weekly update of how many new subscriptions were created in the last week. The company has a base
template called `example-base` and looks like this:

![A designed boilerplate email with clear placeholders for header text and content](/img/b3415f15-7272-40f3-aea2-e670ce4d22bc.webp)

Using Flows, create a Schedule trigger with the value `0 8 * * 1` to send the email every Monday at 8am, then add a Read
Data operation with the following filters:

![A query on the customers collections showing a filter of active users in the last 7 days, aggregated by customer ID and grouped by subscription name.](/img/dfb9b9b9-afb2-4b0e-9527-af35ce175a7c.webp)

The response may look like this:

```json
[
	{
		"subscription": {
			"name": "Premium"
		},
		"count": {
			"customer_id": 10
		}
	},
	{
		"subscription": {
			"name": "Standard"
		},
		"count": {
			"customer_id": 23
		}
	},
	{
		"subscription": {
			"name": "Free"
		},
		"count": {
			"customer_id": 143
		}
	}
]
```

Create an operation to Send an Email and change the type to Template. In the Data field, add the results of `{{$last}}`
to a variable such as `report`.

![An email showing the custom template and passing in an object with one property - report - and the value of last.](/img/db1c8ac4-1173-4907-8e68-a799fcf3ffc8.webp)

For this report, the template uses a for loop to generate a table of results and capitalize the name for better
appearance:

```liquid
{% layout "example-base" %}
{% block header %}
    <h1>Weekly Subscription Report</h1>
{% endblock %}
{% block content %}
    <table>
        <thead>
            <tr>
                <th>Subscription</th>
                <th>New Members</th>
                </tr>
                </thead>
        <tbody>
            {% for item in report %}
                <tr>
                    <td>{{ item.subscription.name | capitalize }}</td>
                    <td>{{ item.count.customer_id }}</td>
                </tr>
            {% endfor %}
        </tbody>
    </table>
{% endblock %}
```

## Add Template to Directus

Custom email templates are stored in the configured `EMAIL_TEMPLATES_PATH` location, which defaults to the `./templates`
folder relative to your project.

1. Inside the templates directory, copy and paste the required liquid files for your email. These cannot go in a
   subdirectory.
2. Restart Directus.

The template is now available to Directus.

Make sure to keep a reference of what templates you have available because Directus will not provide a selection list
for templates. You must type the filename of the template without the extension.

## Summary

With this guide you have learned how to create your own email templates using LiquidJS and how to include data from
Directus in your emails. Make sure to read up on the various
[documentation about LiquidJS](https://shopify.github.io/liquid/basics/introduction/) to see what it’s fully capable of.
