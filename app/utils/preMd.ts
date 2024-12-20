export default function (lang: string, label: string, source: unknown) {
	return `
\`\`\`${linguistToShiki(lang)} [${label}]
${typeof source === 'string' ? source : JSON.stringify(source, null, 2)}
\`\`\`
`;
}
