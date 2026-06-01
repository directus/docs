import type { OpenAPIObject, ReferenceObject, SchemaObject } from 'openapi3-ts/oas30';
import type { FlattenedParam } from '~/types';

/**
 * Cache flattened results for $ref-rooted schemas. Directus schemas are heavily
 * cross-referential, so the same component schema is flattened many times across
 * operations; caching by ref string avoids re-walking shared subtrees. Keyed per
 * spec via a WeakMap so multiple specs (e.g. in tests) stay isolated.
 */
const caches = new WeakMap<OpenAPIObject, Map<string, FlattenedParam | null>>();

export default function (openapi: OpenAPIObject, schema: SchemaObject | ReferenceObject): FlattenedParam | null {
	let cache = caches.get(openapi);

	if (!cache) {
		cache = new Map();
		caches.set(openapi, cache);
	}

	// Tracks $refs on the current descent path to break self-referential cycles.
	const parseLevel = (schemaOrRef: SchemaObject | ReferenceObject, name?: string, seen: Set<string> = new Set()): FlattenedParam | null => {
		const ref = '$ref' in schemaOrRef ? schemaOrRef.$ref : null;

		if (ref) {
			if (seen.has(ref)) {
				// Circular reference - emit a stub instead of recursing forever.
				return { name, type: 'object', description: undefined };
			}

			if (cache.has(ref)) {
				const cached = cache.get(ref)!;
				return cached ? { ...cached, name } : null;
			}
		}

		const schema = ref ? resolveOasRef<SchemaObject>(openapi, ref) : schemaOrRef as SchemaObject;
		if (!schema) return null;

		const nextSeen = ref ? new Set(seen).add(ref) : seen;

		const type = Array.isArray(schema.type) ? schema.type.join(' | ') : schema.type;
		const node: FlattenedParam = { name: name, type, description: schema.description };

		if ('anyOf' in schema && schema.anyOf) {
			node.anyOf = schema.anyOf
				.map(child => parseLevel(child, undefined, nextSeen))
				.filter((child): child is FlattenedParam => child !== null);
		}
		else if (schema.type === 'object') {
			node.children = Object.entries(schema.properties ?? {})
				.map(([key, value]) => parseLevel(value, key, nextSeen))
				.filter((child): child is FlattenedParam => child !== null);
		}
		else if (schema.type === 'array') {
			const parsedItems = parseLevel(schema.items ?? {}, undefined, nextSeen);

			if (parsedItems) {
				node.children = [parsedItems];
			}
		}

		// Cache the fully-resolved node for this ref (sans the call-specific name)
		// so other operations referencing it reuse the result.
		if (ref) {
			cache.set(ref, { ...node, name: undefined });
		}

		return node;
	};

	return parseLevel(schema);
}
