---
id: zapier-advanced
title: Advanced
description: Advanced guide for using Directus API features in Zapier, including raw request actions, advanced filtering, and custom API calls.
technologies:
  - zapier
---

This guide covers advanced Directus features in Zapier, including raw request actions and advanced filtering in Search / List actions.

**[← Back to Zapier Integration](/guides/integrations/zapier)**

## Raw Request Actions

Raw Request actions provide full HTTP method control for Items, Users, and Files. These actions allow you to use Directus's native JSON syntax for filters, query parameters, and data manipulation.

## Available Raw Request Actions

Quick reference of all available raw request actions:

| Resource | Operation | HTTP Methods | Description |
|----------|-----------|--------------|-------------|
| **Items** | Raw Request | POST, PATCH, DELETE | Full HTTP method control for items |
| **Users** | Raw Request | POST, PATCH, DELETE | Full HTTP method control for users |
| **Files** | Raw Request | PATCH, DELETE | Full HTTP method control for files |

---

::callout{icon="heroicons-outline:light-bulb"}
**When to Use Raw Request Actions**
Use raw request actions when you need full control over HTTP methods, complex query parameters (aggregation, search, etc.), or complete control over the JSON payload structure. For advanced filtering in Search / List actions, use the Filter (JSON) field instead.
::

## Using Raw Request Actions

Raw Request actions allow you to make custom Directus API calls with full control over the HTTP method and request body.

### Setting Up a Raw Request Action

1. Add **Directus** as an action step
2. Select **Raw Request** operation (Items, Users, or Files)
3. Choose the **HTTP Method** (POST, PATCH, or DELETE)
4. For Items, select the **Collection**
5. Configure the request:
   - **ID**: Item/User/File ID (required for PATCH/DELETE)
   - **Request Body (JSON)**: JSON data for POST/PATCH requests
   - **Filter (JSON)**: Filter conditions for DELETE operations

::callout{icon="material-symbols:warning-rounded" color="warning"}
**Token Permissions**
Ensure your Directus API token has the correct permissions for the resource and operations you're using. Raw request actions require the same permissions as their standard counterparts.
::

### Items - Raw Request

**POST** - Create items with full JSON control:
```json
{
  "title": "My New Post",
  "content": "Post content here",
  "status": "published",
  "author": "author-uuid-here",
  "categories": ["category-uuid-1", "category-uuid-2"]
}
```

**PATCH** - Update items with complex data structures:
```json
{
  "title": "Updated Title",
  "status": "archived",
  "metadata": {
    "tags": ["updated", "archived"],
    "notes": "Item has been archived"
  }
}
```

**DELETE** - Delete items by ID or using Filter (JSON) for bulk deletion

### Users - Raw Request

**POST** - Create users with full JSON control:
```json
{
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "role-uuid-here"
}
```

**PATCH** - Update users with complex data structures:
```json
{
  "status": "suspended",
  "metadata": {
    "reason": "Account violation"
  }
}
```

**DELETE** - Delete users by ID or using Filter (JSON) for bulk deletion

### Files - Raw Request

**PATCH** - Update file metadata with complex data structures:
```json
{
  "title": "Updated Title",
  "description": "New description",
  "tags": ["tag1", "tag2"]
}
```

**DELETE** - Delete files by ID or using Filter (JSON) for bulk deletion

## Working with Relations

When using **Raw Request** actions or creating items with relations:

**Many-to-One:**
```json
{
  "title": "My Post",
  "author": "author-uuid-here"
}
```

**Many-to-Many:**
```json
{
  "title": "My Post",
  "categories": ["category-uuid-1", "category-uuid-2"]
}
```

**One-to-Many:**
```json
{
  "title": "My Post",
  "comments": [
    {"text": "Great post!", "user": "user-uuid-here"}
  ]
}
```

## Advanced Tips

### Using Dynamic Values in Filters

You can use data from previous steps in your filters by using Zapier's field mapping in the filter fields.

### Batch Processing

For bulk operations:
1. Use **Search / List** to get all items
2. Enable **"Return all results as line items"**
3. Add a **Filter** step if needed
4. Add **Update Item** to process each item

## Performance Tips

- **Select only needed fields**: Use field mapping to reduce data transfer
- **Use pagination**: Use the **Limit** field in search actions, process in batches
- **Filter in Directus**: Always use Directus filters rather than Filter steps when possible

**Example:**
```json
{
  "filter": {
    "status": {"_eq": "published"},
    "date_created": {"_gte": "$NOW(-30 days)"}
  },
  "limit": 100
}
```

---

## Next Steps

- **[← Back to Integration](/guides/integrations/zapier)** Return to the integration overview
- **[Learn about Actions →](/guides/integrations/zapier/actions)** Basic operations guide
- **[Learn about Triggers →](/guides/integrations/zapier/triggers)** Automation workflows

## Additional Resources

- [Directus Filter Rules](https://directus.io/docs/guides/connect/filter-rules) - Complete filter syntax and operators
- [Directus Query Parameters](https://directus.io/docs/guides/connect/query-parameters) - All available query parameters
