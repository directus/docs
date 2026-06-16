const DEFAULT_TITLE = 'Directus Docs';
const DEFAULT_DESCRIPTION = 'Explore our resources and powerful data engine to build your projects confidently.';
const MAX_OG_PARAM_BYTES = 512;
const textEncoder = new TextEncoder();

interface DocsOgImageInput {
	title?: string;
	description?: string;
	breadcrumb?: string[];
}

function truncateOgParam(value?: string | null) {
	if (!value) return value;
	if (textEncoder.encode(value).byteLength <= MAX_OG_PARAM_BYTES) return value;

	let output = '';

	for (const char of value) {
		if (textEncoder.encode(`${output}${char}...`).byteLength > MAX_OG_PARAM_BYTES) break;
		output += char;
	}

	return `${output}...`;
}

export async function useDocsOgImage(input: DocsOgImageInput = {}) {
	const title = input.title ?? DEFAULT_TITLE;
	const description = input.description ?? DEFAULT_DESCRIPTION;
	const breadcrumb = input.breadcrumb?.filter(Boolean).join(' > ');
	const ogImage = ref<string>();

	useSeoMeta({
		title,
		description,
		ogTitle: title,
		ogDescription: description,
		ogImage: computed(() => ogImage.value),
		twitterCard: 'summary_large_image',
	});

	ogImage.value = await useOgImageUrl({
		template: 'docs',
		params: {
			title: truncateOgParam(title),
			description: truncateOgParam(description),
			breadcrumb: truncateOgParam(breadcrumb),
		},
	});

	return ogImage.value;
}
