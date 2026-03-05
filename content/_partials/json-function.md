## The `json(field, path)` Function

The `json(field, path)` function extracts a specific value from a JSON field and returns it as a separate field in the query response. It is used in the `fields` query parameter alongside regular field names and other field functions.


::callout{icon="material-symbols:warning-rounded" color="warning"}

**Supported Paramaters**
the `json(field, path)` function is currently only supported for use in the `fields` query parameter.

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

Directus enforces a maximum relational depth (`MAX_RELATIONAL_DEPTH`, default `10`). For `json()`, only the **first argument** (the field path) counts toward this limit — the JSON path in the second argument is excluded.

```
json(category_id.metadata, a.b.c.d.e)
```
This has a relational depth of **2** (`category_id` + `metadata`), regardless of how many segments are in the JSON path `a.b.c.d.e`.

Exceeding the relational depth returns a `400 Invalid query. Max relational depth exceeded.` error.

### JSON Path Depth Limit

The JSON path (second argument) also has its own configurable limit:

```
MAX_JSON_QUERY_DEPTH=10  # default
```

Depth is counted by the number of `.` and `[` characters in the normalized path. A path like `a.b.c.d.e.f.g.h.i.j` has depth 10 and is allowed by default; adding one more segment exceeds the limit.

Exceeding this limit returns an error.

### Unsupported Path Expressions

The following path syntaxes are **not supported** and will return a `400` error:

| Expression | Example |
|---|---|---|
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
