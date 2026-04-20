## The `_json` Filter Operator

The `_json` operator filters items by values inside a JSON field. It accepts an object mapping JSON paths to standard filter operators, letting you compare specific keys or array elements without loading the full document.

`_json` is only valid on `json`-typed fields.

### Syntax

```
?filter={"field":{"_json":{"path":{"_operator":value}}}}
```

**Examples:**

```
?filter={"metadata":{"_json":{"color":{"_eq":"blue"}}}}
?filter={"metadata":{"_json":{"price":{"_gte":100}}}}
?filter={"metadata":{"_json":{"tags[0]":{"_null":true}}}}
?filter={"metadata":{"_json":{"settings.theme":{"_contains":"dark"}}}}
```

Path keys inside `_json` use the same dot-and-bracket notation as the [`json(field, path)` function](/guides/connect/query-parameters).

### Supported Inner Operators

| Category        | Operators                                                 |
| --------------- | --------------------------------------------------------- |
| Equality        | `_eq`, `_neq`, `_ieq`, `_nieq`                            |
| Null            | `_null`, `_nnull`                                         |
| Set             | `_in`, `_nin`                                             |
| String          | `_contains`, `_ncontains`, `_icontains`, `_nicontains`    |
| Prefix / Suffix | `_starts_with`, `_ends_with` (plus `_i` variants)         |
| Numeric         | `_gt`, `_gte`, `_lt`, `_lte`, `_between`, `_nbetween`     |
| Empty           | `_empty`, `_nempty`                                       |

### Relational JSON Filtering

`_json` nests under relational keys the same way other filters do. To filter on a JSON field belonging to a related item, nest `_json` under the relation name:

```json
{
  "category_id": {
    "metadata": {
      "_json": {
        "color": { "_eq": "blue" }
      }
    }
  }
}
```

This matches articles whose related category has `metadata.color = "blue"`.

### Combining Multiple Conditions

Combine multiple `_json` filters at the top level with `_and` or `_or`:

```json
{
  "_and": [
    { "metadata": { "_json": { "color": { "_eq": "blue" } } } },
    { "metadata": { "_json": { "size": { "_gt": 10 } } } }
  ]
}
```

You can also group conditions inside a single `_json` value using `_and` or `_or`:

```json
{
  "metadata": {
    "_json": {
      "_and": [
        { "color": { "_eq": "blue" } },
        { "size": { "_gt": 10 } }
      ]
    }
  }
}
```

### Dynamic Variables

Dynamic filter variables like `$CURRENT_USER` and `$NOW` work inside `_json` inner values. They are resolved before the filter runs, so they apply in permission rules and regular queries.

### Database-Specific Behavior

**PostgreSQL numeric comparisons**

PostgreSQL extracts JSON scalars as `text`. Directus automatically casts to a numeric type when the filter value is a number or an array of numbers, so `_gt`, `_lt`, `_between`, and related operators work correctly in those cases. If you supply a numeric comparison with a string value (for example `{"version":{"_gt":"9"}}`), the comparison remains lexicographic. Use a numeric literal to get numeric comparison.

**SQLite**

SQLite may return `0` or `1` instead of boolean values when the path resolves to a boolean.

**MSSQL / Oracle**

Both dialects always return scalar values as strings regardless of the original JSON type. Apply any needed coercion in your application.

### GraphQL

Each `json`-typed field in a filter input type accepts `_json`, `_null`, and `_nnull`. The `_json` value is an object mapping JSON path strings to standard filter operators.

#### Simple Equality Filter

Path keys that are valid GraphQL identifiers (letters, digits, and `_`, with no dots or brackets) can be written inline:

```graphql
{
  articles(filter: { metadata: { _json: { color: { _eq: "blue" } } } }) {
    id
    title
  }
}
```

#### Filter With Operators

```graphql
{
  articles(
    filter: {
      metadata: {
        _json: {
          color: { _in: ["red", "blue"] }
          brand: { _nnull: true }
          description: { _contains: "premium" }
        }
      }
    }
  ) {
    id
    title
  }
}
```

#### Paths With Dots or Brackets

GraphQL input-object keys must be valid identifiers, so paths containing dots, brackets, or starting with `[` cannot be written inline. This includes:

- `settings.theme` (dot-separated nested path)
- `tags[0]` (bracket index notation)
- `[0].test` (path starting with an array index)

Pass the `_json` value as a typed variable instead:

```graphql
query FilterByNestedPath($jsonFilter: JSON) {
  articles(filter: { metadata: { _json: $jsonFilter } }) {
    id
    title
  }
}
```

Variables:

```json
{
  "jsonFilter": {
    "settings.theme": { "_eq": "dark" },
    "tags[0]": { "_eq": "electronics" },
    "[0].test": { "_null": false }
  }
}
```

#### Combining `_json` With `_and` / `_or`

```graphql
{
  articles(
    filter: {
      _and: [
        { metadata: { _json: { color: { _eq: "blue" } } } }
        { metadata: { _json: { level: { _gte: 3 } } } }
      ]
    }
  ) {
    id
    title
  }
}
```

#### Relational JSON Filter

```graphql
{
  articles(filter: { category_id: { metadata: { _json: { color: { _eq: "blue" } } } } }) {
    id
    title
    category_id {
      name
    }
  }
}
```

### TypeScript SDK

The `_json` operator is available on any field in the `filter` object. The SDK types it as `Record<string, FilterOperators<string | number | boolean | null>>`. The server enforces at runtime that `_json` is only valid on `json`-typed fields.

#### Simple Equality

```typescript
const items = await client.request(
  readItems('articles', {
    filter: {
      metadata: {
        _json: { color: { _eq: 'blue' } },
      },
    },
  }),
);
```

#### Multiple Path Conditions in One `_json`

```typescript
const items = await client.request(
  readItems('articles', {
    filter: {
      metadata: {
        _json: {
          color: { _eq: 'red' },
          brand: { _in: ['BrandX', 'BrandY'] },
          level: { _gte: 3 },
        },
      },
    },
  }),
);
```

#### Dot-Notation and Bracket Paths

Path keys with dots or brackets are plain strings. No special SDK handling is needed:

```typescript
const items = await client.request(
  readItems('articles', {
    filter: {
      metadata: {
        _json: {
          'settings.theme': { _eq: 'dark' },
          'tags[0]': { _eq: 'electronics' },
        },
      },
    },
  }),
);
```

#### Relational `_json` Filter

```typescript
const items = await client.request(
  readItems('articles', {
    filter: {
      category_id: {
        metadata: {
          _json: { color: { _eq: 'blue' } },
        },
      },
    },
  }),
);
```
