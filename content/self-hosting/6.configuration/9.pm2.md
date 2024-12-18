---
title: PM2
description: Configuration for PM2, the process manager for Directus.
---


:partial{content="config-env-vars"}

For more information on what these options do, refer directly to the [`pm2` documentation](https://pm2.keymetrics.io/docs/usage/application-declaration/).

| Variable                      | Description                                                         | Default                                      |
| ----------------------------- | ------------------------------------------------------------------- | -------------------------------------------- |
| `PM2_INSTANCES`<sup>[1]</sup> | Number of app instance to be launched.                              | `1`                                          |
| `PM2_EXEC_MODE`               | One of `fork`, `cluster`.                                           | `'cluster'`                                  |
| `PM2_MAX_MEMORY_RESTART`      | App will be restarted if it exceeds the amount of memory specified. |                                              |
| `PM2_MIN_UPTIME`              | Min uptime of the app to be considered started.                     |                                              |
| `PM2_LISTEN_TIMEOUT`          | Time in ms before forcing a reload if app not listening.            |                                              |
| `PM2_KILL_TIMEOUT`            | Time in milliseconds before sending a final SIGKILL.                |                                              |
| `PM2_MAX_RESTARTS`            | Number of failed restarts before the process is killed.             |                                              |
| `PM2_RESTART_DELAY`           | Time to wait before restarting a crashed app.                       | `0`                                          |
| `PM2_AUTO_RESTART`            | Automatically restart Directus if it crashes unexpectedly.          | `false`                                      |
| `PM2_LOG_ERROR_FILE`          | Error file path.                                                    | `$HOME/.pm2/logs/<app name>-error-<pid>.log` |
| `PM2_LOG_OUT_FILE`            | Output file path.                                                   | `$HOME/.pm2/logs/<app name>-out-<pid>.log`   |

<sup>[1]</sup> Redis is required in case of multiple instances.

These environment variables only exist when you're using the official Docker Container, or are using the provided [`ecosystem.config.cjs`](https://github.com/directus/directus/blob/main/ecosystem.config.cjs) file with `pm2` directly.
