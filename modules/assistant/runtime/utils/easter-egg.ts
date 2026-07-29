import type { UIMessage } from 'ai';

const VIDEO_ID = 'pwLn_His9Yw';
export const EASTER_EGG_RESPONSE_DELAY_MS = 1200;

export function isEasterEggPrompt(text: string): boolean {
	const normalized = text.toLowerCase().replace(/['’]/g, '').replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
	return /\bwh?ats? up docs?\b/.test(normalized);
}

export function buildEasterEggMessages(userText: string): { user: UIMessage; assistant: UIMessage; response: UIMessage['parts'] } {
	const now = Date.now();
	return {
		user: {
			id: `easter-user-${now}`,
			role: 'user',
			parts: [{ type: 'text', text: userText }],
		} as unknown as UIMessage,
		assistant: {
			id: `easter-assistant-${now}`,
			role: 'assistant',
			parts: [],
		} as unknown as UIMessage,
		response: [{ type: 'text', text: `Eh, what's up, doc?\n\n:video-embed{youtube-id="${VIDEO_ID}"}` }] as UIMessage['parts'],
	};
}
