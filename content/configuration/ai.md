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
- The `/ai/chat` API route is not mounted
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
