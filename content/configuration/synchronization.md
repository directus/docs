---
title: Synchronization
description: Configuration around synchronization and Redis.
---

:partial{content="config-env-vars"}

Synchronization in Directus refers to the process of coordinating actions across multiple instances or containers. This is crucial for ensuring consistency and reliability in distributed environments. Directus supports two synchronization stores: `memory` and `redis`. The `memory` store is the default and suitable for single-container deployments, while `redis` is recommended for multi-container deployments to ensure synchronization across all instances.

| Variable                    | Description                         | Default Value   |
| --------------------------- | ----------------------------------- | --------------- |
| `SYNCHRONIZATION_STORE`     | One of `memory`, `redis`.           | `memory`        |
| `SYNCHRONIZATION_NAMESPACE` | How to scope the channels in Redis. | `directus-sync` |

## Redis

Redis is a critical component for Directus in multi-container deployments. It enables features like caching, rate-limiting, and WebSockets to function reliably across all instances of Directus. To use Redis, you can configure the following variables:

| Variable         | Description                                                                                                 | Default Value |
| ---------------- | ----------------------------------------------------------------------------------------------------------- | ------------- |
| `REDIS_ENABLED`  | Whether or not Redis should be used. Defaults to whether or not you have any of the vars below configured.  |               |
| `REDIS`          | Redis connection string. Using this will ignore the other Redis connection parameter environment variables. |               |
| `REDIS_HOST`     | Hostname of the Redis instance.                                                                             |               |
| `REDIS_PORT`     | Port of the Redis instance.                                                                                 |               |
| `REDIS_USERNAME` | Username for the Redis instance.                                                                            |               |
| `REDIS_PASSWORD` | Password for the Redis instance.                                                                            |               |
