---
title: Query Parameters
description: Learn about Directus query parameters - fields, filter, search, sort, limit, offset, page, aggregate, groupBy, deep, alias, and export. Understand how to customize your API requests and retrieve specific data from your collections.
---

Most Directus API endpoints can use global query parameters to alter the data that is returned.

## Fields

Specify which fields are returned. This parameter also supports dot notation to request nested relational fields, and wildcards (*) to include all fields at a specific depth.

<!-- TODO: Write equivalent GraphQL example -->

::code-group
```http [REST]
GET /items/posts
	?fields=first_name,last_name,avatar.description
```

```graphql [GraphQL]
Use native GraphQL queries.
```

```json [SDK]
{
	"fields": ["first_name", "last_name", { "avatar": ["description"] }]
}
```
::

::callout{icon="material-symbols:info-outline"}
**Examples**  
| Value                  | Description                                                        |
| ---------------------- | ------------------------------------------------------------------ |
| `first_name,last_name` | Return only the `first_name` and `last_name` fields.               |
| `title,author.name`    | Return `title` and the related `author` item's `name` field.       |
| `*`                    | Return all fields.                                                 |
| `*.*`                  | Return all fields and all immediately related fields.              |
| `*,images.*`           | Return all fields and all fields within the `images` relationship. |
::

::callout{icon="material-symbols:info-outline"}
**Wildcards and performance**  
While wildcards are very useful, we recommend only requesting specific fields in production. By only requesting the fields you need, you can speed up the request, and reduce the overall output size.
::

### Many to Any Fields

As Many to Any (M2A) fields have nested data from multiple collections, you are not always able to fetch the same field from every related collection. In M2A fields, you can use the following syntax to specify what fields to fetch from which related nested collection type: `?fields=m2a-field:collection-scope.field`

::callout{icon="material-symbols:info-outline"}
**Example**  
In an `posts` collection there is a Many to Any field called `sections` that points to `headings`, `paragraphs`, and `videos`. Different fields should be fetched from each related collection.

	::code-group
	```http [REST]
  GET /items/posts
  	?fields[]=title
  	&fields[]=sections.item:headings.title
  	&fields[]=sections.item:headings.level
  	&fields[]=sections.item:paragraphs.body
  	&fields[]=sections.item:videos.source
	```

  ```graphql [GraphQL]
	# Use can use native GraphQL Union types.

	query {
		posts {
			sections {
				item {
					... on headings {
						title
						level
					}
					... on paragraphs {
						body
					}
					... on videos {
						source
					}
				}
			}
		}
	}
	```

	```js [SDK]
	import { createDirectus, rest, readItems } from '@directus/sdk';
	const directus = createDirectus('https://directus.example.com').with(rest());

	const result = await directus.request(
		readItems('posts', {
			fields: [
				'title',
				{
					sections: [
						{
							item: {
								headings: ['title', 'level'],
								paragraphs: ['body'],
								videos: ['source'],
							}
						}
					]
				}
			],
		})
	);
	```
	::

::

## Filter

Specify which items are returned based on the result of a [filter rule](/guides/connect/filter-rules).

::code-group

```http [REST]
// There are two available syntax:

GET /items/posts
	?filter[title][_eq]=Hello

GET /items/posts
	?filter={ "title": { "_eq": "Hello" }}
```

```graphql [GraphQL]
query {
	posts(filter: { title: { _eq: "Hello" } }) {
		id
	}
}

# Attribute names in GraphQL cannot contain the `:` character. If you are filtering Many to Any fields, you will need to replace it with a double underscore.
```

```js [SDK]
import { createDirectus, rest, readItems } from '@directus/sdk';
const directus = createDirectus('https://directus.example.com').with(rest());

const result = await directus.request(
	readItems('posts', {
		filter: {
			title: {
				_eq: 'Hello',
			},
		},
	})
);
```
::

## Search

Search on all string and text type fields within a collection. It's an easy way to search for an item without creating complex field filters – though it is far less optimized. Related item fields are not included.

::code-group

```http [REST]
GET /items/posts
	?search=Directus
```

```graphql [GraphQL]
query {
	posts(search: "Directus") {
		id
	}
}
```

