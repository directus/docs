import { withoutTrailingSlash } from "ufo";

function getRelativePath(absoluteUrl: string) {
	const { pathname, hash } = new URL(absoluteUrl);
	const url = window.location.origin;
	const relativeUrl = pathname.replace(url, '/') + hash;
	return withoutTrailingSlash(relativeUrl);
}

/**
 * Transform Algolia search items to ensure off-site links aren't rendered as relative links
 */
export default function (items: (unknown & { url: string })[]) {
	return items.map((item) => {
		const relativePath = getRelativePath(item.url);

		let url = relativePath;

		if (item.url.startsWith('https://directus.io/tv')) {
			url = item.url;
		}
		else if (relativePath.startsWith('/docs')) {
			url = item.url;
		}

		console.log('Starts with?', item.url.startsWith('https://directus.io/tv'));
		console.log('item.url', item.url);
		console.log('relativePath', relativePath);
		console.log('url', url);
		console.log('item', item);

		return {
			...item,
			url,
		};
	});
}
