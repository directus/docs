---
title: Relational Data
description: Directus enables you to manage and interact with relational data. This section will guide you through the different types of relationships and how to work with them.
---

By default, Directus only retrieves the reference value of a relational field in your items. To also retrieve _nested_
data of a relational field [the `fields` parameter](/guides/connect/query-parameters#fields) in REST can be used, or regular nested
queries in GraphQL. This allows you to retrieve the author of your article included in the articles data, or fetch
related log entry points for your app's analytics data for example.

### Creating / Updating / Deleting

Similarly to fetching, relational content can be modified deeply as well.

#### Many-to-One

Many-to-One relationships are fairly straightforward to manage relationally. You can submit the changes you want
as an object under the relational key in your collection. For example, if you wanted to create a new featured article on
your page, you could submit:

```json
{
  "featured_article": {
    "title": "This is my new article!"
  }
}
```

This will create a new record in the related collection, and save its primary key in the `featured_article` field for
this item. To update an existing item, provide the primary key with the updates, and Directus will treat it as an
update instead of a creation:

```json
{
  "featured_article": {
    "id": 15,
    "title": "This is an updated title for my article!"
  }
}
```

Seeing that the Many-to-One relationship stores the foreign key on the field itself, removing the item can be done by
nullifying the field:

```json
{
  "featured_article": null
}
```

#### One-to-Many and Many-to-Many

One-to-Many, and therefore Many-to-Many and Many-to-Any, relationships can be updated in one of two ways:

**Basic**

The API will return one-to-many fields as an array of nested keys or items (based on the `fields` parameter). You can
use this same structure to select what the related items are:
::example{title="Examples"}
  ::tabs
    ::div{class="pr-6"}
    ---
    label: "one-to-many"
    ---
    Countries that have a list of cities.
    ```json
    {
      "cities": [2, 7, 149]
    }
    ```
    ::

    ::div{class="pr-6"}
    ---
    label: "many-to-many"
    ---
    Articles that have a list of tags.
    `id` here is the junction collections's primary key while `tag_id` is the actual tag's primary key.
    ```json
    {
      "tags": [{"id": 2, "tag_id": 12}, {"id": 5, "tag_id": 7}, {"id": 19, "tag_id": 149}]
    }
    ```
    ::
  ::
::

You can also provide an object instead of a primary key in order to create new items nested on the fly, or an object
with a primary key included to update an existing item:


::example{title="Examples"}
  ::tabs
    ::div{class="pr-6"}
    ---
    label: "one-to-many"
    ---
    ```json
    {
      "cities": [
        2, // assign existing city with id of 2 to be a child of the current item
        {
          "name": "A new nested item" // create a new city
        },
        {
          "id": 149,
          "name": "changed city name" // assign and update existing city with id of 149
        }
      ]
    }
    ```
    ::

    ::div{class="pr-6"}
    ---
    label: "many-to-many"
    ---
    As a many-to-many is composed of a one-to-many and a many-to-one relationship, operating on the tags collection is done over the junction collection.
    These are some examples but are not exhaustive:
    ```json
    {
      "tags": [
        2, // assign existing junction item with id of 2 to be a child of the current item
        {
          "tag_id": 12 // create a new junction item and assign the tag with id of 12 to it
        },
        {
          "id": 5,
          "tag_id": 7 // update existing junction item with id of 5 to link to the tag with id of 7
        },
        {
          "id": 19,
          "tag_id": { "name": "A new tag" }
          // create a new tag and assign it to the existing junction item with id of 19
        },
        {
          "id": 19,
          "tag_id": {
            "id": 149,
            "name": "changed tag name"
            // update the tag with id of 149 and assign it to the existing junction item with id of 19
          }
        },
        {
          "id": 19,
          "tag_id": null // remove the tag from the existing junction item with id of 19
        }
      ]
    }
    ```
    ::
  ::
::

To remove items from this relationship, omit them from the array:

```json
{
  "cities": [2, 149]
}
```

This method of updating a one-to-many is very useful for smaller relational datasets.

**"Detailed"**

Alternatively, you can provide an object detailing the changes as follows:


```json
{
  "cities": {
    "create": [{ "name": "A new city" }],
    "update": [{ "id": 149, "name": "Update an existing city" }],
    "delete": [7]
  }
}
```

This is useful if you need to have more tightly control on staged changes, or when you're working with a big relational
dataset.

#### Many-to-Any (Union Types)

Many-to-Any fields work very similar to a "regular" many-to-many, with the exception that the related field can pull in
the fields from any of the related collections, for example:

```json
{
  "sections": [
    {
      "collection": "headings",
      "item": {
        /* headings fields */
      }
    },
    {
      "collection": "paragraphs",
      "item": {
        /* paragraphs fields */
      }
    }
  ]
}
```
