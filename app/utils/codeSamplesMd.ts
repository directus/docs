import type { FlattenedOperationObject } from '~/types';

export interface CodeSample {
	label: string;
	lang: string;
	source: string;
}

/**
 * Convert our @directus/openapi x-codeSamples to valid markdown codeblocks.
 * This allows them to be rendered with MDC
 */
export default function codeSamplesMd(operation: FlattenedOperationObject) {
	let md = '::code-group';

	const { method, path } = operation;

	md += `
\`\`\`http [REST]
${method.toUpperCase()} ${path}
\`\`\`
`;

	const samples = operation['x-codeSamples'] as CodeSample[];

	for (const { lang, source, label } of samples) {
		md += preMd(lang, label, source);
	}

	md += '::';

	return md;
}
