import type { OpenAPIObject, ReferenceObject, SchemaObject } from 'openapi3-ts/oas30';
import type { FlattenedParam } from '~/types';

export default function (openapi: OpenAPIObject, schema: SchemaObject | ReferenceObject): FlattenedParam | null {
	const parseLevel = (schemaOrRef: SchemaObject | ReferenceObject, name?: string): FlattenedParam | null => {
		const schema = '$ref' in schemaOrRef ? resolveOasRef<SchemaObject>(openapi, schemaOrRef.$ref) : schemaOrRef;
		if (!schema) return null;

		const type = Array.isArray(schema.type) ? schema.type.join(' | ') : schema.type;
		const node: FlattenedParam = { name: name, type, description: schema.description };

		if ('anyOf' in schema && schema.anyOf) {
			node.anyOf = schema.anyOf
				.map(child => parseLevel(child))
				.filter((child): child is FlattenedParam => child !== null);

			return node;
		}

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

	return parseLevel(schema);
}
