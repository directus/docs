---
stableId: 743f74e7-194d-42de-a115-dc7edd37dd77
title: AI
description: Configuration for AI Assistant and Model Context Protocol (MCP) features.
---

:partial{content="config-env-vars"}

## AI Assistant

| Variable | Description | Default Value |
| -------- | ----------- | ------------- |
| `AI_ENABLED` | Whether AI Assistant features are available. Set to `false` to completely disable AI Assistant across the entire instance, hiding the sidebar for all users and disabling the settings for administrators. | `true` |

::callout{icon="material-symbols:info" color="info"}
When `AI_ENABLED` is set to `false`:
- The API routes for the assistant are not mounted
- AI Assistant sidebar is hidden from all users
- AI settings form displays a disabled notice

This is useful for compliance requirements where AI features must be completely hidden.
::

## Model Context Protocol

| Variable | Description | Default Value |
| -------- | ----------- | ------------- |
| `MCP_ENABLED` | Whether the Model Context Protocol server is available for system administrators to enable in project settings. Set to `false` to completely disable MCP functionality across the entire instance. | `true` |

::callout{icon="material-symbols:info" color="info"}
When `MCP_ENABLED` is set to `false`, the MCP server cannot be enabled through **Settings → AI → Model Context Protocol** in the admin interface, providing system administrators with complete control over AI integration features. See the [MCP Server](/guides/ai/mcp/installation) guide for more information.
::

## Model Context Protocol OAuth

MCP OAuth adds browser-based authorization for compatible MCP clients. Set `MCP_OAUTH_ENABLED` to `true` to mount the OAuth discovery, authorization, token, registration, and revocation routes.

Client registration modes are separately opt-in. Enable at least one registration mode with `MCP_OAUTH_DCR_ENABLED=true` for Dynamic Client Registration or `MCP_OAUTH_CIMD_ENABLED=true` for Client ID Metadata Document registration. Both the environment variable and project setting must allow a registration mode before Directus advertises or accepts it.

After enabling the environment variables, enable **OAuth Enabled** and at least one client registration mode in **Settings** > **AI** > **Model Context Protocol** for each project that should allow MCP OAuth.

The MCP OAuth authorization endpoint and Dynamic Client Registration endpoint use dedicated rate limiter pools. See [Security & Limits](/configuration/security-limits#rate-limiting) for the `RATE_LIMITER_MCP_OAUTH_*` and `RATE_LIMITER_MCP_OAUTH_REGISTRATION_*` variables.

| Variable | Description | Default Value |
| -------- | ----------- | ------------- |
| `MCP_OAUTH_ENABLED` | Whether MCP OAuth routes are mounted. Set to `true` before enabling MCP OAuth in project settings. | `false` |
| `MCP_OAUTH_AUTH_CODE_TTL` | How long an OAuth authorization code remains valid before the client exchanges it for tokens. | `60s` |
| `MCP_OAUTH_MAX_CLIENTS` | Maximum number of registered OAuth clients. Set to `0` to disable the limit. | `10000` |
| `MCP_OAUTH_CLIENT_UNUSED_TTL` | How long an unused registered client can remain before cleanup removes it. | `24h` |
| `MCP_OAUTH_CLIENT_IDLE_TTL` | How long an inactive registered client can remain after its last OAuth activity. Set to `0` to disable idle cleanup. | `0` |
| `MCP_OAUTH_REQUIRE_RESOURCE` | Whether authorization and refresh requests must explicitly include the MCP resource parameter. | `false` |
| `MCP_OAUTH_CLEANUP_SCHEDULE` | Cron schedule for removing expired authorization codes, expired OAuth grants, and stale clients. | `*/15 * * * *` |
| `MCP_OAUTH_ALLOWED_REDIRECT_DOMAINS` | Comma-separated domain allowlist for HTTPS OAuth redirect URIs. Leave empty to allow any valid HTTPS redirect URI. Loopback redirects and configured custom-scheme redirects are allowed separately. | `''` |
| `MCP_OAUTH_ALLOWED_CUSTOM_REDIRECTS` | Comma-separated allowlist of custom URI-scheme redirect authorities for desktop MCP clients. Set to an empty value to disable custom-scheme redirects. | `raycast://oauth,cursor://cursor.mcp` |
| `MCP_OAUTH_DCR_ENABLED` | Whether Dynamic Client Registration can be enabled in project settings. | `false` |
| `MCP_OAUTH_CIMD_ENABLED` | Whether Client ID Metadata Document registration can be enabled in project settings. | `false` |
| `MCP_OAUTH_CIMD_ALLOW_HTTP` | Allow `http://` Client ID Metadata Document URLs. Keep disabled outside local development. | `false` |
| `MCP_OAUTH_CIMD_ALLOWED_DOMAINS` | Comma-separated list of domains allowed to use Client ID Metadata Document registration. Leave empty to allow any valid metadata document domain. | `''` |
| `MCP_OAUTH_CIMD_BLOCKED_TLDS` | Comma-separated list of top-level domains blocked for Client ID Metadata Document registration. | `test,localhost,invalid,example,local,onion` |

::callout{icon="material-symbols:menu-book-outline" color="primary" to="/guides/ai/mcp/oauth"}
Read the MCP OAuth guide for setup steps, client registration behavior, and revocation.
::

## Telemetry

Send AI Assistant traces to an external observability platform for monitoring usage, performance, and cost.

| Variable | Description | Default Value |
| -------- | ----------- | ------------- |
| `AI_TELEMETRY_ENABLED` | Enable OpenTelemetry-based tracing for AI Assistant requests. User IDs and Role ID will be included in traces. | `false` |
| `AI_TELEMETRY_PROVIDER` | Telemetry provider to use. Supported values: `langfuse`, `braintrust`. | `langfuse` |
| `AI_TELEMETRY_RECORD_IO` | Include full prompt inputs and response outputs in traces. | `false` |

::callout{icon="material-symbols:warning" color="warning"}
Enabling `AI_TELEMETRY_RECORD_IO` will send the full content of user messages and AI responses to your telemetry provider. Only enable this if your telemetry provider meets your data privacy requirements.
::

### Langfuse

Set `AI_TELEMETRY_PROVIDER` to `langfuse` (default).

| Variable | Description | Default Value |
| -------- | ----------- | ------------- |
| `LANGFUSE_SECRET_KEY` | Langfuse secret key. | — |
| `LANGFUSE_PUBLIC_KEY` | Langfuse public key. | — |
| `LANGFUSE_BASE_URL` | Langfuse API base URL. | `https://cloud.langfuse.com` |

### Braintrust

Set `AI_TELEMETRY_PROVIDER` to `braintrust`.

| Variable | Description | Default Value |
| -------- | ----------- | ------------- |
| `BRAINTRUST_API_KEY` | Braintrust API key. | — |
| `BRAINTRUST_PROJECT_NAME` | Braintrust project name for grouping traces. | — |
| `BRAINTRUST_API_URL` | Braintrust API URL. Only needed for self-hosted instances. | — |
