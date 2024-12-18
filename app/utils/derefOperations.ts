import type { OpenAPIObject, OperationObject, ParameterObject } from 'openapi3-ts/oas30';

/**
 * Deref $ref properties in OAS paths
 *
 * @param spec - Full OAS spec
 * @param operations - Operations to deref
 */

export default function<O extends OperationObject>(spec: OpenAPIObject, operations: O[]): (O & { parameters: ParameterObject[] })[] {
	return operations.map((operation) => {
		return {
			...operation,
			parameters: operation.parameters?.map((part) => {
				if ('$ref' in part) {
					return resolveRef<ParameterObject>(spec, part.$ref);
				}

				return part;
			}).filter(part => part !== null) ?? [],
		};
	});
}
