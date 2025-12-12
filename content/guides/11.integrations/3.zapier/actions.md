---
id: zapier-actions
title: Actions
description: Complete guide for using Directus actions in Zapier workflows, including working with items, users, and files.
technologies:
  - zapier
---

This guide covers how to use Directus actions in Zapier to perform operations on your Directus data when triggered by other apps.

**[← Back to Zapier Integration](/guides/integrations/zapier)**

## Using Directus Actions

Directus actions perform operations in Directus when triggered by other apps. You can work with **Items**, **Users**, and **Files**.

## Available Actions

Quick reference of all available actions organized by operation type:

| Operation | Action | Description |
|-----------|-------|-------------|
| **CREATE** | Items – Create | Create a new item in a collection |
| **CREATE** | Users – Invite | Send an invitation email to a new user |
| **CREATE** | Files – Upload | Upload a file from binary data |
| **CREATE** | Files – Import | Import a file from a URL |
| **CREATE** | Items – Update | Update an existing item |
| **CREATE** | Users – Update | Update an existing user |
| **CREATE** | Files – Update | Update file metadata |
| **CREATE** | Items – Delete | Permanently remove an item |
| **CREATE** | Users – Delete | Permanently remove a user |
| **CREATE** | Files – Delete | Permanently remove a file |
| **SEARCH** | Items – Search / List | Find items with optional filters |
| **SEARCH** | Users – Search / List | Find users with optional filters |
| **SEARCH** | Files – Search / List | Find files with optional filters |
| **RAW REQUEST** | Items – Raw Request | Full HTTP method control (POST, PATCH, DELETE) |
| **RAW REQUEST** | Users – Raw Request | Full HTTP method control (POST, PATCH, DELETE) |
| **RAW REQUEST** | Files – Raw Request | Full HTTP method control (PATCH, DELETE) |

---

## Common Operations

Most operations follow a similar pattern. Add **Directus** as an action step, select the operation, choose the collection (for items), and configure fields.

### Create, Update, Delete

These operations work similarly across all resources:

- **Create**: Select operation → Choose Collection (Items only) → Fill in fields → Map data from previous steps as needed
- **Update**: Select operation → Choose Collection (Items only) → Enter ID → Update desired fields
- **Delete**: Select operation → Choose Collection (Items only) → Enter ID

**Note for Items**: All item operations require selecting the **Collection** first. Fields are automatically shown based on your Directus collection structure.

::callout{icon="material-symbols:warning-rounded" color="warning"}
**Permanent Deletion**
Delete operations permanently remove data. Make sure this is what you want to do!
::

### Search / List

Select **Search / List** operation → Choose Collection (Items only) → Configure options:

| Option | Description |
|--------|-------------|
| **File ID** / **Item ID** / **User ID** | Search by specific ID |
| **Fields** | Specify which fields to return (e.g., `id, title, size`) |
| **Maximum number of items to return** | Leave empty to return all matching items (up to 100 by default) |
| **Offset** | Number of records to skip |
| **Page** | Page number for pagination |
| **Sort** | Order results (e.g., `date_created DESC`) |
| **Search** | General search query across attributes |
| **Filter (JSON)** | Advanced filtering using Directus filter syntax |

::callout{icon="material-symbols:warning-rounded" color="warning"}
**Processing Multiple Results**
<br>
By default, Zapier returns only the **first result** from Search / List actions. To process all returned results, you must configure **"If multiple search results are found"** in the action settings to **"Return all results as line items"**. This allows Zapier to process each result separately in subsequent steps.
::

**Note for Items**: Select the **Collection** before configuring options.

::callout{icon="heroicons-outline:light-bulb"}
**Advanced Filtering in Search / List**
<br>
The **Filter (JSON)** field in Search / List actions supports Directus's complete filter syntax, including logical operators (`_and`, `_or`), relational field filtering, and all filter operators. For complete filter syntax and examples, see the [Directus Filter Rules documentation](https://directus.io/docs/guides/connect/filter-rules).
<br>
**Example: Complex filter**
```json
{
  "_and": [
    {"status": {"_eq": "published"}},
    {
      "_or": [
        {"category": {"_eq": "tutorial"}},
        {"category": {"_eq": "guide"}}
      ]
    },
    {"views": {"_gt": 100}}
  ]
}
```
::

## Resource-Specific Operations

### Items

