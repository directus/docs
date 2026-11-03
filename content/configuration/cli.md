---
title: CLI
description: Built-in Directus CLI commands.
---

Directus includes several CLI commands for managing your instance. All commands are run via
`npx directus <command>`. You can append `--help` to any command to see its available options.

## Start

Starts the Directus server.

```sh
npx directus start
```

You can override the configuration file path by setting `CONFIG_PATH`:

```sh
CONFIG_PATH="/path/to/config.js" npx directus start
```

See [Configuration Options](/configuration/intro) for supported file formats.

## Bootstrap

Prepares the database for use by Directus. This runs `database install`, `database migrate:latest`, and creates the
initial admin user if one does not exist.

```sh
npx directus bootstrap
```

This is the recommended command when setting up a new Directus project. If you need more control over individual steps,
use the commands below instead.

## Database

### Install

Installs the required Directus system tables into the database.

```sh
npx directus database install
```

### Migrate

Runs all pending Directus internal migrations and any custom migrations from the configured `MIGRATIONS_PATH` directory.

```sh
npx directus database migrate:latest
```

See [Migrations](/configuration/migrations) for details on writing custom migration files.

## Schema

### Apply

Applies a schema snapshot to the Directus instance. Use this to synchronize your data model across environments.

```sh
npx directus schema apply ./path/to/snapshot.yaml
```

## Cache

### Clear

Clears the Directus cache. By default, it flushes both the data cache and the system cache (schema, permissions, etc.).
This command reads the same cache configuration as the running Directus instance (`CACHE_STORE`, `CACHE_NAMESPACE`, and
any Redis connection variables). Run it with the same environment variables your Directus instance uses.

```sh
npx directus cache clear
```

Use flags to target a specific cache:

| Flag       | Description                                        |
| ---------- | -------------------------------------------------- |
| `--system` | Clears only the system cache (schema, permissions) |
| `--data`   | Clears only the data cache                         |

::callout{icon="material-symbols:info-outline"}
If you use `memory` as `CACHE_STORE`, this command has no effect. In-memory caches are local to each running process and
can only be cleared by restarting the instance.
::

Directus does not automatically clear the cache on startup. If your deploy pipeline applies migrations or schema
changes, running instances will continue to serve stale cached data until the TTL expires. Run `cache clear` as the last
step to avoid this:

```sh
npx directus bootstrap
npx directus schema apply ./path/to/snapshot.yaml
npx directus cache clear
```

::callout{icon="material-symbols:warning-rounded" color="warning"}
In a horizontal scaling setup with a shared cache store like Redis, this command flushes the cache for all instances at
once. All instances will rebuild their cache on the next request, which may cause a temporary increase in database load.
::

## Extension CLI

For commands related to building, validating, and managing extensions, see the
[Extension CLI](/guides/extensions/cli) documentation.
