import preMd from '~/utils/preMd';
import type { ApiReferenceCodeSample } from '~/types';

/**
 * Convert our @directus/openapi x-codeSamples to valid markdown codeblocks.
 * This allows them to be rendered with MDC
 */
export default function codeSamplesMd(operation: { method: string; path: string; 'x-codeSamples'?: ApiReferenceCodeSample[] }) {
	let md = '::code-group{sync="api-consumer"}';

	const { method, path } = operation;

	md += `
\`\`\`http [REST]
${method.toUpperCase()} ${path}
\`\`\`
`;

	const samples = operation['x-codeSamples'] ?? [];

	for (const { lang, source, label } of samples) {
		md += preMd(lang, label, source);
	}

	md += '::';

	return md;
}
