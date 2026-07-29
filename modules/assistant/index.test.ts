import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { isAssistantEnabled } from './runtime/utils/is-assistant-enabled';

let savedEnv: NodeJS.ProcessEnv;

beforeEach(() => {
	savedEnv = { ...process.env };
	delete process.env.ASSISTANT_ENABLED;
});

afterEach(() => {
	process.env = savedEnv;
});

describe('isAssistantEnabled', () => {
	it('requires an API key', () => {
		expect(isAssistantEnabled(undefined)).toBe(false);
		expect(isAssistantEnabled('sk-test')).toBe(true);
	});

	it('honors the kill switch even when an API key exists', () => {
		process.env.ASSISTANT_ENABLED = 'false';
		expect(isAssistantEnabled('sk-test')).toBe(false);
	});
});
