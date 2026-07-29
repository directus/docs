export function isAssistantEnabled(apiKey: string | undefined): boolean {
	return process.env.ASSISTANT_ENABLED !== 'false' && Boolean(apiKey);
}
