import { tool, type Tool } from 'ai';
import { z, type ZodRawShape } from 'zod';
import { redactValue } from './sanitize';

interface ToolLike {
	name?: string;
	description?: string;
	inputSchema?: ZodRawShape;
	handler: (args: never, extra: never) => unknown;
}

export type ToolBindOptions = {
	maxCalls?: number;
	maxResultBytes?: number;
	onActivity?: () => void;
};

const DEFAULT_MAX_CALLS = 15;
const DEFAULT_MAX_RESULT_BYTES = 50 * 1024;

function byteLength(value: string): number {
	return Buffer.byteLength(value, 'utf8');
}

function truncateResult(value: string, maxBytes: number): string {
	if (byteLength(value) <= maxBytes) return value;
	let end = Math.min(value.length, maxBytes);
	while (byteLength(value.slice(0, end)) > maxBytes) end--;
	return `${value.slice(0, end)}\n\n[tool result truncated at ${maxBytes} bytes. If this is from get-directus-file, call it again with a higher offset to read the next chunk.]`;
}

export function bindMcpToolsForAI(tools: Record<string, ToolLike>, options: ToolBindOptions = {}) {
	const bound: Record<string, Tool> = {};
	let callCount = 0;
	const maxCalls = options.maxCalls ?? DEFAULT_MAX_CALLS;
	const maxResultBytes = options.maxResultBytes ?? DEFAULT_MAX_RESULT_BYTES;

	for (const [key, t] of Object.entries(tools)) {
		const name = t.name ?? key;
		const schema = t.inputSchema ? z.object(t.inputSchema).strict() : z.object({}).strict();
		bound[name] = tool({
			description: t.description ?? '',
			inputSchema: schema,
			execute: async (args: unknown) => {
				options.onActivity?.();
				callCount++;
				if (callCount > maxCalls) throw new Error(`Tool call limit exceeded (${maxCalls})`);

				const parsed = schema.safeParse(args);
				if (!parsed.success) {
					console.warn('[assistant] invalid tool args', { tool: name, issues: parsed.error.issues });
					throw new Error(`Invalid arguments for ${name}`);
				}

				try {
					const handler = t.handler as (args: unknown, extra: unknown) => unknown;
					const result = await handler(parsed.data, {});
					options.onActivity?.();
					const text = typeof result === 'string' ? result : JSON.stringify(redactValue(result));
					return truncateResult(text, maxResultBytes);
				}
				catch (error) {
					console.warn('[assistant] tool failed', { tool: name, error });
					throw error;
				}
			},
		});
	}
	return bound;
}
