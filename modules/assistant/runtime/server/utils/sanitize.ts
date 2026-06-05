const PAGE_PATH_PATTERN = /^\/?[a-z0-9/_-]{0,127}$/;
const PREF_PATTERN = /^[a-zA-Z0-9 _.-]{1,64}$/;

function removeControlChars(value: string): string {
	return [...value].filter((char) => {
		const code = char.charCodeAt(0);
		return code > 31 && code !== 127;
	}).join('');
}

export const MAX_MESSAGE_CHARS = 4000;
export const MAX_TOTAL_INPUT_CHARS = 30_000;
export const MAX_REQUEST_MESSAGES = 100;

const REDACTIONS: Array<[RegExp, string]> = [
	[/sk-ant-[A-Za-z0-9_-]+/g, '[REDACTED_API_KEY]'],
	[/sk-or-[A-Za-z0-9_-]+/g, '[REDACTED_API_KEY]'],
	[/gh[pousr]_[A-Za-z0-9]{36}/g, '[REDACTED_GITHUB_TOKEN]'],
	[/AKIA[0-9A-Z]{16}/g, '[REDACTED_AWS_KEY]'],
	[/Bearer\s+[A-Za-z0-9._-]{20,}/gi, 'Bearer [REDACTED]'],
	[/eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, '[REDACTED_JWT]'],
	[/[A-Z_]*(SECRET|PASSWORD|API_KEY|TOKEN)[A-Z_]*\s*[=:]\s*\S+/gi, '[REDACTED_ENV_SECRET]'],
	[/([?&](token|access_token|api_key)=)[^&\s]+/gi, '$1[REDACTED]'],
	[/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[REDACTED_EMAIL]'],
	[/\b(?:[a-z0-9-]+\.)*(?:internal|local)\b/gi, '[REDACTED_HOST]'],
	[/\b10(?:\.\d{1,3}){3}\b/g, '[REDACTED_IP]'],
	[/\b172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2}\b/g, '[REDACTED_IP]'],
	[/\b192\.168(?:\.\d{1,3}){2}\b/g, '[REDACTED_IP]'],
];

export function redactText(value: string): string {
	let out = value;
	for (const [pattern, replacement] of REDACTIONS) out = out.replace(pattern, replacement);
	return out;
}

export function redactValue(value: unknown): unknown {
	if (typeof value === 'string') return redactText(value);
	if (Array.isArray(value)) return value.map(redactValue);
	if (value && typeof value === 'object') {
		return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, redactValue(child)]));
	}
	return value;
}

export function sanitizePagePath(raw: string | null | undefined, baseURL = '/'): string | null {
	if (!raw) return null;
	const cleaned = removeControlChars(raw.trim()).toLowerCase();
	const base = baseURL.replace(/\/$/, '');
	const stripped = base && cleaned.startsWith(base) ? cleaned.slice(base.length) || '/' : cleaned;
	if (stripped === '/' || stripped === '') return null;
	if (stripped.length > 128) return null;
	if (!PAGE_PATH_PATTERN.test(stripped)) return null;
	return stripped.startsWith('/') ? stripped : `/${stripped}`;
}

export function sanitizePrefs<T extends Record<string, unknown>>(prefs: T | null): Partial<T> | null {
	if (!prefs) return null;
	const out: Partial<T> = {};
	for (const [key, value] of Object.entries(prefs)) {
		if (typeof value === 'string') {
			const cleaned = removeControlChars(value.trim());
			if (PREF_PATTERN.test(cleaned)) (out as Record<string, unknown>)[key] = cleaned;
		}
	}
	return Object.keys(out).length > 0 ? out : null;
}

export function boundRawMessages(messages: unknown): { messages?: unknown; error?: string } {
	if (!Array.isArray(messages)) return { error: 'Invalid messages' };
	if (messages.length > MAX_REQUEST_MESSAGES) return { error: 'Start a new chat to continue.' };

	let totalChars = 0;
	const bounded = messages.map((message) => {
		if (!message || typeof message !== 'object') return message;
		const clone = { ...(message as Record<string, unknown>) };
		const parts = Array.isArray(clone.parts)
			? clone.parts.map((part) => {
					if (!part || typeof part !== 'object') return part;
					const next = { ...(part as Record<string, unknown>) };
					if (next.type === 'text' && typeof next.text === 'string') {
						const text = next.text.length > MAX_MESSAGE_CHARS ? next.text.slice(0, MAX_MESSAGE_CHARS) : next.text;
						next.text = text;
						totalChars += text.length;
					}
					return next;
				})
			: clone.parts;
		clone.parts = parts;
		return clone;
	});

	if (totalChars > MAX_TOTAL_INPUT_CHARS) return { error: 'Message is too long. Start a new chat or shorten your request.' };

	return { messages: bounded };
}