Items are content entries in your Directus collections (blog posts, products, pages, etc.). All operations require selecting a **Collection** first.

::callout{icon="material-symbols:info-outline"}
**Dynamic Field Discovery**
Fields are automatically discovered from your Directus schema and shown in the action configuration. You can map data from previous steps using the dropdown menus.
::

### Users

#### Users – Invite

To create users, use **Users – Invite**. This sends an invitation email so the user can set their password.

**Available options:**
- **Email** (required)
- **Role** (dropdown selection)
- **Custom Invite URL** (optional)

::callout{icon="heroicons-outline:light-bulb"}
**Direct User Creation**
For direct user creation without invitation, use **Users – Raw Request** with POST method.
::

All other operations (Update, Delete, Search / List) follow the standard pattern above.

### Files

Files are images, documents, and other media stored in Directus.

#### Files – Upload

Upload a file from binary data in your Zap.

**Available options:**
- **File** (required) - Binary file data from a previous step
- **Title** (optional)
- **Description** (optional)
- **Folder** (optional)

::callout{icon="material-symbols:info-outline"}
**File Data Source**
The file must come from a previous step that provides binary file data (like downloading a file from a URL or getting a file from another app).
::

#### Files – Import

Import a file from a publicly accessible URL.

**Available options:**
- **File URL** (required) - Must be publicly accessible
- **Title** (optional)
- **Description** (optional)
- **Folder** (optional)

::callout{icon="heroicons-outline:light-bulb"}
**Upload vs Import**
Use **Upload** when you have binary file data from a previous step. Use **Import** when you have a publicly accessible URL to the file.
::

All other operations (Update, Delete, Search / List) follow the standard pattern above.

---

## Tips and Best Practices

### Relationship Fields

All relationship fields accept simple text input with item IDs. Use the **Search Items** action to find the IDs you
need.

**Many-to-One (M2O) fields** (like selecting an author for a post) accept a single item ID. For example: `author-uuid`.

**One-to-Many (O2M) and Many-to-Many (M2M) fields** accept comma-separated item IDs. For example, to add buttons to a
button group, enter: `uuid-1, uuid-2, uuid-3`.

**Many-to-Any (M2A) fields** (like page builder blocks) accept `collection:id` pairs separated by commas. For example:
`block_hero:uuid-1, block_text:uuid-2, block_gallery:uuid-3`. This lets you specify both which collection and which item
to link.

**File fields** require file UUIDs. For single file fields, enter one UUID. For multi-file fields (like image
galleries), enter comma-separated UUIDs: `file-uuid-1, file-uuid-2`. Upload files first using the **Files – Upload** or
**Files – Import** actions.

All inputs are automatically converted to the proper JSON format for Directus. For advanced relational operations (like
creating nested items inline), use the **Raw Request** action. See the
[Advanced Features](/tutorials/workflows/directus-zapier-advanced) guide for examples.

### File Fields in Items

When creating or updating items with file/image fields, first upload or import the file using a **File** action, then use the returned **File ID** in your item creation/update. File fields require the UUID of an existing file, not file uploads directly.

### Role Names

When creating or updating users, the **Role** field accepts both role names (e.g., "Editor") and UUIDs. Using role names is easier and more readable.

### Testing Your Zaps

Always test your Zap before turning it on. Click **Test** on each step to verify data flows correctly and field mappings are correct.

---

## Troubleshooting

When working with Directus API through Zapier, you may encounter various error codes. For a comprehensive list of Directus error codes and their meanings, refer to the [official Directus Error Codes documentation](https://directus.io/docs/guides/connect/errors).

### Error Handling

If you get errors:

1. **Permission Errors**: Check that your Directus API token has the right permissions
2. **Not Found Errors**: Verify that the collection, item ID, or user ID exists
3. **Connection Errors**: Make sure your Directus URL is correct and accessible (must include `https://`, no trailing slash)

### Getting Help

If you encounter issues:

1. **For Directus-specific questions:** Ask for help in the [Directus Community](https://community.directus.io/)
2. **For Zapier-specific questions:** Visit the [Zapier Community](https://community.zapier.com) or check [Zapier Help Center](https://help.zapier.com/)
3. **For API connection issues:** Verify your Directus configuration and permissions

---

## Next Steps

- **[← Back to Integration](/guides/integrations/zapier)** Return to the integration overview
- **[Learn about Triggers →](/guides/integrations/zapier/triggers)** Set up automated workflows
