---
id: directus-n8n-triggers
title: Triggers
description: Complete guide for using Directus triggers in n8n workflows to automate workflows when events happen in Directus.
technologies:
  - n8n
---

This guide covers how to use the Directus Trigger Node to automatically start your n8n workflows when something happens in Directus.

**[← Back to Directus + n8n Overview](/guides/integrations/n8n)**

## Using the Directus Trigger Node

The Directus Trigger node automatically starts your workflow when something happens in Directus. This is perfect for automation!

## Available Triggers

Quick reference of all available triggers organized by resource type:

| Resource | Event | Description |
|----------|-------|-------------|
| **Items** | Created | Triggers when a new item is added to a collection |
| **Items** | Updated | Triggers when an existing item is modified |
| **Items** | Deleted | Triggers when an item is removed from a collection |
| **Users** | Created | Triggers when a new user is added |
| **Users** | Updated | Triggers when a user is modified |
| **Users** | Deleted | Triggers when a user is removed |
| **Files** | Uploaded | Triggers when a file is uploaded to Directus |

---

## Setting Up a Trigger

1. Add a **Directus Trigger** node to your workflow (it should be the first node)
2. Select the **Resource** type (Item, User, or File)
3. Configure based on resource:
   - **Items**: Select the **Collection** to watch, then choose the **Event** (Created, Updated, or Deleted)
   - **Users**: Choose the **Event** (Created, Updated, or Deleted)
   - **Files**: Choose **Uploaded** event
4. Activate your workflow

The trigger creates a **Flow** in Directus with a webhook that automatically starts your workflow when the selected event occurs.

### How Triggers Work

When you activate a workflow with a Directus Trigger node:

1. n8n automatically creates a Flow with a webhook in your Directus instance
2. Directus sends notifications to n8n when the selected event happens
3. Your workflow runs automatically with the data from Directus
4. When you deactivate the workflow, the Flow and webhook are automatically removed

::callout{icon="material-symbols:info-outline" color="warning"}
**Public URL Required**
Your n8n instance needs to be accessible from the internet for triggers to work. If you're using n8n Cloud, this is already set up. If you're self-hosting, you'll need to modify the Flow in Directus to use a tunnel (like ngrok or Cloudflare Tunnel) to expose your n8n instance publicly.
::

---

## Tips and Best Practices



### Using Trigger Data

You can use data from the trigger in subsequent nodes. The trigger data contains the full item, user, or file object that triggered the workflow:

- `{{ $json.id }}` - Get the ID from the trigger
- `{{ $json.title }}` - Get the title field
- `{{ $json.email }}` - Get the email field (for user triggers)

This data is automatically available in all nodes that come after the trigger. Use expressions to access any field from the trigger data.

### Filtering Trigger Events

You can add conditions after the trigger to only process specific events:

- Check if `status` equals `published` before sending notifications
- Filter by collection or field values
- Only process certain types of files

::callout{icon="material-symbols:info-outline"}
**Filtering Tip**
Use n8n's **IF** node after the trigger to add conditional logic. For example, only send notifications when `{{ $json.status }}` equals `"published"`.
::

---

## Troubleshooting

### Trigger Issues

**Trigger Not Firing:**

- Ensure your workflow is activated
- Verify your n8n instance is publicly accessible (required for webhooks)
- Check that the Directus instance can reach your n8n webhook URL
- Test by manually creating/updating an item in Directus
- Check Directus logs for any errors

**Webhook Not Created:**

- Verify your Directus API token has permission to create webhooks
- Ensure your n8n instance has a public URL
- Check that your Directus instance is accessible from the internet

**Connection Issues:**

- Make sure your Directus URL is correct and accessible
- Verify your API token is valid and has the right permissions

### Getting Help

If you encounter issues:

1. **For Directus-specific questions:** Ask for help in the [Directus Community](https://community.directus.io/)
2. **For n8n-specific questions:** Visit the [n8n Community Forum](https://community.n8n.io/) or check [n8n Documentation](https://docs.n8n.io/)
3. **For trigger issues:** Check that both your Directus and n8n instances are accessible

---

## Next Steps

- **[← Back to Overview](/guides/integrations/n8n)** Return to the integration overview
- **[Learn about Directus Actions →](/guides/integrations/n8n/directus-n8n-actions)** Perform operations on your Directus data










