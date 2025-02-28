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

		const match = relativePath.match(/https:\/\/directus\.io\/tv/);
		if (match?.index) {
			url = relativePath.substring(match.index);
		}
		else if (relativePath.startsWith('/docs')) {
			url = item.url;
		}

		console.log(url);

		return {
			...item,
			url,
		};
	});
}
