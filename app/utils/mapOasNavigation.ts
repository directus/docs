import type {
	OpenAPIObject,
	OperationObject,
	PathItemObject,
} from 'openapi3-ts/oas30';
import type { NavigationLink, NavigationTree } from '#ui-pro/types';

const methods: (keyof PathItemObject)[] = [
	'get',
	'put',
	'post',
	'delete',
	'options',
	'head',
	'patch',
	'trace',
];

export default function (spec: OpenAPIObject): NavigationTree[] {
	const byTag: Record<string, NavigationLink[]> = {};

	for (const [path, pathItemObject] of Object.entries(spec.paths)) {
		for (const method of methods) {
			if (pathItemObject[method]) {
				const operationObject: OperationObject = pathItemObject[method];
				for (const tag of operationObject.tags ?? []) {
					if (!byTag[tag]) {
						byTag[tag] = [];
					}

					byTag[tag].push({
						label: operationObject.summary ?? path,
						badge: method,
						to: `/api/${method}${path}`,
					});
				}
			}
		}
	}

	return Object.entries(byTag).map(([tag, links]) => {
		return {
			label: tag,
			children: links,
		};
	});
}
