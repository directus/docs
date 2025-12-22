---
id: directus-webhooks-clay-tutorial
title: Webhooks
description: Learn how to set up Directus Flows to automatically send data to Clay webhooks for real-time data synchronization.
technologies:
  - clay
---

Send data automatically from Directus to Clay when content changes, items are created, or statuses update.

**[← Back to Directus + Clay Overview](/guides/integrations/clay)**

## How Webhooks Work

Directus Flows trigger automatically on data changes and POST to Clay webhook URLs. This enables real-time data sync without any manual intervention.

**Common use cases:**

- Send new content to Clay for automatic enrichment
- Trigger workflows when content is published
- Sync form submissions to Clay tables
- Track content changes in real-time

## Step 1: Get Your Clay Webhook URL

1. **In Clay, navigate to the table where you want to receive data**
2. **Click "Add Data" or the "+" button for new data sources**
3. **Select "Import data from Webhook"**
4. **Copy the webhook URL provided by Clay**

For detailed instructions on setting up webhooks in Clay, see the [Clay Webhook Integration Guide](https://www.clay.com/university/guide/webhook-integration-guide).

## Step 2: Create a Directus Flow

### Interactive Demo: Creating a Webhook Flow

See this webhook flow setup in action with our interactive demo or skip to the steps below:

<!--ARCADE EMBED START--><div style="position: relative; padding-bottom: calc(50.4167% + 41px); height: 0px; width: 100%;"><iframe src="https://demo.arcade.software/jiBsuEdLSgp5MZawe3iR?embed&embed_mobile=tab&embed_desktop=inline&show_copy_link=true" title="Create an Automated Webhook Flow for New Posts in Directus" frameborder="0" loading="lazy" webkitallowfullscreen mozallowfullscreen allowfullscreen allow="clipboard-write" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; color-scheme: light;" ></iframe></div><!--ARCADE EMBED END-->

---

1. **Go to Settings → Flows** in your Directus Admin Panel
2. **Click "Create Flow"**
3. **Configure the flow:**
   - **Name:** Give it a descriptive name (e.g., "Send New Posts to Clay")
   - **Status:** Set to "Active"
4. **Click Save**

## Step 3: Add Event Hook Trigger

1. **Click the "+" button to add a trigger**
2. **Select "Event Hook"**
3. **Configure the trigger:**
   - **Type:** Action (Non-Blocking)
   - **Scope:** Choose when to trigger:
     - `items.create` - When new items are created
     - `items.update` - When items are updated
     - `items.delete` - When items are deleted
   - **Collections:** Select which collection(s) to monitor (e.g., "posts")
4. **Click Save**

## Step 4: Add Webhook Operation

1. **Click the "+" button after your trigger to add an operation**
2. **Select "Webhook / Request URL"**
3. **Configure the webhook:**
   - **Method:** POST
   - **URL:** Paste your Clay webhook URL from Step 1
   - **Headers:**
     - **Key:** `Content-Type`
     - **Value:** `application/json`

**Request Body:** Choose one of these approaches:

**Option 1: Full Payload (Recommended)**

```
{{ $trigger }}
```

This sends all item data automatically.

**Option 2: Custom Mapping**

```json
{
  "title": "{{ $trigger.payload.title }}",
  "content": "{{ $trigger.payload.content }}",
  "status": "{{ $trigger.payload.status }}",
  "author": "{{ $trigger.payload.author }}",
  "date_created": "{{ $trigger.payload.date_created }}",
  "directus_id": "{{ $trigger.payload.id }}"
}
```

This gives you control over exactly which fields to send.

4. **Click Save**

## Step 5: Test Your Flow

1. **Create or update an item in your monitored collection**
2. **Check your Clay table to confirm the data arrived**
3. **Verify all fields mapped correctly**
4. **Adjust the flow configuration if needed**

---

## Next Steps

- **[Learn about Clay Templates →](/guides/integrations/clay/use-clay-templates-with-directus)** - Use Clay's pre-built templates
- **[Explore Advanced Data Operations →](/guides/integrations/clay/directus-clay-data-operations)** - Filters, pagination, and best practices
- **[← Back to Overview](/guides/integrations/clay)**

## Additional Resources

- [Clay Documentation](https://clay.com/docs)
- [Directus Community](https://community.directus.io/)











