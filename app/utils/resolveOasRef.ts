import { get } from 'lodash-es';
import type { OpenAPIObject } from 'openapi3-ts/oas30';

/**
 * Resolved $ref values are stable for a given spec, so cache them by ref string
 * to avoid repeatedly walking the spec object. Keyed per spec via a WeakMap so
 * the cache stays correct if more than one spec is used (e.g. in tests) and is
 * released when a spec is garbage collected.
 */
const caches = new WeakMap<OpenAPIObject, Map<string, unknown>>();

/**
 * Resolve a $ref path from the OpenAPI spec object
 *
 * @note This does not support relative refs
 */
export default function<O = unknown>(spec: OpenAPIObject, path: string): O | null {
	let cache = caches.get(spec);

	if (!cache) {
		cache = new Map();
		caches.set(spec, cache);
	}

	if (cache.has(path)) {
		return cache.get(path) as O | null;
	}

	const pathParts = path.split('/').slice(1);
	const resolved = get(spec, pathParts, null) as O | null;
	cache.set(path, resolved);
	return resolved;
}
