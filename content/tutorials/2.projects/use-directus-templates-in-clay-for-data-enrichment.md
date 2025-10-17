---
id: 8da0ec5c-4865-41fd-a4fe-073e354af16b
title: Use Directus with Clay for Data Enrichment
description: Connect Directus with Clay to automate data enrichment and sync content between platforms using webhooks and HTTP API templates.
technologies:
  - clay
---

Connect your Directus instance with Clay to automate data enrichment, sync content, and build powerful workflows between your content platform and Clay's data enrichment tools.

## Before You Start

### Set Up Your Directus Project

You'll need a Directus project with:

- Collections set up with the data you want to work with
- Proper permissions configured for the operations you plan to use
- API access enabled and a valid API token

If you don't already have a Directus project, the easiest way to get started is with our [managed Directus Cloud service](https://directus.cloud).

### Set Up Clay

Make sure you have a Clay account and are familiar with:

- Creating enrichment columns
- Basic Clay workflow concepts
- How to search for and use templates

## How to Connect Directus and Clay

There are two separate ways to connect Directus and Clay, each with different setup processes:

**[Clay → Directus (HTTP API Templates)](#using-http-api-templates-clay-directus)**  
Use Clay's pre-built HTTP API templates to pull data from Directus for enrichment or push enriched data back. Ideal for on-demand operations.

**[Directus → Clay (Webhooks)](#using-webhooks-directus-clay)**  
Use Directus Flows to automatically send data to Clay webhooks when events occur in your instance. Perfect for real-time data sync.

![Directus Clay Integration Overview](/img/tutorials/directus_clay_integration.png)

---

## Using HTTP API Templates (Clay → Directus)

Clay provides pre-built templates for common operations with Directus. These templates appear as enrichment column options and handle all the API configuration for you.

Follow these steps to use the pre-built Directus templates in Clay.

### Step 1: Set Up Authentication

Before using any templates, configure your Directus authentication in Clay:

1. Go to your Clay account settings
2. Add a new HTTP API account
3. Set up the authorization header:
   - **Key:** `Authorization`
   - **Value:** `Bearer YOUR_DIRECTUS_TOKEN_HERE`
4. Name it "Directus" for easy reference

Once created, you can select this account for all Directus API calls instead of manually entering headers each time.

### Step 2: Add a Directus Template

1. In your Clay table, create a new enrichment column
2. Search for "directus" in the template search
3. Select the template that matches your operation:
   - **Create Item in Collection** - to add new records
   - **Update Item in Collection** - to modify existing records
   - **Get Item from Collection** - to search and retrieve records
   - **Get Related Item Details** - to fetch relational data

**Important:** The Directus templates use generic collection names (like "posts" or "users") as examples. You'll need to adapt these to match your specific Directus schema by replacing collection names, adjusting field names, and configuring filters based on your data structure.

### Step 3: Configure the Template

Each template requires configuration specific to your Directus setup:

**Basic Configuration:**

- **Directus URL:** Your instance URL (e.g., `https://your-project.directus.app`)
- **Collection Name:** Replace "posts" with your actual collection name
- **Account:** Select the "Directus" account you created in Step 1

**For GET operations, add query parameters:**

- **limit:** Maximum number of items to return (e.g., `10`)
- **fields:** Comma-separated field names (e.g., `id,title,status`)
- **filter[field][operator]:** Filter criteria (e.g., `filter[status][_eq]` with value `published`)

For more advanced filtering options and field selection techniques, see the [Understanding Filters](#understanding-filters), [Selecting Specific Fields](#selecting-specific-fields), and [Sorting and Pagination](#sorting-and-pagination) sections below.

**For POST/PATCH operations, configure the body:**

- Map Clay columns to Directus field names
- Use the visual field mapper or write JSON directly
- Include all required fields for your collection

### Step 4: Map Your Data

Configure how Clay data maps to Directus fields:

1. Click on field values to open the column selector
2. Select the Clay column that contains your data
3. Use formulas if you need to transform data before sending
4. Set static values for fields that don't change (like `status: "draft"`)

**Example mapping for creating a blog post:**

```json
{
  "title": "{{Blog Post Title Column}}",
  "slug": "{{URL Slug Column}}",
  "content": "{{Post Content Column}}",
  "status": "draft",
  "author": "{{Author ID Column}}"
}
```

### Step 5: Test and Run

1. Test the enrichment on a single row first
2. Verify the results in your Directus instance
3. Check for any errors in Clay's response column
4. Once confirmed working, run on your full dataset

---

## Using Webhooks (Directus → Clay)

Send data automatically from Directus to Clay when content changes, items are created, or statuses update.

### How Webhooks Work

Directus Flows trigger automatically on data changes and POST to Clay webhook URLs. This enables real-time data sync without any manual intervention.

**Common use cases:**

- Send new content to Clay for automatic enrichment
- Trigger workflows when content is published
- Sync form submissions to Clay tables
- Track content changes in real-time

### Step 1: Get Your Clay Webhook URL

1. In Clay, navigate to the table where you want to receive data
2. Click "Add Data" or the "+" button for new data sources
3. Select "Import data from Webhook"
4. Copy the webhook URL provided by Clay

For detailed instructions on setting up webhooks in Clay, see the [Clay Webhook Integration Guide](https://www.clay.com/university/guide/webhook-integration-guide).

### Step 2: Create a Directus Flow

#### Interactive Demo: Creating a Webhook Flow

See this webhook flow setup in action with our interactive demo or skip to the steps below:

<!--ARCADE EMBED START--><div style="position: relative; padding-bottom: calc(50.4167% + 41px); height: 0px; width: 100%;"><iframe src="https://demo.arcade.software/jiBsuEdLSgp5MZawe3iR?embed&embed_mobile=tab&embed_desktop=inline&show_copy_link=true" title="Create an Automated Webhook Flow for New Posts in Directus" frameborder="0" loading="lazy" webkitallowfullscreen mozallowfullscreen allowfullscreen allow="clipboard-write" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; color-scheme: light;" ></iframe></div><!--ARCADE EMBED END-->

---

1. Go to **Settings → Flows** in your Directus Admin Panel
2. Click **"Create Flow"**
3. Configure the flow:
   - **Name:** Give it a descriptive name (e.g., "Send New Posts to Clay")
   - **Status:** Set to "Active"
4. Click Save

### Step 3: Add Event Hook Trigger

1. Click the **"+"** button to add a trigger
2. Select **"Event Hook"**
3. Configure the trigger:
   - **Type:** Action (Non-Blocking)
   - **Scope:** Choose when to trigger:
     - `items.create` - When new items are created
     - `items.update` - When items are updated
     - `items.delete` - When items are deleted
   - **Collections:** Select which collection(s) to monitor (e.g., "posts")
4. Click Save

### Step 4: Add Webhook Operation

1. Click the **"+"** button after your trigger to add an operation
2. Select **"Webhook / Request URL"**
3. Configure the webhook:
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

4. Click Save

### Step 5: Test Your Flow

1. Create or update an item in your monitored collection
2. Check your Clay table to confirm the data arrived
3. Verify all fields mapped correctly
4. Adjust the flow configuration if needed

---

## Working with Directus Data

### Understanding Filters

When retrieving data from Directus, you can use powerful filter operators to find exactly what you need.

**Filter syntax in Clay query parameters:**

- **Key:** `filter[field_name][operator]`
- **Value:** The comparison value

**Common operators:**

| Operator     | Description                 | Example                                   |
| ------------ | --------------------------- | ----------------------------------------- |
| `_eq`        | Equals                      | `filter[status][_eq]` → `published`       |
| `_neq`       | Not equals                  | `filter[status][_neq]` → `draft`          |
| `_contains`  | Contains (case sensitive)   | `filter[title][_contains]` → `Guide`      |
| `_icontains` | Contains (case insensitive) | `filter[title][_icontains]` → `guide`     |
| `_in`        | In array                    | `filter[status][_in]` → `draft,published` |
| `_gt`        | Greater than                | `filter[views][_gt]` → `1000`             |
| `_lt`        | Less than                   | `filter[price][_lt]` → `100`              |
| `_null`      | Is null                     | `filter[deleted_at][_null]` → `true`      |
| `_nnull`     | Is not null                 | `filter[published_at][_nnull]` → `true`   |

### Selecting Specific Fields

To improve performance and reduce data transfer, specify only the fields you need:

**In query parameters:**

- **Key:** `fields`
- **Value:** Comma-separated field names (e.g., `id,title,status,author`)

**Including related fields:**

- Use dot notation: `author.first_name,author.last_name`
- This pulls in data from related collections

### Sorting and Pagination

**Sorting:**

- **Key:** `sort`
- **Value:** Field name (prefix with `-` for descending)
- Example: `-date_created` (newest first)

**Pagination:**

- **Key:** `limit` - Maximum items to return (e.g., `50`)
- **Key:** `offset` - Number of items to skip (e.g., `0`, `50`, `100`)

---

## Common Use Cases

### E-commerce Product Enrichment

**Scenario:** Enrich product data with inventory and pricing information

1. Use **Get Item from Collection** to check if a product exists in Directus
2. Use **Update Item in Collection** to update stock levels from external sources
3. Use **Get Related Item Details** to pull supplier information

### Content Publication Workflow

**Scenario:** Automatically publish content when it's approved in Clay

1. Use Directus webhooks to send draft content to Clay for review
2. Enrich content with SEO metadata and keyword research in Clay
3. Use **Update Item in Collection** to publish content back to Directus

### Lead Enrichment System

**Scenario:** Sync CRM data between Clay and Directus

1. Use Directus webhooks to send new leads to Clay
2. Enrich leads with company data and contact information
3. Use **Update Item in Collection** to sync enriched data back
4. Use **Get Related Item Details** to pull company profiles

### Form Submission Processing

**Scenario:** Process form submissions and create records

1. Use Directus webhooks to send form submissions to Clay
2. Use **Get Item from Collection** to check for existing records
3. Use **Create Item in Collection** to add new contacts
4. Use **Update Item in Collection** to update existing records

---

## Best Practices

### Authentication and Security

- Use API tokens with minimal required permissions (follow the principle of least privilege)
- Never share tokens in screenshots or public documentation
- Regularly rotate your authentication credentials
- Use separate tokens for different environments (development, staging, production)

### Performance Optimization

- **Select only needed fields** - Use the `fields` parameter to reduce data transfer
- **Implement rate limiting** - Avoid hitting API limits with large batch operations
- **Use filters effectively** - Narrow results at the API level rather than in Clay
- **Batch operations carefully** - Break large operations into smaller chunks

### Error Handling

- Set up proper error handling for failed requests in Clay
- Monitor enrichment success rates regularly
- Have fallback strategies for critical data operations
- Test thoroughly with sample data before running on production

### Data Mapping

- Use intermediary formula columns for complex transformations
- Validate data types before sending to Directus
- Handle optional fields gracefully (don't send empty values if not needed)
- Keep track of your schema changes and update templates accordingly

---

## Troubleshooting

### Authentication Errors

**401 Unauthorized**

- Verify your API token is valid and active
- Check that you're using the correct format: `Bearer YOUR_TOKEN`
- Ensure the token hasn't expired

**403 Forbidden**

- Token may not have permissions for this collection
- Check user role permissions in Directus
- Verify the token's access level

### Collection and Field Issues

**Collection Not Found (404)**

- Verify the collection name matches exactly (case-sensitive)
- Check that the collection exists and is accessible
- Ensure proper permissions are set for the collection

**Field Mapping Errors (400)**

- Verify field names match your Directus schema exactly
- Check field types are compatible (string, number, boolean, etc.)
- Ensure required fields are provided
- Test field names in Directus API first

### Filter and Query Issues

**Invalid Filter Syntax**

- Use the correct format: `filter[field][operator]`
- Test filters in Directus admin panel first
- Check for special characters that need escaping
- Verify operator compatibility with field type

### Rate Limiting

**429 Too Many Requests**

- Directus may limit API calls per minute
- Use Clay's rate limiting features to throttle requests
- Consider using smaller batch sizes for large operations
- Contact your Directus administrator about rate limits

### Getting Help

If you encounter issues:

1. **For Directus-specific questions:** Ask for help in the [Directus Community](https://community.directus.io/)
2. **For Clay-specific questions:** Contact Clay support or check Clay's documentation
3. **For API connection issues:** Verify your Directus configuration and permissions

---

## Additional Resources

- [Clay Documentation](https://clay.com/docs)
- [Directus Community](https://community.directus.io/)
