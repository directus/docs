import { queryCollection } from '@nuxt/content/server';
import { getCookie, getHeader, type H3Event } from 'h3';
import type { UIMessage } from 'ai';
import type { LimitProfile } from './profiles';
import { sanitizePagePath, sanitizePrefs } from './sanitize';

const PREFS_COOKIE = 'directus-docs-prefs';

const PREF_KEYS: Array<keyof UserPreferences> = ['framework', 'useCase', 'deployment', 'role', 'experience'];
const PREF_LABELS: Record<keyof UserPreferences, string> = {
	framework: 'Preferred framework',
	useCase: 'Primary use case',
	deployment: 'Deployment target',
	role: 'Role',
	experience: 'Directus experience level',
};

export type UserPreferences = {
	framework: string | null;
	useCase: string | null;
	deployment: string | null;
	role: string | null;
	experience: string | null;
};

// Everything an assistant request says about *what* it is asking, derived from
// headers, cookies and the message body. The admission context covers *who* is
// asking; this covers the prompt-shaping side.
export type RequestContext = {
	pagePath: string | null;
	prefs: Partial<UserPreferences> | null;
	sessionId: string | undefined;
	framework: string;
	systemPrompt: string;
	messages: UIMessage[];
};

function readUserPrefs(event: H3Event): Partial<UserPreferences> | null {
	const cookie = getCookie(event, PREFS_COOKIE);
	if (!cookie) return null;
	try {
		const parsed = JSON.parse(decodeURIComponent(cookie));
		return sanitizePrefs(parsed);
	}
	catch {
		return null;
	}
}

async function readPagePath(event: H3Event, baseURL: string, requestId: string): Promise<string | null> {
	const pagePath = sanitizePagePath(getHeader(event, 'x-page-path'), baseURL);
	if (!pagePath) return null;
	const page = await queryCollection(event, 'content')
		.where('path', '=', pagePath)
		.first();
	if (!page) {
		console.warn('[assistant] rejected unknown page path', { requestId, pagePath });
		return null;
	}
	return pagePath;
}

function readSessionId(event: H3Event): string | undefined {
	const value = getHeader(event, 'x-assistant-session-id');
	if (!value) return undefined;
	return /^[a-zA-Z0-9_-]{1,80}$/.test(value) ? value : undefined;
}

function buildSystemPrompt(basePrompt: string, pagePath: string | null, prefs: Partial<UserPreferences> | null): string {
	const parts: string[] = [];
	if (pagePath) parts.push(`Current page: ${pagePath}`);
	if (prefs) {
		const lines = PREF_KEYS
			.filter(key => typeof prefs[key] === 'string' && prefs[key])
			.map(key => `- ${PREF_LABELS[key]}: ${prefs[key]}`);
		if (lines.length > 0) parts.push(`User context:\n${lines.join('\n')}`);
	}
	parts.push(basePrompt);
	return parts.join('\n\n');
}

function compactMessagesForModel(messages: UIMessage[], messageLimit: number): UIMessage[] {
	return messages
		.slice(-messageLimit)
		.map((message) => {
			return {
				...message,
				parts: message.parts?.filter((part: { type: string }) => part.type === 'text') ?? [],
			} as UIMessage;
		})
		.filter(message => message.parts.length > 0);
}

export async function buildRequestContext(options: {
	event: H3Event;
	baseURL: string;
	basePrompt: string;
	requestId: string;
	messages: UIMessage[];
	profile: LimitProfile;
}): Promise<RequestContext> {
	const { event, baseURL, basePrompt, requestId, messages, profile } = options;
	const pagePath = await readPagePath(event, baseURL, requestId);
	const prefs = readUserPrefs(event);
	return {
		pagePath,
		prefs,
		sessionId: readSessionId(event),
		framework: prefs?.framework || '',
		systemPrompt: buildSystemPrompt(basePrompt, pagePath, prefs),
		messages: compactMessagesForModel(messages, profile.messageLimit),
	};
}
