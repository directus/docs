import { get } from 'lodash-es';
import type { OpenAPIObject } from 'openapi3-ts/oas30';

/**
 * Resolve a $ref path from the OpenAPI spec object
 *
 * @note This does not support relative refs
 */
export default function<O = unknown>(spec: OpenAPIObject, path: string): O | null {
	const pathParts = path.split('/').slice(1);
	return get(spec, pathParts, null);
}
