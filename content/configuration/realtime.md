---
title: Realtime
description: Configuration for WebSockets and GraphQL Subscriptions.
---


:partial{content="config-env-vars"}

Directus Realtime provides WebSockets and GraphQL Subscriptions.

| Variable                       | Description                                                                                                                      | Default Value |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| `WEBSOCKETS_ENABLED`           | Whether or not to enable all WebSocket functionality.                                                                            | `false`       |
| `WEBSOCKETS_HEARTBEAT_ENABLED` | Whether or not to enable the heartbeat ping signal.                                                                              | `true`        |
| `WEBSOCKETS_HEARTBEAT_PERIOD`  | The period in seconds at which to send the ping. This period doubles as the timeout used for closing an unresponsive connection. | 30            |

It's recommended to keep the `WEBSOCKETS_HEARTBEAT_PERIOD` between 30 and 120 seconds, otherwise the connections could be considered idle by other parties and therefore terminated.

## WebSockets

| Variable                       | Description                                                                                            | Default Value |
| ------------------------------ | ------------------------------------------------------------------------------------------------------ | ------------- |
| `WEBSOCKETS_REST_ENABLED`      | Whether or not to enable the WebSocket message handlers.                                               | `true`        |
| `WEBSOCKETS_REST_PATH`         | The URL path at which the WebSocket endpoint will be available.                                        | `/websocket`  |
| `WEBSOCKETS_REST_CONN_LIMIT`   | How many simultaneous connections are allowed.                                                         | `Infinity`    |
| `WEBSOCKETS_REST_AUTH`         | The method of authentication to require for this connection. One of `public`, `handshake` or `strict`. | `handshake`   |
| `WEBSOCKETS_REST_AUTH_TIMEOUT` | The amount of time in seconds to wait before closing an unauthenticated connection.                    | 30            |

::callout{icon="material-symbols:menu-book-outline" color="primary" to="/guides/realtime/authentication"}
Read more about different authentication methods with Directus Realtime.
::

## GraphQL

| Variable                          | Description                                                                                            | Default Value |
| --------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------- |
| `WEBSOCKETS_GRAPHQL_ENABLED`      | Whether or not to enable GraphQL Subscriptions.                                                        | `true`        |
| `WEBSOCKETS_GRAPHQL_PATH`         | The URL path at which the GraphQL Subscriptions endpoint will be available.                            | `/graphql`    |
| `WEBSOCKETS_GRAPHQL_CONN_LIMIT`   | How many simultaneous connections are allowed.                                                         | `Infinity`    |
| `WEBSOCKETS_GRAPHQL_AUTH`         | The method of authentication to require for this connection. One of `public`, `handshake` or `strict`. | `handshake`   |
| `WEBSOCKETS_GRAPHQL_AUTH_TIMEOUT` | The amount of time in seconds to wait before closing an unauthenticated connection.                    | 30            |


::callout{icon="material-symbols:menu-book-outline" color="primary" to="/guides/realtime/authentication"}
Read more about different authentication methods with Directus Realtime.
::

## Collaborative Editing

::callout{icon="material-symbols:info-outline"}
Multi-instance collaboration requires a shared Redis instance for coordination.
::

| Variable                                       | Description                                                                            | Default Value |
| :--------------------------------------------- | :------------------------------------------------------------------------------------- | :------------ |
| `WEBSOCKETS_COLLAB_ENABLED`                    | Toggle collaborative editing functionality specifically (when WebSockets are enabled). | `true`        |
| `WEBSOCKETS_COLLAB_INSTANCE_TIMEOUT`           | Duration in milliseconds before a silent node is considered dead.                      | `10000`       |
| `WEBSOCKETS_COLLAB_CLUSTER_CLEANUP_CRON`       | Cron expression for how often to garbage-collect empty rooms.                          | `*/1 * * * *` |
| `WEBSOCKETS_COLLAB_LOCAL_CLEANUP_INTERVAL`     | Duration in milliseconds between local cleanup sweeps.                                 | `60000`       |
| `WEBSOCKETS_COLLAB_PERMISSIONS_CACHE_CAPACITY` | LRU cache size for permission checks.                                                  | `2000`        |
| `WEBSOCKETS_COLLAB_STORE_NAMESPACE`            | The namespace used for Redis storage.                                                  | `collab`      |

## Logging

Read more about logging with Directus Realtime in the [logging configuration](/configuration/logging).
