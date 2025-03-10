---
title: Flows
description: Configure environment variables, memory, and timeout for Flows.
---


:partial{content="config-env-vars"}

| Variable                      | Description                                                                                                      | Default Value |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------- |
| `FLOWS_ENV_ALLOW_LIST`        | A comma-separated list of environment variables.                                                                 | `false`       |
| `FLOWS_RUN_SCRIPT_MAX_MEMORY` | The maximum amount of memory the 'Run Script' operation can allocate in megabytes. Minimum `8`. | `32`          |
| `FLOWS_RUN_SCRIPT_TIMEOUT`    | The maximum duration the 'Run Script' operation can run for in milliseconds.                                     | `10000`       |

## Using Environment Variables

Once enabled via the `FLOWS_ENV_ALLOW_LIST` variable, environment variables can be accessed through the `$env` object within the passed `data` or through `process.env`. For example:

```js
const publicUrl = data.$env.PUBLIC_URL;
```
