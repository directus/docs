import type {
	OpenAPIObject,
	OperationObject,
} from 'openapi3-ts/oas30';
import type { NavigationLink, NavigationTree } from '#ui-pro/types';
import { methods } from '@/constants';

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
						to: `/api/${tag.toLowerCase()}#${method}${path}`,
						// badge: method,
						exact: true,
						exactHash: true,
					});
				}
			}
		}
	}

	return Object.entries(byTag).map(([tag, links]) => {
		return {
			label: tag,
			to: `/api/${tag.toLowerCase()}`,
			children: links,
		};
	});
}
