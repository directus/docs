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
	if (root.type !== 'object' && root.type !== 'array') {
		return null;
	}

	// function parseLevel(schema: SchemaObject | ReferenceObject, parent: ExampleObject = exampleObject) {
	// 	if ('$ref' in schema) {
	// 		const unrefSchema = resolveRef<SchemaObject>(openapi, schema.$ref);

	// 		if (unrefSchema) {
	// 			parseLevel(unrefSchema, parent);
	// 		}

	// 		return;
	// 	}

	// 	if (schema.type === 'object' && schema.properties) {
	// 		for (const [key, value] of Object.entries(schema.properties)) {
	// 			if ('$ref' in value || value.type === 'object') {
	// 				parent[key] = {};
	// 				parseLevel(value, parent[key] as ExampleObject);
	// 			}

	// 			else {
	// 				parent[key] = value.example ?? null;
	// 			}
	// 		}
	// 	}
	// }

	const parseLevel = (schemaOrRef: SchemaObject | ReferenceObject): unknown => {
		const schemaObj = '$ref' in schemaOrRef ? resolveRef<SchemaObject>(openapi, schemaOrRef.$ref) : schemaOrRef;

		if (!schemaObj) return undefined;

		if ('example' in schemaObj) return schemaObj.example;

		if (schemaObj.type === 'object') {
			const obj: ExampleObject = {};

			if (schemaObj.properties) {
				for (const [key, value] of Object.entries(schemaObj.properties)) {
					const parsedVal = parseLevel(value);

					if (parsedVal !== undefined) {
						obj[key] = parsedVal;
					}
				}
			}

			return obj;
		}

		if (schemaObj.type === 'array') {
			if (schemaObj.items) {
				const parsedVal = parseLevel(schemaObj.items);
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
