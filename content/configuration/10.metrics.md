---
title: Metrics
description: Configuration for metrics.
---

To enable performance and error measurement of connected services, Directus can provide Prometheus metrics.

| Variable           | Description                                                                                                             | Default Value                  |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `METRICS_ENABLED`  | Whether or not to enable metrics.                                                                                       | `false`                        |
| `METRICS_SCHEDULE` | The cron schedule at which to generate the metrics, the default is every minute                                         | `*/1 * * * *`                  |
| `METRICS_TOKENS`   | A CSV of tokens to allow access to via a `Authorization: Metrics <token>` header. By default it is restricted to admins | --                             |
| `METRICS_SERVICES` | A CSV of directus services to observe metrics for. Currently `database`, `cache`, `redis` and `storage` are supported   | `database,cache,redis,storage` |

::callout{icon="material-symbols:warning-rounded" color="amber"}
**Metric Aggregation**
If Directus is running within a PM2 context, then metrics will be aggregated on a per scheduled job frequency. Ensure
Prometheus' scrape frequency takes that into account.
::
