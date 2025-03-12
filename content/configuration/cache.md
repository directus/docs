---
title: Cache
description: Configuration for internal and output caching.
---

:partial{content="config-env-vars"}

Directus has a built-in data-caching option. Enabling this will cache the output of requests (based on the current user
and exact query parameters used) into configured cache storage location. This drastically improves API performance, as
subsequent requests are served straight from this cache. Enabling cache will also make Directus return accurate
cache-control headers. Depending on your setup, this will further improve performance by caching the request in
middleman servers (like CDNs) and even the browser.

::callout{icon="material-symbols:info-outline"}
**Internal Caching**
In addition to data-caching, Directus also does some internal caching. Note `CACHE_SCHEMA` which is enabled by default.
This speed up the overall performance of Directus, as we don't want to introspect the whole database on every request.
::

::callout{icon="material-symbols:info-outline"}
**Assets Cache**
`Cache-Control` and `Last-Modified` headers for the `/assets` endpoint are separate from the regular data-cache.
`Last-Modified` comes from `modified_on` DB field. This is useful as it's often possible to cache assets for far longer
than you would cache database content. To learn more, see [Files](/configuration/files).
::

| Variable                                     | Description                                                                                                               | Default Value                        |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `CACHE_ENABLED`                              | Whether or not data caching is enabled.                                                                                   | `false`                              |
| `CACHE_TTL`<sup>[1]</sup>                    | How long the data cache is persisted.                                                                                     | `5m`                                 |
| `CACHE_CONTROL_S_MAXAGE`                     | Whether to not to add the `s-maxage` expiration flag. Set to a number for a custom value.                                 | `0`                                  |
| `CACHE_AUTO_PURGE`<sup>[2]</sup>             | Automatically purge the data cache on actions that manipulate the data.                                                   | `false`                              |
| `CACHE_AUTO_PURGE_IGNORE_LIST`<sup>[3]</sup> | List of collections that prevent cache purging when `CACHE_AUTO_PURGE` is enabled.                                        | `directus_activity,directus_presets` |
| `CACHE_SYSTEM_TTL`<sup>[4]</sup>             | How long `CACHE_SCHEMA` is persisted.                                                                                     | --                                   |
| `CACHE_SCHEMA`<sup>[4]</sup>                 | Whether or not the database schema is cached. One of `false`, `true`                                                      | `true`                               |
| `CACHE_SCHEMA_MAX_ITERATIONS`<sup>[4]</sup>  | Safe value to limit max iterations on get schema cache. This value should only be adjusted for high scaling applications. | `100`                                |
| `CACHE_SCHEMA_SYNC_TIMEOUT`                  | How long to wait for other containers to message before trying again                                                      | `10000`                              |
| `CACHE_SCHEMA_FREEZE_ENABLED`                | Whether or not to freeze the schema to improve memory efficiency                                                          | false                                |
| `CACHE_NAMESPACE`                            | How to scope the cache data.                                                                                              | `system-cache`                       |
| `CACHE_STORE`<sup>[5]</sup>                  | Where to store the cache data. Either `memory`, `redis`.                                                                  | `memory`                             |
| `CACHE_STATUS_HEADER`                        | If set, returns the cache status in the configured header. One of `HIT`, `MISS`.                                          | --                                   |
| `CACHE_VALUE_MAX_SIZE`                       | Maximum size of values that will be cached. Accepts number of bytes, or human readable string. Use `false` for no limit   | false                                |
| `CACHE_SKIP_ALLOWED`                         | Whether requests can use the Cache-Control header with `no-store` to skip data caching.                                   | false                                |
| `CACHE_HEALTHCHECK_THRESHOLD`                | Healthcheck timeout threshold in ms.                                                                                      | `150`                                |

<sup>[1]</sup> `CACHE_TTL` Based on your project's needs, you might be able to aggressively cache your data, only
requiring new data to be fetched every hour or so. This allows you to squeeze the most performance out of your Directus
instance. This can be incredibly useful for applications where you have a lot of (public) read-access and where updates
aren't real-time (for example a website). `CACHE_TTL` uses [`ms`](https://www.npmjs.com/package/ms) to parse the value,
so you configure it using human readable values (like `2 days`, `7 hrs`, `5m`).

<sup>[2]</sup> `CACHE_AUTO_PURGE` allows you to keep the Directus API real-time, while still getting the performance
benefits on quick subsequent reads.

<sup>[3]</sup> The cache has to be manually cleared when requiring to access updated results for collections in
`CACHE_AUTO_PURGE_IGNORE_LIST`.

<sup>[4]</sup> Not affected by the `CACHE_ENABLED` value.

<sup>[5]</sup> `CACHE_STORE` For larger projects, you most likely don't want to rely on local memory for caching.
Instead, you can use the above `CACHE_STORE` environment variable to use `redis` as the cache store.
