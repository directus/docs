### JSON Function

Use the `json(field, path)` function to extract a specific value from a JSON field and return it as a separate field in the query response. Paths use dot notation for object keys and bracket notation for array indices.

::code-group

```http [REST]
GET /items/articles?fields=id,title,json(metadata, color)
```

```graphql [GraphQL]
query {
	articles {
		id
		title
		metadata_func {
			json(path: "color")
		}
	}
}
```

```js [SDK]
import { createDirectus, rest, readItems } from '@directus/sdk';
const directus = createDirectus('https://directus.example.com').with(rest());

const result = await directus.request(
	readItems('articles', {
		fields: ['id', 'title', 'json(metadata, color)'],
	})
);
```

::

See [JSON Queries](/guides/connect/json-queries) for path syntax, relational traversal, depth limits, and full GraphQL and TypeScript SDK details.

The `json(field, path)` function is not supported in `filter`. For filtering JSON fields, use the [`_json` filter operator](/guides/connect/filter-rules) instead.
