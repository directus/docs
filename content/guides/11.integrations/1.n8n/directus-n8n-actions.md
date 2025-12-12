---
id: directus-n8n-actions
title: Actions
description: Complete guide for using Directus actions in n8n workflows, including working with items, users, and files.
technologies:
  - n8n
---

This guide covers how to use the Directus Node to perform actions on your Directus data in n8n workflows, including working with items, users, and files.

**[← Back to Directus + n8n Overview](/guides/integrations/n8n)**

## Using the Directus Node (Actions)

The Directus node lets you perform actions on your Directus data. It works with three types of resources: **Items**, **Users**, and **Files**.

## Available Actions

Quick reference of all available actions organized by resource type:

| Resource | Operation | Description |
|----------|-----------|-------------|
| **Items** | Create | Add a new item to a collection |
| **Items** | Get | Retrieve a single item by ID |
| **Items** | Get Many | Retrieve multiple items with optional filters |
| **Items** | Update | Modify an existing item |
| **Items** | Delete | Permanently remove an item |
| **Users** | Invite | Send an invitation to a new user |
| **Users** | Get | Retrieve a single user by ID |
| **Users** | Get Many | Retrieve multiple users with optional filters |
| **Users** | Update | Modify an existing user |
| **Users** | Delete | Permanently remove a user |
| **Files** | Upload a File | Upload a file from binary data |
| **Files** | Import a File | Import a file from a URL |
| **Files** | Get | Retrieve a single file by ID |
| **Files** | Get Many | Retrieve multiple files with optional filters |
| **Files** | Update | Modify file metadata |
| **Files** | Delete | Permanently remove a file |

---

## Common Operations

Most operations follow a similar pattern across resources. Set the **Resource** type (Item, User, or File), choose the **Operation**, and configure the required fields.

### Create, Update, Delete

These operations work similarly across all resources:

- **Create**: Set Resource → Operation to Create → Select Collection (Items only) → Fill in fields → Click **Add Field** for additional fields
- **Update**: Set Resource → Operation to Update → Enter ID → Update desired fields
- **Delete**: Set Resource → Operation to Delete → Enter ID

**Note for Items**: When creating or updating items, you must select the **Collection** first. For Users and Files, no collection selection is needed.

::callout{icon="material-symbols:warning-rounded" color="warning"}
**Permanent Deletion**
Delete operations permanently remove data. Make sure this is what you want to do!
::

### Get Operations

- **Get**: Set Resource → Operation to Get → Enter ID → Optionally select **Fields** to return
- **Get Many**: Set Resource → Operation to Get Many → Optionally add filters → Set **Limit** → Optionally select **Fields**

**Note for Items**: Select the **Collection** before configuring filters.

## Resource-Specific Operations

### Items

Items are content entries in your Directus collections (blog posts, products, pages, etc.). All standard operations require selecting a **Collection** first.

**Example**: Create a blog post
- Collection: `posts`
- Fields: `title`, `content`, `status`

### Users

#### Invite a User

Set **Resource** to **User** → **Operation** to **Invite** → Enter **Email** → Select **Role**.

All other operations (Get, Get Many, Update, Delete) follow the standard pattern above.

### Files

#### Upload a File

Set **Resource** to **File** → **Operation** to **Upload a File**. The file must come from a previous node that outputs binary data (like an HTTP Request node). Optionally set **Title**, **Description**, and **Folder**.

#### Import a File from URL

Set **Resource** to **File** → **Operation** to **Import a File** → Enter **File URL** 

All other operations (Get, Get Many, Update, Delete) follow the standard pattern above.

---

## Tips and Best Practices

### Using Expressions

You can use n8n expressions to reference data from previous nodes:

- `{{ $json.id }}` - Get the ID from the previous node
- `{{ $json.title }}` - Get the title field
- `{{ $json.email }}` - Get the email field

This is especially useful when chaining Directus nodes together. For example, use `{{ $json.id }}` to update an item that was just created in a previous node.

### Field Selection

When getting items, you can select specific fields to return. This is helpful when:

- You only need certain information
- You want to reduce the amount of data transferred
- You're working with large collections

::callout{icon="material-symbols:info-outline"}
**Performance Tip**
Selecting only the fields you need reduces data transfer and improves workflow performance, especially with large collections.
::

### Simplify Option

For **Get Many** operations on Users and Files, use the **Simplify** option to get only the most commonly used fields. This makes the data easier to work with in subsequent nodes.





---

## Troubleshooting

When working with Directus API through n8n, you may encounter various error codes. For a comprehensive list of Directus error codes and their meanings, refer to the [official Directus Error Codes documentation](https://directus.io/docs/guides/connect/errors).

### Error Handling

If you get errors:

1. **Permission Errors**: Check that your Directus API token has the right permissions
2. **Not Found Errors**: Verify that the collection, item ID, or user ID exists
3. **Connection Errors**: Make sure your Directus URL is correct and accessible


### Getting Help

If you encounter issues:

1. **For Directus-specific questions:** Ask for help in the [Directus Community](https://community.directus.io/)
2. **For n8n-specific questions:** Visit the [n8n Community Forum](https://community.n8n.io/) or check [n8n Documentation](https://docs.n8n.io/)
3. **For API connection issues:** Verify your Directus configuration and permissions

---

## Next Steps

- **[← Back to Overview](/guides/integrations/n8n)** Return to the integration overview
- **[Learn about Directus Triggers →](/guides/integrations/n8n/directus-n8n-triggers)** Set up automated workflows












