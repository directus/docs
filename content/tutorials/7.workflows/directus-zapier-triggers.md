---
id: directus-zapier-triggers
title: Directus Zapier Triggers
description: Complete guide for using Directus triggers in Zapier workflows to automatically start Zaps when events happen in Directus.
technologies:
  - zapier
---

This guide covers how to use Directus triggers in Zapier to automatically start your Zaps when something happens in Directus.

**[← Back to Directus + Zapier Overview](/tutorials/workflows/use-directus-with-zapier-for-automation)**

## Using Directus Triggers

Directus triggers automatically start your Zaps when events happen in Directus.

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

1. In your Zap, select **Directus** as the trigger app
2. Choose the trigger event:
   - **New or Updated Item**: Select the **Collection** to watch, then choose the **Action** (Created, Updated, or Deleted)
   - **New or Updated User**: Choose the **Action** (Created, Updated, or Deleted)
   - **New File Uploaded**: No additional configuration needed
3. Click **Continue** and test the trigger

The trigger automatically creates a Flow in Directus with a webhook that starts your Zap when the selected event occurs.

### How Triggers Work

When you set up a Directus trigger in Zapier:

1. Zapier automatically creates a Flow with a webhook in your Directus instance
2. Directus sends notifications to Zapier when the selected event happens
3. Your Zap runs automatically with the data from Directus
4. When you turn off your Zap, the Flow and webhook are automatically removed



---

## Tips and Best Practices

### Using Trigger Data

You can use data from the trigger in subsequent steps. The trigger data contains the full item, user, or file object that triggered the Zap:

- Map fields from the trigger to actions in other apps
- Use the search box to quickly find the field you need
- All data from the trigger is available in subsequent steps

### Filtering Trigger Events

You can add Filter steps after the trigger to only process specific events:

- Check if `status` equals `published` before sending notifications
- Filter by collection or field values
- Only process certain types of files

::callout{icon="material-symbols:info-outline"}
**Filtering Tip**
Use Zapier's **Filter** step after the trigger to add conditional logic. For example, only send notifications when `status` equals `"published"`.
::

---

## Troubleshooting

### Trigger Issues

**Triggers Not Firing:**

- Ensure your Zap is turned on
- Verify the trigger is set up correctly (right collection, right action)
- Check that your Directus flows are active (the integration creates these automatically)
- Ensure your Directus instance can reach Zapier's webhook URLs
- Test by manually creating/updating an item in Directus
- Check Directus logs for any errors

**Webhook Not Created:**

- Verify your Directus API token has permission to create webhooks
- Ensure your Directus instance is accessible from the internet

**Connection Issues:**

- Make sure your Directus URL is correct and accessible (must include `https://`, no trailing slash)
- Verify your API token is valid and has the right permissions

### Getting Help

If you encounter issues:

1. **For Directus-specific questions:** Ask for help in the [Directus Community](https://community.directus.io/)
2. **For Zapier-specific questions:** Visit the [Zapier Community](https://community.zapier.com) or check [Zapier Help Center](https://help.zapier.com/)
3. **For trigger issues:** Check that both your Directus and Zapier instances are accessible

---

## Next Steps

- **[← Back to Overview](/tutorials/workflows/use-directus-with-zapier-for-automation)** Return to the integration overview
- **[Learn about Directus Actions →](/tutorials/workflows/directus-zapier-actions)** Perform operations on your Directus data










