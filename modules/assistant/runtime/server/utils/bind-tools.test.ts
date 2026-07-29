import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { bindMcpToolsForAI, serializeResult, truncateResult } from './bind-tools';

type ExecutableTool = { execute: (args: unknown, extra?: unknown) => Promise<unknown> };

function exec(tool: unknown): ExecutableTool['execute'] {
	return (tool as ExecutableTool).execute;
}

// A tool whose schema accepts a single string `value`, used to drive execute().
function stringTool(name: string, handler: (args: { value: string }) => unknown) {
	return {
		name,
		description: name,
		inputSchema: { value: z.string() },
		handler,
	};
}

describe('truncateResult', () => {
	it('returns the value unchanged when within the byte budget', () => {
		expect(truncateResult('hello', 100)).toBe('hello');
	});

	it('truncates and appends the continuation hint when over budget', () => {
		const out = truncateResult('x'.repeat(200), 50);
		const body = out.split('\n\n[')[0] ?? '';
		expect(out.length).toBeLessThan(200);
		expect(out).toContain('truncated at 50 bytes');
		expect(Buffer.byteLength(body, 'utf8')).toBeLessThanOrEqual(50);
	});

	it('never splits a multi-byte UTF-8 character', () => {
		// '€' is 3 bytes; a naive char-count slice would corrupt it.
		const out = truncateResult('€'.repeat(50), 40);
		const body = out.split('\n\n[')[0] ?? '';
		expect(Buffer.byteLength(body, 'utf8')).toBeLessThanOrEqual(40);
		expect(body.endsWith('€')).toBe(true);
	});

	it('never leaves a lone surrogate when truncating emoji', () => {
		const out = truncateResult('abc😀def', 5);
		const body = out.split('\n\n[')[0] ?? '';
		expect(body).toBe('abc');
		expect(body).not.toContain('\uFFFD');
	});
});

describe('serializeResult', () => {
	it('passes strings through untouched', () => {
		expect(serializeResult('plain')).toBe('plain');
	});

	it('JSON-encodes non-strings', () => {
		expect(serializeResult({ a: 1 })).toBe('{"a":1}');
	});

	it('redacts secrets inside JSON-encoded objects', () => {
		const out = serializeResult({ content: 'token ghp_' + 'a'.repeat(36) });
		expect(out).toContain('[REDACTED_GITHUB_TOKEN]');
		expect(out).not.toContain('ghp_aaaa');
	});
});

describe('bindMcpToolsForAI', () => {
	it('binds tools under their name and exposes an execute fn', () => {
		const bound = bindMcpToolsForAI({ echo: stringTool('echo', a => a.value) });
		expect(bound.echo).toBeDefined();
		expect(typeof exec(bound.echo)).toBe('function');
	});

	it('enforces a cross-tool call budget shared by all tools', async () => {
		const bound = bindMcpToolsForAI(
			{ a: stringTool('a', () => 'ok'), b: stringTool('b', () => 'ok') },
			{ maxCalls: 2 },
		);
		await expect(exec(bound.a)({ value: 'x' })).resolves.toBe('ok');
		await expect(exec(bound.b)({ value: 'x' })).resolves.toBe('ok');
		// Third call across either tool exceeds the shared budget of 2.
		await expect(exec(bound.a)({ value: 'x' })).rejects.toThrow(/call limit exceeded \(2\)/);
	});

	it('rejects arguments that fail the tool schema', async () => {
		const handler = vi.fn(() => 'ok');
		const bound = bindMcpToolsForAI({ a: stringTool('a', handler) });
		await expect(exec(bound.a)({ value: 123 })).rejects.toThrow(/Invalid arguments for a/);
		expect(handler).not.toHaveBeenCalled();
	});

	it('rejects unknown keys via the strict schema', async () => {
		const bound = bindMcpToolsForAI({ a: stringTool('a', () => 'ok') });
		await expect(exec(bound.a)({ value: 'x', extra: 'nope' })).rejects.toThrow(/Invalid arguments/);
	});

	it('redacts secrets in a tool result before returning to the model', async () => {
		const leak = 'ghp_' + 'b'.repeat(36);
		const bound = bindMcpToolsForAI({ a: stringTool('a', () => ({ body: `leaked ${leak}` })) });
		const out = await exec(bound.a)({ value: 'x' });
		expect(out).toContain('[REDACTED_GITHUB_TOKEN]');
		expect(out).not.toContain(leak);
	});

	it('truncates oversized results', async () => {
		const bound = bindMcpToolsForAI(
			{ a: stringTool('a', () => 'y'.repeat(500)) },
			{ maxResultBytes: 50 },
		);
		const out = await exec(bound.a)({ value: 'x' }) as string;
		expect(out).toContain('truncated at 50 bytes');
	});

	it('calls onActivity for each invocation', async () => {
		const onActivity = vi.fn();
		const bound = bindMcpToolsForAI({ a: stringTool('a', () => 'ok') }, { onActivity });
		await exec(bound.a)({ value: 'x' });
		// once before the handler, once after a successful handler.
		expect(onActivity).toHaveBeenCalledTimes(2);
	});

	it('propagates handler errors', async () => {
		const bound = bindMcpToolsForAI({
			a: stringTool('a', () => { throw new Error('boom'); }),
		});
		await expect(exec(bound.a)({ value: 'x' })).rejects.toThrow('boom');
	});
});