```js [SDK]
import { createDirectus, rest, readItems } from '@directus/sdk';
const directus = createDirectus('https://directus.example.com').with(rest());

const result = await directus.request(
	readItems('posts', {
		search: 'Directus',
	})
);
```
::

## Sort

:video-embed{video-id="74a53f16-9a2b-42de-bca2-5de319565462"}

What fields to sort results by. Sorting defaults to ascending, but appending a `-` will reverse this. Fields are prioritized by the order in the parameter. The dot notation is used to sort with values of related fields.

::code-group
```http [REST]
GET /items/posts
	?sort=sort,-date_created,author.name
```

```graphql [GraphQL]
query {
	posts(sort: ["sort", "-date_created", "author.name"]) {
		id
	}
}
```

```js [SDK]
import { createDirectus, rest, readItems } from '@directus/sdk';
const directus = createDirectus('https://directus.example.com').with(rest());

const result = await directus.request(
	readItems('posts', {
		sort: ['sort', '-date_created', 'author.name'],
	})
);
```
::

## Limit

Set the maximum number of items that will be returned. The default limit is set to `100`. `-1` will return all items.

::code-group
```http [REST]
GET /items/posts
	?limit=50
```

```graphql [GraphQL]
query {
	posts(limit: 50) {
		id
	}
}
```

```js [SDK]
import { createDirectus, rest, readItems } from '@directus/sdk';
const directus = createDirectus('https://directus.example.com').with(rest());

const result = await directus.request(
	readItems('posts', {
		limit: 50,
	})
);
```
::

::callout{icon="material-symbols:info-outline"}
**Large limits and performance**  
Depending on the size of your collection, fetching the maximum amount of items may result in degraded performance or timeouts.

The maximum number of items that can be requested on the API can be configured using the `QUERY_LIMIT_MAX` environment variable. This cannot be overridden by changing the value of `limit`.
::

## Offset

Skip the specified number of items in the response. This parameter can be used for pagination.

::code-group
```http [REST]
GET /items/posts
	?offset=100
```

```graphql [GraphQL]
query {
	posts(offset: 100) {
		id
	}
}
```

```js [SDK]
import { createDirectus, rest, readItems } from '@directus/sdk';
const directus = createDirectus('https://directus.example.com').with(rest());

const result = await directus.request(
	readItems('posts', {
		offset: 100,
	})
);
```
::

## Page

An alternative to `offset`. Returned values are the value of `limit` multiplied by `page`. The first page is `1`.

::code-group
```http [REST]
GET /items/posts
	?page=2
```

```graphql [GraphQL]
query {
	posts(page: 2) {
		id
	}
}
```

```js [SDK]
import { createDirectus, rest, readItems } from '@directus/sdk';
const directus = createDirectus('https://directus.example.com').with(rest());

const result = await directus.request(
	readItems('posts', {
		page: 2,
	})
);
```
::

## Aggregate

Aggregate functions allow you to perform calculations on a set of values, returning a single result.

| Function        | Description                                                   |
| --------------- | ------------------------------------------------------------- |
| `count`         | Counts how many items there are                               |
| `countDistinct` | Counts how many unique items there are                        |
| `sum`           | Adds together the values in the given field                   |
| `sumDistinct`   | Adds together the unique values in the given field            |
| `avg`           | Get the average value of the given field                      |
| `avgDistinct`   | Get the average value of the unique values in the given field |
| `min`           | Return the lowest value in the field                          |
| `max`           | Return the highest value in the field                         |
| `countAll`      | Equivalent to `?aggregate[count]=*` (GraphQL only)            |

::code-group
```http [REST]
GET /items/posts
	?aggregate[count]=*
```

```graphql [GraphQL]
query {
	posts_aggregated {
		countAll
	}
}
```

```js [SDK]
import { createDirectus, rest, aggregate } from '@directus/sdk';
const directus = createDirectus('https://directus.example.com').with(rest());

const result = await directus.request(
	aggregate('posts', {
		aggregate: { count: '*' },
	})
);
```
::

## GroupBy

Grouping allows for running aggregate functions based on a shared value, rather than the entire dataset.

You can group by multiple fields simultaneously. Combined with the functions, this allows for aggregate reporting per year-month-date.

::code-group
```http [REST]
GET /items/posts
  ?aggregate[count]=views,comments
  &groupBy[]=author
  &groupBy[]=year(publish_date)
```

