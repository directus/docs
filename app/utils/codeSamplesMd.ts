/**
 * Convert our @directus/openapi x-codeSamples to valid markdown codeblocks.
 * This allows them to be rendered with MDC
 */
export interface CodeSample {
	label: string;
	lang: string;
	source: string;
}

export default function codeSamplesMd(codeSamples: CodeSample[]) {
	let md = '::code-group';

	for (const { lang, source, label } of codeSamples) {
		md += `
\`\`\`${linguistToShiki(lang)} [${label}]
${source}
\`\`\`
`;
	}

	md += '::';

	return md;
}
