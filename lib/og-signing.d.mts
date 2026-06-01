export interface CanonicalQueryOptions {
	omitSignature?: boolean;
}

export function encodeComponent(value: unknown): string;

export function canonicalQueryFromEntries(
	entries: Iterable<readonly [string, unknown]>,
	options?: CanonicalQueryOptions,
): string;

export function canonicalPayloadFromEntries(
	template: string,
	version: string,
	entries: Iterable<readonly [string, unknown]>,
	options?: CanonicalQueryOptions,
): string;
