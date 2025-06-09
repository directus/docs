import type {
	OpenAPIObject,
	OperationObject,
} from 'openapi3-ts/oas30';
import type { ContentNavigationItem } from '@nuxt/content';
import { METHODS } from '@/constants';

export default function (spec: OpenAPIObject): ContentNavigationItem[] {
	const byTag: Record<string, ContentNavigationItem[]> = {};

	for (const [path, pathItemObject] of Object.entries(spec.paths)) {
		for (const method of METHODS) {
			if (pathItemObject[method]) {
				const operationObject: OperationObject = pathItemObject[method];

				for (const tag of operationObject.tags ?? []) {
					if (!byTag[tag]) {
						byTag[tag] = [];
					}

					byTag[tag].push({
						title: operationObject.summary ?? path,
						path: `/api/${tag.toLowerCase()}#${slugify(operationObject.summary!)}`,
						exact: true,
						exactHash: true,
					});
				}
			}
		}
	}

	return Object.entries(byTag).map(([tag, links]) => {
		return {
			title: tag,
			to: `/api/${tag.toLowerCase()}`,
			path: `/api/${tag.toLowerCase()}`,
			children: links,
		};
	});
}
