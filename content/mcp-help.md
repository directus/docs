---
stableId: 4b6990b6-8399-4386-890d-a8eda0e0b8b9
title: Docs MCP Server
description: Connect Claude, Cursor, VS Code, or any MCP-compatible client directly to the Directus documentation.
---

You landed here because you opened the Directus docs MCP server in a browser. The server itself speaks the [Model Context Protocol](https://modelcontextprotocol.io/) — connect a compatible AI client to it and your assistant can search and read these docs as a live tool.

::callout{icon="material-symbols:info" color="info"}
This is the **docs MCP server**, which exposes this documentation site to AI clients. If you want to connect AI tools to your own Directus instance to manage content and schema, see the [Directus product MCP guide](/guides/ai/mcp) instead.
::

## Server URL

```
https://directus.io/docs/mcp
```

Transport: streamable HTTP. No authentication required.

## Install in one click

::card-group

:::card{title="Add to Cursor" icon="i-simple-icons:cursor" to="/mcp/deeplink" target="_blank"}
Opens Cursor and registers the docs MCP server.
:::

:::card{title="Add to VS Code" icon="i-simple-icons:visualstudiocode" to="/mcp/deeplink?ide=vscode" target="_blank"}
Opens VS Code and registers the docs MCP server.
:::

::

## Manual setup

For clients without a one-click installer, add the server to your MCP config.

### Claude Code

```bash
claude mcp add --transport http directus-docs https://directus.io/docs/mcp
```

### Claude Desktop

Edit `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "directus-docs": {
      "type": "http",
      "url": "https://directus.io/docs/mcp"
    }
  }
}
```

### Codex / Windsurf / other HTTP-MCP clients

Point them at `https://directus.io/docs/mcp` with transport set to `http` (sometimes called `streamable-http`).

## Available tools

| Tool | Inputs | Use it for |
|---|---|---|
| `list-docs` | `section?`, `limit?` | Discover available docs pages when you do not know exact paths. |
| `get-doc` | `path` | Fetch a single page's full markdown by path (e.g. `/getting-started/overview`). |
| `search-docs` | `query`, `section?`, `framework?`, `limit?` | Full-text search across the docs. Returns ranked results with title, snippet, and section. |

## Try it

After connecting, ask your AI client questions like:

- "Search the Directus docs for OAuth setup."
- "Get the docs page on configuring the SDK in Nuxt."
- "List all guides in the data-model section."
- "How do I create a flow in Directus? Use the docs MCP."

The assistant should call `search-docs` or `list-docs`, then `get-doc` to read the relevant page.

## Troubleshooting

- **Connection refused or 404** — confirm the URL is exactly `https://directus.io/docs/mcp` (note the `/docs` prefix).
- **Tools not showing up** — restart your MCP client after adding the server. Some clients only load tools at startup.
- **Search returns nothing** — `search-docs` is case-insensitive but does keyword match. Try fewer or broader terms.

Found a bug? Report it at [github.com/directus/docs/issues](https://github.com/directus/docs/issues).
