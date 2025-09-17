---
title: AI
description: Configuration for AI features including the Model Context Protocol (MCP) server.
---

:partial{content="config-env-vars"}

## Model Context Protocol

| Variable | Description | Default Value |
| -------- | ----------- | ------------- |
| `MCP_ENABLED` | Whether the Model Context Protocol server is available for system administrators to enable in project settings. Set to `false` to completely disable MCP functionality across the entire instance. | `true` |

::callout{icon="material-symbols:info" color="info"}
When `MCP_ENABLED` is set to `false`, the MCP server cannot be enabled through **Settings → AI → Model Context Protocol** in the admin interface, providing system administrators with complete control over AI integration features. See the [MCP Server](/guides/ai/mcp/installation) guide for more information.
::
