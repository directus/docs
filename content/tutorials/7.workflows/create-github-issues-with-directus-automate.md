---
id: 34bda8b7-e162-4090-8ceb-ae3db85fb098
slug: create-github-issues-with-directus-automate
title: Create GitHub Issues with Directus Automate
authors:
  - name: Kevin Lewis
    title: Director, Developer Experience
description: Learn how to integrate GitHub with Directus Automate to create new issues.
---
At the bottom of every page in our docs (including this one) is a feedback widget, which we use to gather feedback on what's good and what needs improving across our pages. All of this data is stored in a Directus project which we look through weekly and create associated GitHub Issues if action is required.

In this guide, you will learn how to use Directus Automate with Confirmation Prompts to automatically create issues directly from Directus.

## Before You Start

You will need a [Directus project](/getting-started/overview) and a GitHub Personal Access Token with "Read and Write Issues" permissions.

You'll also need a GitHub repository on GitHub to create the issues.

You will also need a Directus collection called `feedback` with a field for `content` that will house the user-provided feedback. Also create a `issue_title` text field and `issue_number` text field to provide information about the created issue.

## Create a Flow

Flows are Directus' no-code automation builder provided as part of Directus Automate. Create a new flow called "Create GitHub Issue". Add a **Manual Trigger** on the `Feedback` collection, and set the **Location** to "Item Page Only".

Check the **Require Confirmation** box and add one field with a key and name of `title`. This will contain the issue title - which should describe the remedial action based on feedback provided. For example, "I can't find the docs related to connecting an existing database" might be feedback, where "Signpost existing database connection docs" would be the issue title.

Create an item in the feedback collection manually. You will see that the flow can be triggered from the sidebar. When clicked, a confirmation prompt pops up and allows for the issue title to be entered. Both the item `id` and `title` are provided to the Flow as part of the trigger.

IMAGE

## Read Feedback Item

The current payload only contains the feedback item's `id` - we need the whole item. Create a **Read Data** operation called "Get Feedback" with full permissions on the Feedback collection. In **IDs**, set the value to `{{$trigger.body.keys[0]}}`.

The `get_feedback` object in the data chain will now contain the full feedback item.

## Create GitHub Issue

Create a **Webhook / Request URL** operation called "GitHub" with a key of `github`.

Set a `POST` request to `https://api.github.com/repos/OWNER/REPO/issues`, being sure to replace `OWNER` and `REPO` to your username and repository name respectively.

Set an `Authorization` header with the value `bearer GITHUB_PERSONAL_ACCESS_TOKEN`, replacing `GITHUB_PERSONAL_ACCESS_TOKEN` with the value you generated at the start of this guide.

In the payload, you will set the issue title and description:

```json
{
	"title": "{{$trigger.body.title}}",
    "body": ">{{feedback.content}}"
}
```

:::tip Body Supports Markdown
The body supports any Markdown, so the `>` at the start turns the text after it into a blockquote.
:::

This will set an issue title and description, but you can set other properties like [assignees, labels, and milestones](https://docs.github.com/en/rest/issues/issues?apiVersion=2022-11-28#create-an-issue).

If you run the Flow again from an item page, a new issue will appear in your GitHub repository.

## Save Issue Data

Create an **Update Data** operation for the Feedback collection with full access permissions. Set the **IDs** to `{{$trigger.body.keys[0]}}` and provide the following payload:

```json
{
	"issue_title": "{{$trigger.body.title}}",
	"issue_number": "{{github.data.number}}"
}
```

Now, once the issue is saved, a reference to it will appear in the Directus item where the flow was triggered.

This is a hugely valuable integration between Directus and GitHub, and I hope you find it as useful as I did!
