// IDE deeplink helpers for the docs MCP server and agent prompt copy actions.
// Toolkit-supported IDEs are sourced from @nuxtjs/mcp-toolkit's deeplink route.

export type McpIde = 'cursor' | 'vscode';

export interface McpIdeOption {
	id: McpIde;
	label: string;
	icon: string;
}

export const MCP_IDES: McpIdeOption[] = [
	{ id: 'cursor', label: 'Add to Cursor', icon: 'i-simple-icons:cursor' },
	{ id: 'vscode', label: 'Add to VS Code', icon: 'i-simple-icons:visualstudiocode' },
];

export function mcpDeeplinkPath(baseURL: string, ide?: McpIde) {
	const base = baseURL.replace(/\/$/, '');
	const path = `${base}/mcp/deeplink`;
	return ide ? `${path}?ide=${ide}` : path;
}

export function mcpServerUrl(origin: string, baseURL: string) {
	const base = baseURL.replace(/\/$/, '');
	return `${origin}${base}/mcp`;
}

export function chatGptPromptUrl(prompt: string) {
	return `https://chatgpt.com/?hints=search&q=${encodeURIComponent(prompt)}`;
}

export function claudePromptUrl(prompt: string) {
	return `https://claude.ai/new?q=${encodeURIComponent(prompt)}`;
}
