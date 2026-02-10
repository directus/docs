---
id: directus-clay-data-operations-tutorial
title: Data Operations
description: Advanced techniques for working with Directus data in Clay, including filters, pagination, common use cases, and best practices.
technologies:
  - clay
---

This guide covers advanced techniques for working with Directus data in Clay, including filtering, field selection, pagination, and optimization strategies.

**[← Back to Directus + Clay Overview](/guides/integrations/clay)**

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

::field{name="sort" type="string"}
Field name (prefix with `-` for descending). Example: `-date_created` (newest first)
::

::field{name="limit" type="number"}
Maximum items to return (e.g., `50`)
::

::field{name="offset" type="number"}
Number of items to skip (e.g., `0`, `50`, `100`)
::

---

## Common Use Cases

| Use Case                             | Scenario                                                   | Steps                                                                                                                                                                                                                                                         |
| ------------------------------------ | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **🛒 E-commerce Product Enrichment** | Enrich product data with inventory and pricing information | 1. Use **Get Item from Collection** to check if a product exists in Directus<br>2. Use **Update Item in Collection** to update stock levels from external sources<br>3. Use **Get Related Item Details** to pull supplier information                         |
| **📝 Content Publication Workflow**  | Automatically publish content when it's approved in Clay   | 1. Use Directus webhooks to send draft content to Clay for review<br>2. Enrich content with SEO metadata and keyword research in Clay<br>3. Use **Update Item in Collection** to publish content back to Directus                                             |
| **👥 Lead Enrichment System**        | Sync CRM data between Clay and Directus                    | 1. Use Directus webhooks to send new leads to Clay<br>2. Enrich leads with company data and contact information<br>3. Use **Update Item in Collection** to sync enriched data back<br>4. Use **Get Related Item Details** to pull company profiles            |
| **📋 Form Submission Processing**    | Process form submissions and create records                | 1. Use Directus webhooks to send form submissions to Clay<br>2. Use **Get Item from Collection** to check for existing records<br>3. Use **Create Item in Collection** to add new contacts<br>4. Use **Update Item in Collection** to update existing records |

---

## Troubleshooting

When working with Directus API through Clay, you may encounter various error codes. For a comprehensive list of Directus error codes and their meanings, refer to the [official Directus Error Codes documentation](https://directus.io/docs/guides/connect/errors).

### Common Issues

**Authentication Problems:**

- Verify your API token is valid and active
- Check that you're using the correct format: `Bearer YOUR_TOKEN`
- Ensure the token hasn't expired

**Collection and Field Issues:**

- Verify collection names match exactly (case-sensitive)
- Check that field names match your Directus schema
- Ensure proper permissions are set for collections

**Filter and Query Issues:**

- Use the correct format: `filter[field][operator]`
- Test filters in Directus admin panel first
- Check for special characters that need escaping

### Getting Help

If you encounter issues:

1. **For Directus-specific questions:** Ask for help in the [Directus Community](https://community.directus.io/)
2. **For Clay-specific questions:** Contact Clay support or check Clay's documentation
3. **For API connection issues:** Verify your Directus configuration and permissions

---

## Next Steps

- **[Learn Clay Templates →](/guides/integrations/clay/use-clay-templates-with-directus)** - Use Clay's pre-built templates
- **[Learn Directus Webhooks →](/guides/integrations/clay/use-directus-webhooks-with-clay)** - Set up real-time data sync
- **[← Back to Overview](/guides/integrations/clay)**

## Additional Resources

- [Clay Documentation](https://clay.com/docs)
- [Directus Community](https://community.directus.io/)

