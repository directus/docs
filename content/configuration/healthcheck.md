---
title: Health Check
description: Configuration for the server health check service.
---

:partial{content="config-env-vars"}

The health check service powers the `/server/health` endpoint, which reports the status of connected services like the database, edis, storage, and email. Results are cached and shared across requests to avoid excessive checks.

| Variable                | Description                                                                                           | Default Value                  |
| ----------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------ |
| `HEALTHCHECK_ENABLED`   | Whether or not to enable the `/server/health` endpoint.                                               | `true`                         |
| `HEALTHCHECK_NAMESPACE` | Namespace used for health check cache keys to prevent conflicts with other cached data.               | `directus:healthcheck`         |
| `HEALTHCHECK_SERVICES`  | Comma-separated list of services to check. Supported values: `database`, `redis`, `storage`, `email`. | `database,redis,storage,email` |
| `HEALTHCHECK_CACHE_TTL` | How long the cached health check result is valid before services are re-checked.                      | `5m`                           |

::callout{icon="material-symbols:info-outline"}
**Note**  
Including `redis` or `email` in `HEALTHCHECK_SERVICES` does not guarantee they are checked:

- `redis` is only checked when Redis is configured (see [`REDIS_ENABLED`](/configuration/synchronization)).
- `email` is only checked when [`EMAIL_VERIFY_SETUP`](/configuration/email) is `true`.
::

Individual services also support their own health check threshold configuration. See [Database](/configuration/database), [Cache](/configuration/cache), [Files](/configuration/files), and [Security & Limits](/configuration/security-limits) for `*_HEALTHCHECK_THRESHOLD` variables.