```graphql [GraphQL]
query {
  posts_aggregated(groupBy: ["author", "year(publish_date)"]) {
    group
    count {
      views
      comments
    }
  }
}
```

```js [SDK]
import { createDirectus, rest, aggregate } from '@directus/sdk';
const directus = createDirectus('https://directus.example.com').with(rest());

const result = await directus.request(
  aggregate('posts', {
    aggregate: {
      count: ['views', 'comments']
    },
    groupBy: ['author', 'year(publish_date)'],
  })
);
```
::

## Deep

Deep allows you to set any of the other query parameters (expect for [Fields](#fields) and [Deep](#deep) itself) on a nested relational dataset.

The nested query parameters are to be prefixed with an underscore.

::code-group
```http [REST]
// There are two available syntax:

GET /items/posts
	?deep[translations][_filter][languages_code][_eq]=en-US

GET /items/posts
	?deep={ "translations": { "_filter": { "languages_code": { "_eq": "en-US" }}}}
```

```graphql [GraphQL]
# Natively supported by GraphQL.
query {
	posts {
		translations(filter: { languages_code: { code: { _eq: "en-US" } } }) {
			id
		}
	}
}
```

```js [SDK]
import { createDirectus, rest, readItems } from '@directus/sdk';
const directus = createDirectus('https://directus.example.com').with(rest());

const result = await directus.request(
	readItems('posts', {
		deep: {
			translations: {
				_filter: {
					languages_code: {
						_eq: 'en-US',
					},
				}
			},
		},
	})
);
```
::

::callout{icon="material-symbols:info-outline"}
**Example**  
Only get 3 related posts, with only the top rated comment nested:
```json
{
	"deep": {
		"related_posts": {
			"_limit": 3,
			"comments": {
				"_sort": "rating",
				"_limit": 1
			}
		}
  }
}
```
::

## Alias

Rename fields for this request, and fetch the same nested data set multiple times using different filters.

::code-group

```http [REST]
GET /items/posts
	?alias[all_translations]=translations
	&alias[dutch_translations]=translations
	&deep[dutch_translations][_filter][code][_eq]=nl-NL
```

```graphql [GraphQL]
# Natively supported by GraphQL.
query {
	posts {
		dutch_translations: translations(filter: { code: { _eq: "nl-NL" } }) {
			id
		}

		all_translations: translations {
			id
		}
	}
}
```

```js [SDK]
import { createDirectus, rest, readItems } from '@directus/sdk';
const directus = createDirectus('https://directus.example.com').with(staticToken()).with(rest());

const result = await directus.request(
	readItems('posts', {
		alias: {
			all_translations: 'translations',
			dutch_translations: 'translations',
		},
		deep: {
			dutch_translations: {
				_filter: {
					code: {
						_eq: 'nl-NL',
					},
				},
			},
		},
	})
);
```
::

::callout{icon="material-symbols:info-outline"}
**Aliases in combination with other features**  
Aliases support being used in combination with:

1. functions, e.g. `alias[release_year]=year(released)`{lang="http"}
2. in the deep query parameter, e.g. `deep[author][_alias][birthyear]=year(birthday)`{lang="http"}

Note that it is not possible to use aliases on relational fields e.g. `alias[author_name]=author.name`{lang="http"} and not possible to have `.` in the alias name itself e.g. `alias[not.possible]=field`{lang="http"}.
::

## Export

Saves the API response to a file. Valid values are `csv`, `json`, `xml`, `yaml`.

```http [GET /items/posts]
?export=type
```

## Version

Queries a version of a record by version key when [content versioning](/guides/content/content-versioning) is enabled on a collection. Applies only to single item retrieval.

```http [GET /items/posts/1]
?version=v1
```

```graphql [GraphQL]
query {
  posts_by_id(id: 1, version: "v1") {
    id
  }
}
```

```js [SDK]
import { createDirectus, rest, readItem } from "@directus/sdk";
const directus = createDirectus("https://directus.example.com").with(rest());

const result = await directus.request(
  readItem("posts", {
    version: "v1",
  })
);
```

## VersionRaw

Specifies to return relational delta changes as a [detailed output](https://directus.io/docs/guides/connect/relations#creating-updating-deleting) on a version record.

```http [GET /items/posts/1]
?version=v1&versionRaw=true
```

```graphql [GraphQL]
query {
  posts_by_version(id: 1, version: "v1") {
    id
  }
}
```

```js [SDK]
import { createDirectus, rest, readItem } from "@directus/sdk";
const directus = createDirectus("https://directus.example.com").with(rest());

const result = await directus.request(
  readItem("posts", {
    version: "v1",
    versionRaw: true,
  })
);
```

## Functions

:partial{content="query-functions"}

::code-group
```http [REST]
GET /items/posts
	?filter[year(date_published)][_eq]=1968
```

```graphql [GraphQL]
query {
	posts(filter: { date_published_func: { year: { _eq: 1968 } } }) {
		id
	}
}

# Due to GraphQL name limitations, append `_func` at the end of the field name and use the function name as the nested field.
```

```js [SDK]
import { createDirectus, rest, readItems } from '@directus/sdk';
const directus = createDirectus('https://directus.example.com').with(rest());

const result = await directus.request(
	readItems('posts', {
		filter: {
			"year(date_published)": {
				_eq: 1968
			}
		},
	})
);
```
::

## Backlink

When backlink is set to `false`, the API will exclude reverse relations during `*.*` wildcard field expansion to prevent circular references and reduce duplicate data in responses. 

The backlink parameter defaults to `true`, so you need to explicitly set it to `false` to enable the filtering behavior.

::callout{icon="material-symbols:info-outline"}
**Wildcard Only**<br/>
The backlink parameter only affects `*.*` wildcard field expansion. Explicitly specified field names are not filtered.
For example: `fields=author.articles` will still include the reverse relation even when `backlink=false`.
::

::code-group

```http [REST]
GET /items/posts
	?fields=*.*.*
    &backlink=false
```

```js [SDK]
import { createDirectus, rest, readItems } from "@directus/sdk";
const directus = createDirectus("https://directus.example.com").with(rest());

const result = await directus.request(
  readItems("posts", {
    backlink: false,
  })
);
```

::

::callout{icon="material-symbols:info-outline"}
**Example**  
Red lines mark the response when backlink is set to `true` while green marks when backlinks is set to `false`.
The articles collection consists of a many-to-one relation to Users called `author` and a many-to-many relation to Tags called `tags`.

<br/>

`GET /items/articles?fields=*.*.*&backlink=`{lang="http"}
<UBadge color="error" variant="soft">true</UBadge> \/
<UBadge color="success" variant="soft">false</UBadge>

```json
{
  "data": [
    {
      "id": 1,
      "title": "My first Article",
      "author": {
        "id": 2,
        "name": "Nils",
        "articles": [
          { // [!code --]
            "id": 1, // [!code --]
            "title": "My first Article", // [!code --]
            "author": { // [!code --]
              "id": 2, // [!code --]
              "name": "Nils", // [!code --]
              "articles": [1] // [!code --]
            }, // [!code --]
            "tags": [ // [!code --]
              { // [!code --]
                "id": 3, // [!code --]
                "articles_id": 1, // [!code --]
                "tags_id": 4 // [!code --]
              } // [!code --]
            ] // [!code --]
          } // [!code --]
          1 // [!code ++]
        ]
      },
      "tags": [
        {
          "id": 3,
          "articles_id": { // [!code --]
            "id": 1, // [!code --]
            "title": "My first Article", // [!code --]
            "author": { // [!code --]
              "id": 2, // [!code --]
              "name": "Nils", // [!code --]
              "articles": [1] // [!code --]
            },  // [!code --]
            "tags": [ // [!code --]
              { // [!code --]
                "id": 3, // [!code --]
                "articles_id": 1, // [!code --]
                "tags_id": 4 // [!code --]
              } // [!code --]
            ] // [!code --]
          }, // [!code --]
          "articles_id": 1, // [!code ++]
          "tags_id": {
            "id": 4,
            "tag": "Tag1",
            "articles": [
              { // [!code --]
                "id": 3, // [!code --]
                "articles_id": 1, // [!code --]
                "tags_id": 4 // [!code --]
              } // [!code --]
              3 // [!code ++]
            ]
          }
        }
      ]
    }
  ]
}
```

::