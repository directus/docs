import type { UIMessage } from 'ai';

export type ToolCallSummary = { toolCallId: string; toolName: string; args: Record<string, unknown> };

export const REQUEST_MESSAGE_LIMIT = 12;

export function compactMessagesForRequest(messages: UIMessage[]): UIMessage[] {
	return messages.slice(-REQUEST_MESSAGE_LIMIT).map(message => ({
		...message,
		parts: message.parts?.filter(part => part.type === 'text') ?? [],
	}));
}

export function getMessageToolCalls(message: UIMessage | undefined): ToolCallSummary[] {
	if (!message?.parts) return [];
	return message.parts
		.filter((p): p is Extract<UIMessage['parts'][number], { type: `data-${string}` }> => p.type === 'data-tool-calls')
		.flatMap((p) => {
			const data = (p as { data?: { tools?: ToolCallSummary[] } }).data;
			return data?.tools ?? [];
		});
}
