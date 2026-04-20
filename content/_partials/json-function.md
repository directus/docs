## The `json(field, path)` Function

The `json(field, path)` function extracts the value from the specified path in a JSON field and returns it as a separate field in the query response. It is used in the `fields` query parameter alongside regular field names and other field functions.


::callout{icon="material-symbols:warning-rounded" color="warning"}

**Supported Parameters**

The `json(field, path)` function is not supported in the `filter`. For filtering JSON fields, use the [`_json` filter operator](/guides/connect/filter-rules) instead.

::

### Syntax

```
json(field, path)
```

- **`field`** — the name of a JSON column in the collection (or a relational path to one, see [Relational Queries](#relational-queries)).
- **`path`** — a dot-and-bracket notation path to the value you want to extract from within the JSON document.

Both arguments are required and separated by a comma.

### Path Notation

Paths use dot notation for object keys and bracket notation for array indices.

| Pattern | Example | Meaning |
|---|---|---|
| `key` | `color` | Top-level key |
| `a.b.c` | `settings.theme.color` | Nested keys |
| `[n]` | `tags[0]` | Array element at index `n` |
| `a[n].b` | `items[0].name` | Mixed object/array access |

**Examples:**

```
json(metadata, color)                   → top-level key
json(metadata, settings.theme)          → nested object
json(data, items[0].name)               → array element property
json(data, [0])                         → first element of a top-level array
```

### Response Format

Extracted values are returned as additional fields on each item using auto-generated aliases. The alias follows the pattern:

```
{field}_{path}_json
```

Special characters in the path (`[`, `]`, `.`) are replaced with underscores. For example:

| Request field | Response key |
|---|---|
| `json(metadata, color)` | `metadata_color_json` |
| `json(metadata, settings.priority)` | `metadata_settings_priority_json` |
| `json(data, items[0].name)` | `data_items_0_name_json` |

#### Example Request and Response

```http
GET /items/articles?fields=id,title,json(metadata, color)&sort=title
```

```json
{
  "data": [
    {
      "id": 1,
      "title": "An Article",
      "metadata_color_json": "blue"
    }
  ]
}
```

### Relational Queries

`json(field, path)` can traverse relational fields to extract JSON values from related items. The relational path goes inside the first argument, before the JSON field name.

#### Many-to-One (M2O)

```
json(relation.json_field, path)
```

The extracted value is returned nested under the relational key in the response, alongside any other requested fields from that relation.

```http
GET /items/articles?fields=id,title,category_id.name,json(category_id.metadata, color)
```

```json
{
  "data": [
    {
      "id": 1,
      "title": "An Article",
      "category_id": {
        "name": "Tech",
        "metadata_color_json": "blue"
      }
    }
  ]
}
```

Multiple `json(field, path)` extractions from the same relation are grouped under the same relational key:

```http
GET /items/articles?fields=id,json(category_id.metadata, color),json(category_id.metadata, icon)
```

```json
{
  "data": [
    {
      "category_id": {
        "metadata_color_json": "blue",
        "metadata_icon_json": "laptop"
      }
    }
  ]
}
```

#### One-to-Many (O2M)

For O2M relations, each related item returns its own extracted value. The response is an array of objects, each containing the extracted key.

```http
GET /items/articles/1?fields=id,json(comments.data, type)
```

```json
{
  "data": {
    "id": 1,
    "comments": [
      { "data_type_json": "review" },
      { "data_type_json": "feedback" },
      { "data_type_json": "question" }
    ]
  }
}
```

#### Many-to-Any (M2A)

For M2A relations, use the standard Directus collection scope syntax inside the first argument:

```
json(relation.item:collection_name.json_field, path)
```

```http
GET /items/shapes/1?fields=id,json(children.item:circles.metadata, color)
```

### Relational Depth Limit

`json(field, path)` will enforce a maximum relational depth (`MAX_RELATIONAL_DEPTH`, default `10`) limit for the `field` argument. This depth is calculated irrespective of the Path depth limit mentioned below

```
json(category_id.metadata, a.b.c.d.e)
```
This has a relational depth of **2** (`category_id` + `metadata`), regardless of how many segments are in the JSON path `a.b.c.d.e`.

Exceeding the relational depth will return an error.

### JSON Path Depth Limit

In addition to a relation depth, `json(field, path)` will also enforce a path depth limit (`MAX_JSON_QUERY_DEPTH`, default `10`). This depth is calculated irrespective of the relational depth.

```
json(category_id.metadata, a[0].c.d.e.f.g.h.i.j)
```

The above example has a path depth of 10 and is allowed by default; adding one more segment exceeds the limit.

Exceeding the path depth limit returns an error.

### Unsupported Path Expressions

The following path syntaxes are **not supported** and will return an error:

| Expression | Example |
|---|---|
| Empty brackets (wildcard) | `items[]` |
| `[*]` wildcard | `items[*].name` |
| `*` glob | `items.*` |
| JSONPath predicates | `items[?(@.price > 10)]` |
| `@` current node | `@.name` |
| `$` root | `$.name` |

### Object Keys with Special Characters

The `json(field, path)` path syntax uses `.` as a separator between key segments. There is no escape mechanism for object keys that themselves contain dots, spaces, or other special characters. For example, if your JSON has a key `"first.name"`, there is no way to express that in the path — `json(data, first.name)` would be interpreted as nested access to key `first`, then key `name`.

Similarly, because MySQL and MariaDB path conversion uses dot-notation (`$.key.subkey`), keys containing characters that are special in that context (e.g., spaces) may not be reachable. PostgreSQL's parameterized `->?` approach is more permissive for unusual key names, but the input path format still does not provide an escaping mechanism.

### Database-Specific Exceptions

**SQLite**

- SQLite can return `0`/`1` isntead of `boolean` values.

**MSSQL**

- Will always returns scalar values as **strings (`NVARCHAR`)**, even when the original JSON value is a number or boolean. For example, a JSON integer `42` will be returned as the string `"42"`. Your application should perform type coercion as needed.

**Oracle**

- Similar to MSSQL will also return scalar values as **strings**, regardless of the original JSON type (number, boolean, etc.). A JSON number `3.14` will be returned as `"3.14"`.

### GraphQL

Each `json`-typed field exposes a `json(path: String!)` sub-field inside `{fieldName}_func`. The `path` argument is required. The return type is `JSON` (any scalar, object, or array).

`{fieldName}_func` already exists for the `count` sub-field. `json` sits alongside it in the same selection.

#### Simple Scalar Extraction

```graphql
{
  articles {
    id
    title
    metadata_func {
      json(path: "color")
    }
  }
}
```

```json
{
  "data": {
    "articles": [
      { "id": 1, "title": "An Article", "metadata_func": { "json": "blue" } }
    ]
  }
}
```

#### Multiple Paths From the Same Field

Request multiple paths inside a single `{fieldName}_func` selection by using **field aliases** on the `json` sub-field:

```graphql
{
  articles {
    id
    metadata_func {
      color: json(path: "color")
      theme: json(path: "settings.theme")
      firstTag: json(path: "tags[0]")
    }
  }
}
```

```json
{
  "data": {
    "articles": [
      {
        "id": 1,
        "metadata_func": {
          "color": "blue",
          "theme": "dark",
          "firstTag": "electronics"
        }
      }
    ]
  }
}
```

#### Extracting an Object or Array

When the path points to an object or array rather than a scalar, the full value is returned as parsed JSON:

```graphql
{
  articles {
    id
    metadata_func {
      dimensions: json(path: "dimensions")
      tags: json(path: "tags")
    }
  }
}
```

```json
{
  "data": {
    "articles": [
      {
        "id": 1,
        "metadata_func": {
          "dimensions": { "width": 10, "height": 20, "depth": 5 },
          "tags": ["electronics", "premium", "new"]
        }
      }
    ]
  }
}
```

#### Relational JSON Extraction

For a Many-to-One relation, request the `json` function on the related collection's field:

```graphql
{
  articles {
    id
    category_id {
      name
      metadata_func {
        color: json(path: "color")
      }
    }
  }
}
```

### TypeScript SDK

The SDK accepts `json(fieldName, path)` strings in the `fields` array. The first argument is constrained by TypeScript to fields typed as `json` in your schema. An invalid field name produces a compile-time error. The path (second argument) is a plain `string` and is not validated at compile time.

The SDK also computes the response alias type automatically from the literal string, so extracted values are fully typed with no manual type extensions needed. The alias rule is `{field}_{path}_json` with `.`, `[`, and `]` replaced by `_`.

```typescript
import { createDirectus, readItems, rest } from '@directus/sdk';

interface Article {
  id: number;
  title: string;
  metadata: 'json' | null; // type literal 'json' tells the SDK this is a json field
}

interface Schema {
  articles: Article[];
}

const client = createDirectus<Schema>('https://directus.example.com').with(rest());

const items = await client.request(
  readItems('articles', {
    fields: ['id', 'title', 'json(metadata, color)'],
  }),
);

// metadata_color_json is automatically typed as JsonValue | null — no cast needed
const color = items[0].metadata_color_json;
```

#### Multiple Paths

```typescript
const items = await client.request(
  readItems('articles', {
    fields: ['id', 'title', 'json(metadata, color)', 'json(metadata, settings.theme)', 'json(metadata, tags[0])'],
  }),
);

// All aliases are typed directly on items:
//   items[0].metadata_color_json          // JsonValue | null
//   items[0].metadata_settings_theme_json // JsonValue | null
//   items[0].metadata_tags_0_json         // JsonValue | null
```

#### Via a Relational Field

Pass `json(field, path)` inside a relational field object. The extracted alias appears typed on the related item.

```typescript
const items = await client.request(
  readItems('articles', {
    fields: ['id', 'title', { category_id: ['name', 'json(metadata, color)'] }],
  }),
);

const color = items[0].category_id.metadata_color_json;
```

#### Compile-Time Safety

The SDK enforces that the first argument must be a `json`-typed field, and that the output alias is typed. Non-json fields produce a TypeScript error:

```typescript
// valid: metadata is a json field; metadata_color_json is typed as JsonValue | null
readItems('articles', { fields: ['json(metadata, color)'] });

// compile error: title is a string field, not json
readItems('articles', { fields: ['json(title, color)'] });
```

::callout{icon="material-symbols:info-outline"}
**Alias Typing Requires Literal Field Arrays**

Alias typing only works when the `fields` array is an inline literal or typed `as const`. If the array is built dynamically at runtime, TypeScript widens it to `string[]` and the aliases are not present in the inferred return type.
::

#### IDE Autocomplete

When typing inside the `fields` array, the SDK provides partial autocomplete for the `json()` function. For each `json`-typed field in your schema, the IDE offers `json(fieldName, ` as a completion, positioning the cursor ready for the path argument:

```typescript
// Typing 'json(' in the fields array surfaces:
//   json(metadata,    ← cursor positioned here, type your path then close with )
readItems('articles', { fields: ['json(metadata, color)'] });
```

This works via TypeScript's template-literal completion (TypeScript >= 4.7). Only `json`-typed fields appear as suggestions. The path argument is a free string and has no completion hints.
