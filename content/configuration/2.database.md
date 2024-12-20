---
title: Database
description: Configuration for database connections.
---


:partial{content="config-env-vars"}

| Variable                           | Description                                                                                                                                        | Default Value                 |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| `DB_CLIENT`                        | **Required**. What database client to use. One of `pg` or `postgres`, `mysql`, `oracledb`, `mssql`, `sqlite3`, `cockroachdb`.                      |                               |
| `DB_HOST`                          | Database host. Required when using `pg`, `mysql`, `oracledb`, or `mssql`.                                                                          |                               |
| `DB_PORT`                          | Database port. Required when using `pg`, `mysql`, `oracledb`, or `mssql`.                                                                          |                               |
| `DB_DATABASE`                      | Database name. Required when using `pg`, `mysql`, `oracledb`, or `mssql`.                                                                          |                               |
| `DB_USER`                          | Database user. Required when using `pg`, `mysql`, `oracledb`, or `mssql`.                                                                          |                               |
| `DB_PASSWORD`                      | Database user's password. Required when using `pg`, `mysql`, `oracledb`, or `mssql`.                                                               |                               |
| `DB_FILENAME`                      | Where to read/write the SQLite database. Required when using `sqlite3`.                                                                            |                               |
| `DB_CONNECTION_STRING`             | When using `pg`, you can submit a connection string instead of individual properties. Using this will ignore any of the other connection settings. |                               |
| `DB_EXCLUDE_TABLES`                | CSV of tables you want Directus to ignore completely                                                                                               | `spatial_ref_sys,sysdiagrams` |
| `DB_CHARSET` / `DB_CHARSET_NUMBER` | Charset/collation to use in the connection to MySQL/MariaDB                                                                                        | `UTF8_GENERAL_CI`             |
| `DB_VERSION`                       | Database version, in case you use the PostgreSQL adapter to connect a non-standard database. Not usually required.                                |                               |
| `DB_HEALTHCHECK_THRESHOLD`         | Healthcheck timeout threshold in milliseconds.                                                                                                     | `150`                         |

## Additional Database Variables

All `DB_*` environment variables are passed to the `connection` configuration of a [`Knex` instance](https://knexjs.org/guide/#configuration-options). This means you can extend the `DB_*` environment variables with any values you need to pass to the database instance.

This includes:
- `DB_POOL__` prefixed options which are passed to [`tarn.js`](https://github.com/vincit/tarn.js#usage).
- `DB_SSL__` prefixed options which are passed to the respective database driver. For example, `DB_SSL__CA` which can be used to specify a custom Certificate Authority (CA) certificate for SSL connections. This is required if the database server CA is not part of [Node.js' trust store](https://nodejs.org/api/tls.html).
