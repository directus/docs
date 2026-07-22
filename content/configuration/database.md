---
stableId: 56701b9c-6b92-44f5-8774-782c33b5739d
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
| `DB_CHARSET` / `DB_CHARSET_NUMBER` | Charset/collation to use in the connection to MySQL<sup>[1](https://dev.mysql.com/doc/refman/8.0/en/charset-mysql.html)</sup>/MariaDB<sup>[2](https://mariadb.com/docs/server/reference/data-types/string-data-types/character-sets/supported-character-sets-and-collations)</sup>.                                                                                        | `UTF8_GENERAL_CI`             |
| `DB_VERSION`                       | Database version, in case you use the PostgreSQL adapter to connect a non-standard database. Not usually required.                                |                               |
| `DB_HEALTHCHECK_THRESHOLD`         | Healthcheck timeout threshold in milliseconds.                                                                                                     | `150`                         |

## Additional Database Variables

All `DB_*` environment variables are passed to the `connection` configuration of a [`Knex` instance](https://knexjs.org/guide/#configuration-options). This means you can extend the `DB_*` environment variables with any values you need to pass to the database instance.

This includes:
- `DB_POOL__` prefixed options which are passed to [`tarn.js`](https://github.com/vincit/tarn.js#usage).
- `DB_SSL__` prefixed options which are passed to the respective database driver. For example, `DB_SSL__CA` which can be used to specify a custom Certificate Authority (CA) certificate for SSL connections. This is required if the database server CA is not part of [Node.js' trust store](https://nodejs.org/api/tls.html).

::callout{icon="i-lucide-info"}
**Note**  
`DB_SSL__CA_FILE` may be preferred to load the CA directly from a file.
::

## Self-Signed Certificates

Managed databases (for example Heroku Managed PostgreSQL or DigitalOcean Managed PostgreSQL) often enforce SSL and provide their own Certificate Authority (CA). Because that CA is not in Node.js' default trust store, connections can fail with `SELF_SIGNED_CERT_IN_CHAIN`.

PostgreSQL connection-string options such as `sslmode=verify-full` are interpreted by `libpq` / `psql`, not by the Node.js PostgreSQL driver used by Directus. Prefer the `DB_SSL__*` variables below (or `NODE_EXTRA_CA_CERTS`) instead of relying on `sslmode` in `DB_CONNECTION_STRING`.

To trust the provider CA while still verifying certificates:

1. Download the database CA certificate in PEM format.
2. Point Directus at that certificate with either:
   - `DB_SSL__CA_FILE` — absolute path to the PEM file (preferred), or
   - `DB_SSL__CA` — PEM contents as a string
3. Keep certificate verification enabled (`DB_SSL__REJECT_UNAUTHORIZED` unset or `true`).

Alternatively, add the CA to the Node.js trust store for the whole process:

```
NODE_EXTRA_CA_CERTS="/absolute/path/to/db-ca.crt"
```

::callout{icon="i-lucide-triangle-alert" color="warning"}
**Warning**  
Do not set `DB_SSL__REJECT_UNAUTHORIZED`, `rejectUnauthorized`, or `NODE_TLS_REJECT_UNAUTHORIZED` to `false` in production. That disables TLS certificate verification and weakens the security of the entire application. Prefer trusting the provider CA with `DB_SSL__CA_FILE` / `DB_SSL__CA` or `NODE_EXTRA_CA_CERTS`.
::
