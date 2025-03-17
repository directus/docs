---
title: Security & Limits
description: Configuration for access tokens, cookies, CSP, hashing, CORS, rate limiting, and request limits.
---

:partial{content="config-env-vars"}

| Variable                            | Description                                                                                                                                                                             | Default Value             |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| `SECRET`<sup>[1]</sup>              | Secret string for the project. Used for secret signing.                                                                                                                                 | Random value              |
| `ACCESS_TOKEN_TTL`                  | The duration that an access token is valid.                                                                                                                                             | `15m`                     |
| `EMAIL_VERIFICATION_TOKEN_TTL`      | The duration that an email verification token is valid.                                                                                                                                 | `7d`                      |
| `REFRESH_TOKEN_TTL`                 | The duration that a refresh token is valid. This value should be higher than `ACCESS_TOKEN_TTL` and `SESSION_COOKIE_TTL`.                                                               | `7d`                      |
| `REFRESH_TOKEN_COOKIE_DOMAIN`       | Which domain to use for the refresh token cookie. Useful for development mode.                                                                                                          |                           |
| `REFRESH_TOKEN_COOKIE_SECURE`       | Whether or not to set the `secure` attribute for the refresh token cookie.                                                                                                              | `false`                   |
| `REFRESH_TOKEN_COOKIE_SAME_SITE`    | Value for `sameSite` in the refresh token cookie.                                                                                                                                       | `lax`                     |
| `REFRESH_TOKEN_COOKIE_NAME`         | Name of the refresh token cookie.                                                                                                                                                       | `directus_refresh_token`  |
| `SESSION_COOKIE_TTL`                | The duration that the session cookie/token is valid, and also how long users stay logged-in to the App.                                                                                 | `1d`                      |
| `SESSION_COOKIE_DOMAIN`             | Which domain to use for the session cookie. Useful for development mode.                                                                                                                |                           |
| `SESSION_COOKIE_SECURE`             | Whether or not to set the `secure` attribute for the session cookie.                                                                                                                    | `false`                   |
| `SESSION_COOKIE_SAME_SITE`          | Value for `sameSite` in the session cookie.                                                                                                                                             | `lax`                     |
| `SESSION_COOKIE_NAME`               | Name of the session cookie.                                                                                                                                                             | `directus_session_token`  |
| `SESSION_REFRESH_GRACE_PERIOD`      | The duration during which a refresh request will permit recently refreshed sessions to be used, thereby preventing race conditions in refresh calls.                                    | `10s`                     |
| `LOGIN_STALL_TIME`                  | The duration in milliseconds that a login request will be stalled for, and it should be greater than the time taken for a login request with an invalid password.                       | `500`                     |
| `REGISTER_STALL_TIME`               | The duration in milliseconds that a registration request will be stalled for, and it should be greater than the time taken for a registration request with an already registered email. | `750`                     |
| `PASSWORD_RESET_URL_ALLOW_LIST`     | List of URLs that can be used as `reset_url` in the `/password/request` endpoint.                                                                                                       |                           |
| `USER_INVITE_TOKEN_TTL`             | The duration that the invite token is valid.                                                                                                                                            | `7d`                      |
| `USER_INVITE_URL_ALLOW_LIST`        | List of URLs that can be used as `invite_url` in the `/users/invite` endpoint.                                                                                                          |                           |
| `USER_REGISTER_URL_ALLOW_LIST`      | List of URLs that can be used as `verification_url` in the `/users/register` endpoint.                                                                                                  |                           |
| `IP_TRUST_PROXY`                    | Settings for the Express.js trust proxy setting.                                                                                                                                        | true                      |
| `IP_CUSTOM_HEADER`                  | What custom request header to use for the IP address.                                                                                                                                   | false                     |
| `ASSETS_CONTENT_SECURITY_POLICY`    | Custom overrides for the Content-Security-Policy header for the /assets endpoint. See [helmet's documentation on `helmet.contentSecurityPolicy()`](https://helmetjs.github.io).         |                           |
| `IMPORT_IP_DENY_LIST`<sup>[2]</sup> | Deny importing files from these IP addresses / IP ranges / CIDR blocks. Use `0.0.0.0` to match any local IP address.                                                                    | `0.0.0.0,169.254.169.254` |
| `CONTENT_SECURITY_POLICY_*`         | Custom overrides for the Content-Security-Policy header. See [helmet's documentation on `helmet.contentSecurityPolicy()`](https://helmetjs.github.io).                                  |                           |
| `HSTS_ENABLED`                      | Enable the Strict-Transport-Security policy header.                                                                                                                                     | `false`                   |
| `HSTS_*`                            | Custom overrides for the Strict-Transport-Security header. See [helmet's documentation](https://helmetjs.github.io).                                                                    |                           |

<sup>[1]</sup> When `SECRET` is not set, a random value will be used. This means sessions won't persist across system
restarts or horizontally scaled deployments. Must be explicitly set to a secure random value in production.

<sup>[2]</sup> localhost can get resolved to `::1` as well as `127.0.0.1` depending on the system - ensure to include
both if you want to specifically block localhost.

Browser are pretty strict when it comes to third-party cookies. If you're running into unexpected problems when running your project and API on different domains, make sure to verify your configuration for `REFRESH_TOKEN_COOKIE_NAME`, `REFRESH_TOKEN_COOKIE_SECURE`, and `REFRESH_TOKEN_COOKIE_SAME_SITE`.

## Hashing

| Variable               | Description                                                                                                                      | Default Value       |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| `HASH_MEMORY_COST`     | How much memory to use when generating hashes, in KiB.                                                                           | `4096` (4 MiB)      |
| `HASH_LENGTH`          | The length of the hash function output in bytes.                                                                                 | `32`                |
| `HASH_TIME_COST`       | The amount of passes (iterations) used by the hash function. It increases hash strength at the cost of time required to compute. | `3`                 |
| `HASH_PARALLELISM`     | The amount of threads to compute the hash on. Each thread has a memory pool with `HASH_MEMORY_COST` size.                        | `1` (single thread) |
| `HASH_TYPE`            | The variant of the hash function (`0`: argon2d, `1`: argon2i, or `2`: argon2id).                                                 | `2` (argon2id)      |
| `HASH_ASSOCIATED_DATA` | An extra and optional non-secret value. The value will be included Base64 encoded in the parameters portion of the digest.       |                     |

Argon2's hashing function is used by Directus to hash user passwords, generate hashes for the `Hash` field type in collections, and for use in the `/utils/hash/generate` endpoint.

All `HASH_*` environment variable parameters are passed to the `argon2.hash` function. See the [node-argon2 library options page](https://github.com/ranisalt/node-argon2/wiki/Options) for reference.

::callout{icon="material-symbols:info-outline"}
**Memory Usage**  
Modifying `HASH_MEMORY_COST` and/or `HASH_PARALLELISM` will affect the amount of memory directus uses when computing hashes; each thread gets `HASH_MEMORY_COST` amount of memory, so the total additional memory will be these two values multiplied. This may cause out of memory errors, especially when running in containerized environments.
::

## CORS

| Variable               | Description                                                                                                                                             | Default Value                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `CORS_ENABLED`         | Whether or not to enable the CORS headers.                                                                                                              | `false`                      |
| `CORS_ORIGIN`          | Value for the `Access-Control-Allow-Origin` header. Use `true` to match the Origin header, or provide a domain or a CSV of domains for specific access. | `false`                      |
| `CORS_METHODS`         | Value for the `Access-Control-Allow-Methods` header.                                                                                                    | `GET,POST,PATCH,DELETE`      |
| `CORS_ALLOWED_HEADERS` | Value for the `Access-Control-Allow-Headers` header.                                                                                                    | `Content-Type,Authorization` |
| `CORS_EXPOSED_HEADERS` | Value for the `Access-Control-Expose-Headers` header.                                                                                                   | `Content-Range`              |
| `CORS_CREDENTIALS`     | Whether or not to send the `Access-Control-Allow-Credentials` header.                                                                                   | `true`                       |
| `CORS_MAX_AGE`         | Value for the `Access-Control-Max-Age` header.                                                                                                          | `18000`                      |

For more details about each configuration variable, please see the [CORS package documentation](https://www.npmjs.com/package/cors#configuration-options).

## Rate Limiting

You can use the built-in rate-limiter to prevent users from hitting the API too much.

Enabling the rate-limiter with no other options will set a default maximum of 50 requests per second, tracked in memory.

| Variable                                    | Description                                                             | Default Value |
| ------------------------------------------- | ----------------------------------------------------------------------- | ------------- |
| `RATE_LIMITER_ENABLED`                      | Whether or not to enable rate limiting per IP on the API.               | `false`       |
| `RATE_LIMITER_POINTS`                       | The amount of allowed hits per duration.                                | `50`          |
| `RATE_LIMITER_DURATION`                     | The time window in seconds in which the points are counted.             | `1`           |
| `RATE_LIMITER_STORE`                        | Where to store the rate limiter counts. One of `memory`, `redis`.       | `memory`      |
| `RATE_LIMITER_HEALTHCHECK_THRESHOLD`        | Healthcheck timeout threshold in milliseconds.                          | `150`         |
| `RATE_LIMITER_GLOBAL_ENABLED`               | Whether or not to enable global rate limiting on the API.               | `false`       |
| `RATE_LIMITER_GLOBAL_POINTS`                | The total amount of allowed hits per duration.                          | `1000`        |
| `RATE_LIMITER_GLOBAL_DURATION`              | The time window in seconds in which the points are counted.             | `1`           |
| `RATE_LIMITER_GLOBAL_HEALTHCHECK_THRESHOLD` | Healthcheck timeout threshold in milliseconds.                          | `150`         |
| `RATE_LIMITER_REGISTRATION_ENABLED`         | Whether or not to enable rate limiting per IP on the user registration. | `true`        |
| `RATE_LIMITER_REGISTRATION_POINTS`          | The amount of allowed hits per duration.                                | `5`           |
| `RATE_LIMITER_REGISTRATION_DURATION`        | The time window in seconds in which the points are counted.             | `60`          |

### Pressure-Based Rate Limiter

This rate-limiter prevents the API from accepting new requests while the server is experiencing high load. This continuously monitors the current event loop and memory usage, and error with a 503 early when the system is overloaded.

| Variable                                      | Description                                                                 | Default Value |
| --------------------------------------------- | --------------------------------------------------------------------------- | ------------- |
| `PRESSURE_LIMITER_ENABLED`                    | Whether or not to enable pressure-based rate limiting on the API.           | `true`        |
| `PRESSURE_LIMITER_SAMPLE_INTERVAL`            | The time window for measuring pressure in milliseconds.                     | `250`         |
| `PRESSURE_LIMITER_MAX_EVENT_LOOP_UTILIZATION` | The maximum allowed utilization where `1` is 100% loop utilization.         | `0.99`        |
| `PRESSURE_LIMITER_MAX_EVENT_LOOP_DELAY`       | The maximum amount of time the current loop can be delayed in milliseconds. | `500`         |
| `PRESSURE_LIMITER_MAX_MEMORY_RSS`             | The maximum allowed memory Resident Set Size (RSS) in bytes.                | `false`       |
| `PRESSURE_LIMITER_MAX_MEMORY_HEAP_USED`       | The maximum allowed heap usage in bytes.                                    | `false`       |
| `PRESSURE_LIMITER_RETRY_AFTER`                | Sets the `Retry-After` header when the rate limiter is triggered.           | `false`       |

## Limits & Optimizations

Allows you to configure hard technical limits, to prevent abuse and optimize for your particular server environment.

| Variable                       | Description                                                                                 | Default Value |
| ------------------------------ | ------------------------------------------------------------------------------------------- | ------------- |
| `RELATIONAL_BATCH_SIZE`        | How many rows are read into memory at a time when constructing nested relational datasets.  | 25000         |
| `EXPORT_BATCH_SIZE`            | How many rows are read into memory at a time when constructing exports.                     | 5000          |
| `USERS_ADMIN_ACCESS_LIMIT`     | How many active users with admin privilege are allowed.                                     | `Infinity`    |
| `USERS_APP_ACCESS_LIMIT`       | How many active users with access to the Data Studio are allowed.                           | `Infinity`    |
| `USERS_API_ACCESS_LIMIT`       | How many active API access users are allowed.                                               | `Infinity`    |
| `GRAPHQL_QUERY_TOKEN_LIMIT`    | How many GraphQL query tokens will be parsed.                                               | 5000          |
| `MAX_PAYLOAD_SIZE`             | Controls the maximum request body size. Accepts number of bytes, or human readable string.  | `1mb`         |
| `MAX_RELATIONAL_DEPTH`         | The maximum depth when filtering / querying relational fields, with a minimum value of `2`. | `10`          |
| `QUERY_LIMIT_DEFAULT`          | The default query limit used when not defined in the API request.                           | `100`         |
| `QUERY_LIMIT_MAX`              | The maximum query limit accepted on API requests.                                           | `-1`          |
| `QUERYSTRING_MAX_PARSE_DEPTH ` | The maximum object depth when parsing URL query parameters using the querystring format     | `10`          |
