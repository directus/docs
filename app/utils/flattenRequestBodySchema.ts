import type { OpenAPIObject, ReferenceObject, SchemaObject } from 'openapi3-ts/oas30';
import type { FlattenedParam } from '~/types';

export default function (openapi: OpenAPIObject, requestBodySchema: SchemaObject | ReferenceObject): FlattenedParam | null {
	const parseLevel = (schemaOrRef: SchemaObject | ReferenceObject, name?: string): FlattenedParam | null => {
		const schema = '$ref' in schemaOrRef ? resolveRef<SchemaObject>(openapi, schemaOrRef.$ref) : schemaOrRef;
		if (!schema) return null;

		const type = Array.isArray(schema.type) ? schema.type.join(' | ') : schema.type;
		const node: FlattenedParam = { name: name, type, description: schema.description };

		if (schema.type === 'object') {
			node.children = Object.entries(schema.properties ?? {})
				.map(([key, value]) => parseLevel(value, key))
				.filter((child): child is FlattenedParam => child !== null);
		}

		if (schema.type === 'array') {
			const parsedItems = parseLevel(schema.items ?? {});

			if (parsedItems) {
				node.children = [parsedItems];
			}
		}

		return node;
	};

	return parseLevel(requestBodySchema);
}
