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
|-----------|--------|-------------|
| **CREATE** | Create Item | Create a new item in a collection |
| **CREATE** | Invite User | Send an invitation email to a new user |
| **CREATE** | Upload File | Upload a file from binary data |
| **CREATE** | Import File | Import a file from a URL |
| **CREATE** | Update Item | Update an existing item |
| **CREATE** | Update User | Update an existing user |
| **CREATE** | Update File | Update file metadata |
| **CREATE** | Delete Item | Permanently remove an item |
| **CREATE** | Delete User | Permanently remove a user |
| **CREATE** | Delete File | Permanently remove a file |
| **SEARCH** | Find Items | Finds items with optional filters |
| **SEARCH** | Find Users | Finds users with optional filters |
| **SEARCH** | Find Files | Finds files with optional filters |
| **RAW REQUEST** | Item Raw Request | Full HTTP method control (POST, PATCH, DELETE) |
| **RAW REQUEST** | User Raw Request | Full HTTP method control (POST, PATCH, DELETE) |
| **RAW REQUEST** | File Raw Request | Full HTTP method control (PATCH, DELETE) |

---

## Common Operations

Most operations follow a similar pattern. Add **Directus** as an action step, select the operation, choose the collection (for items), and configure fields.

### Create, Update, Delete

These operations work similarly across all resources:

- **Create**: Select operation → Choose Collection (Items only) → Fill in fields → Map data from previous steps as needed
- **Update**: Select operation → Choose Collection (Items only) → Select Item from dropdown → Update desired fields
- **Delete**: Select operation → Choose Collection (Items only) → Select Item from dropdown

**Note for Items**: All item operations require selecting the **Collection** first. Fields are automatically shown based on your Directus collection structure.

::callout{icon="material-symbols:warning-rounded" color="warning"}
**Permanent Deletion**
Delete operations permanently remove data. Make sure this is what you want to do!
::

### Find

Select **Find** operation → Choose Collection (Items only) → Configure options:

| Option | Description |
|--------|-------------|
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
By default, Zapier returns only the **first result** from Find actions. To process all returned results, you must configure **"If multiple search results are found"** in the action settings to **"Return all results as line items"**. This allows Zapier to process each result separately in subsequent steps.
::

**Note for Items**: Select the **Collection** before configuring options.

::callout{icon="heroicons-outline:light-bulb"}
**Advanced Filtering in Find**
<br>
The **Filter (JSON)** field in Find actions supports Directus's complete filter syntax, including logical operators (`_and`, `_or`), relational field filtering, and all filter operators. For complete filter syntax and examples, see the [Directus Filter Rules documentation](https://directus.io/docs/guides/connect/filter-rules).
::

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

## Resource-Specific Operations

### Items

Items are content entries in your Directus collections (blog posts, products, pages, etc.). All operations require selecting a **Collection** first.

::callout{icon="material-symbols:info-outline"}
**Dynamic Field Discovery**
Fields are automatically discovered from your Directus schema and shown in the action configuration. You can map data from previous steps using the dropdown menus.
::

### Users

#### Invite User

To create users, use **Invite User**. This sends an invitation email so the user can set their password.

**Available options:**

- **Email** (required)
- **Role** (dropdown selection)
- **Custom Invite URL** (optional)

::callout{icon="heroicons-outline:light-bulb"}
**Direct User Creation**
For direct user creation without invitation, use **User Raw Request** with POST method.
::

All other operations (Update, Delete, Find) follow the standard pattern above.

### Files

Files are images, documents, and other media stored in Directus.

#### Upload File

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

#### Import File

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

All other operations (Update, Delete, Find) follow the standard pattern above.

---

## Tips and Best Practices

### Relationship Fields

**Fields with Dropdown Selection:**

**Many-to-One (M2O) fields** (like selecting an author for a post or a form for a block) support dropdown selection. You
can select an item from the dropdown or enter a UUID directly. The dropdown works for all collections, including custom
collections.

**File fields (single)** support dropdown selection. Select a file from the dropdown or enter a file UUID. Upload files
first using the **Upload File** or **Import File** actions if needed.

**User fields** support dropdown selection. Select a user from the dropdown or enter a user UUID.

**Fields Requiring Text Input:**

**One-to-Many (O2M) fields** (like buttons in a button group) require comma-separated item IDs. For example:
`uuid-1, uuid-2, uuid-3`. Use the **Find Items** action to find the IDs you need.

**Many-to-Many (M2M) fields** require comma-separated item IDs. For example: `uuid-1, uuid-2, uuid-3`. Use the **Find Items** action to find the IDs you need.

**Many-to-Any (M2A) fields** (like page builder blocks) require `collection:id` pairs separated by commas. For example:
`block_hero:uuid-1, block_text:uuid-2, block_gallery:uuid-3`. This lets you specify both which collection and which item
to link.

**Multiple files (gallery) fields** support dropdown selection for single selection only (due to a Zapier platform
limitation). For multiple files, enter comma-separated file UUIDs: `file-uuid-1, file-uuid-2`. Upload files first using
the **Upload File** or **Import File** actions.

All inputs are automatically converted to the proper JSON format for Directus. For advanced relational operations (like
creating nested items inline), use the **Raw Request** action. See the
[Advanced Features](/guides/integrations/zapier/advanced) guide for examples.

### File Fields in Items

When creating or updating items with file/image fields, first upload or import the file using a **File** action, then
use the returned **File ID** in your item creation/update. File fields require the UUID of an existing file, not file
uploads directly.

### Testing Your Zaps

Always test your Zap before turning it on. Click **Test** on each step to verify data flows correctly and field mappings
are correct.

---

## Troubleshooting

When working with Directus API through Zapier, you may encounter various error codes. For a comprehensive list of
Directus error codes and their meanings, refer to the
[official Directus Error Codes documentation](https://directus.io/docs/guides/connect/errors).

### Error Handling

If you get errors:

1. **Permission Errors**: Check that your Directus API token has the right permissions
2. **Not Found Errors**: Verify that the collection, item ID, or user ID exists
3. **Connection Errors**: Make sure your Directus URL is correct and accessible (must include `https://`, no trailing
   slash)

### Getting Help

If you encounter issues:

1. **For Directus-specific questions:** Ask for help in the [Directus Community](https://community.directus.io/)
2. **For Zapier-specific questions:** Visit the [Zapier Community](https://community.zapier.com) or check
   [Zapier Help Center](https://help.zapier.com/)
3. **For API connection issues:** Verify your Directus configuration and permissions

---

## Next Steps

- **[← Back to Integration](/guides/integrations/zapier)** Return to the integration overview
- **[Learn about Triggers →](/guides/integrations/zapier/triggers)** Set up automated workflows
