---
title: Logging
description: Configuration for general and Realtime logging.
---

:partial{content="config-env-vars"}

| Variable                | Description                                                                                         | Default Value |
| ----------------------- | --------------------------------------------------------------------------------------------------- | ------------- |
| `LOG_LEVEL`             | What level of detail to log. One of `fatal`, `error`, `warn`, `info`, `debug`, `trace` or `silent`. | `info`        |
| `LOG_HTTP_IGNORE_PATHS` | List of HTTP request paths which should not appear in the log.                                      |               |

All `LOGGER_*` environment variables are passed to the `options` configuration of a [`Pino` instance](https://github.com/pinojs/pino/blob/master/docs/api.md#options) and all `LOGGER_HTTP*` environment variables are passed to the `options` configuration of a [`Pino-http` instance](https://github.com/pinojs/pino-http#api). 

Based on your project's needs, you can extend the `LOGGER_*` environment variables with any config you need to pass to the logger instance. If a `LOGGER_LEVELS` key is added, these values will be passed to the logger frontmatter, as described [here](https://github.com/pinojs/pino/blob/master/docs/help.md#mapping-pino-log-levels-to-google-cloud-logging-stackdriver-severity-levels). The format for adding `LEVELS` values is: `LOGGER_LEVELS="trace:DEBUG,debug:DEBUG,info:INFO,warn:WARNING,error:ERROR,fatal:CRITICAL"`

## Log Retention

| Variable              | Description                                                                                                      | Default Value |
| --------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------- |
| `RETENTION_ENABLED`   | Whether or not to enable custom data retention settings. `false` will not delete data.                           | `false`       |
| `RETENTION_SCHEDULE`  | The cron schedule at which to check for removable records, the default is once a day at 00:00.                   | `0 0 * * *`   |
| `RETENTION_BATCH`     | The maximum number of records to delete in a single query.                                                       | `500`         |
| `ACTIVITY_RETENTION`  | The maximum amount of time to retain `directus_activity` records or `false` to disable. This excludes flow logs. | `90d`         |
| `REVISIONS_RETENTION` | The maximum amount of time to retain `directus_revisions` records or `false` to disable.                         | `90d`         |
| `FLOW_LOGS_RETENTION` | The maximum amount of time to retain flow logs or `false` to disable.                                            | `90d`         |

## Realtime Logs

![System Logs page with two panes - on the left a set of API calls, on the right the detailed logs for a single selected request.](/img/7abf4ad2-7d08-407d-bfca-67f3bff183d0.webp)

The WebSocket Logs endpoint is accessible at `/websocket/logs`. The method of authentication is limited to `strict` and the connection will be disconnected when the authentication expires. 

| Variable                     | Description                                                                                            | Default Value |
| ---------------------------- | ------------------------------------------------------------------------------------------------------ | ------------- |
| `WEBSOCKETS_LOGS_ENABLED`    | Whether or not to enable the Logs subscriptions.                                                       | `true`        |
| `WEBSOCKETS_LOGS_LEVEL`      | What level of detail to stream. One of `fatal`, `error`, `warn`, `info`, `debug`, `trace` or `silent`. | `info`        |
| `WEBSOCKETS_LOGS_STYLE`      | Stream just the message (pretty) or the full JSON log. One of `pretty`, `raw`.                         | `pretty`      |
| `WEBSOCKETS_LOGS_CONN_LIMIT` | How many simultaneous connections are allowed.                                                         | `Infinity`    |

::callout{icon="material-symbols:info-outline"}
**Ephemeral Logs**  
Realtime system logs are ephemeral and not stored in the database. They are only available while the realtime connection is
active. Refreshing the page will clear the logs.
::

### Enabling Realtime Logs

Realtime system logs rely on WebSockets which are enabled as part of :product-link{product="realtime"}. To enable this feature:

1. Ensure the `WEBSOCKETS_ENABLED` environment variable is set to `true`.
2. Verify that the `WEBSOCKETS_LOGS_ENABLED` environment variable is set to `true` (it defaults to `true` if not explicitly configured).

### Log Levels

Under the hood, Directus uses [pino](https://github.com/pinojs/pino) for logging and uses the log levels provided by the
library:

| Log Level | Numeric Value |
| --------- | ------------- |
| `trace`   | 10            |
| `debug`   | 20            |
| `info`    | 30            |
| `warn`    | 40            |
| `error`   | 50            |
| `fatal`   | 60            |

### Searching & Filtering

If running multiple instances of Directus in a horizontally-scaled setup, you can also filter the logs by instance in
the System Logs pane.

You can also filter the logs by level, or filter by search terms in the `msg` field.
