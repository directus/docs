import type { ContentNavigationItem } from '@nuxt/content';

export default function findNavNode(
	items: ContentNavigationItem[] | undefined,
	target: string,
): ContentNavigationItem | undefined {
	if (!items) return undefined;
	for (const item of items) {
		if (item.path === target) return item;
		const child = findNavNode(item.children, target);
		if (child) return child;
	}
	return undefined;
}
