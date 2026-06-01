import type { OpenAPIObject, ReferenceObject, SchemaObject } from 'openapi3-ts/oas30';

export type ExampleObject = Record<string, unknown>;

/**
 * Converts an openapi response definition to an example object
 * @param openapi - Full openapi spec to pull references from
 * @param responseSchema - Response schema to convert to example objects
 *
 * @note this expects the top level responseSchema to be an object or array of things
 */
export default function (openapi: OpenAPIObject, root: SchemaObject): unknown | null {
	if (root.type !== 'object' && !(root.type === 'array' || root.type === 'string')) {
		return null;
	}

	// Tracks $refs on the current descent path to break self-referential cycles.
	const parseLevel = (schemaOrRef: SchemaObject | ReferenceObject, seen: Set<string> = new Set()): unknown => {
		const ref = '$ref' in schemaOrRef ? schemaOrRef.$ref : null;

		if (ref && seen.has(ref)) return undefined;

		const schemaObj = ref ? resolveOasRef<SchemaObject>(openapi, ref) : schemaOrRef as SchemaObject;

		if (!schemaObj) return undefined;

		if ('example' in schemaObj) return schemaObj.example;

		const nextSeen = ref ? new Set(seen).add(ref) : seen;

		if (schemaObj.type === 'object') {
			const obj: ExampleObject = {};

			if (schemaObj.properties) {
				for (const [key, value] of Object.entries(schemaObj.properties)) {
					const parsedVal = parseLevel(value, nextSeen);

					if (parsedVal !== undefined) {
						obj[key] = parsedVal;
					}
				}
			}

			return obj;
		}

		if (schemaObj.type === 'array') {
			if (schemaObj.items) {
				const parsedVal = parseLevel(schemaObj.items, nextSeen);
				if (parsedVal !== undefined) return [parsedVal];
				return [];
			}

			return [];
		}
	};

	const exampleObject: unknown = parseLevel(root);

	if (root.type === 'array') return [exampleObject];
	return exampleObject;
}
