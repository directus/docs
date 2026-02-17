---
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

## Telemetry

Send AI Assistant traces to an external observability platform for monitoring usage, performance, and cost.

| Variable | Description | Default Value |
| -------- | ----------- | ------------- |
| `AI_TELEMETRY_ENABLED` | Enable OpenTelemetry-based tracing for AI Assistant requests. | `false` |
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
