export interface ParsedMcpMarkdown {
	title: string;
	description: string;
	content: string;
}

export function normalizeDocPath(path: string): string {
	return path.startsWith('/') ? path : `/${path}`;
}

export function parseMcpMarkdown(markdown: string, path: string): ParsedMcpMarkdown {
	const { frontmatter, body } = splitFrontmatter(markdown);

	return {
		title: frontmatterValue(frontmatter, 'title') || titleFromMarkdown(body) || path,
		description: frontmatterValue(frontmatter, 'description') || '',
		content: body,
	};
}

function splitFrontmatter(markdown: string): { frontmatter: string; body: string } {
	const content = markdown.replace(/^\uFEFF/, '');
	if (!content.startsWith('---\n')) return { frontmatter: '', body: content };

	const end = content.indexOf('\n---', 4);
	if (end === -1) return { frontmatter: '', body: content };

	return {
		frontmatter: content.slice(4, end).trim(),
		body: content.slice(end + 4).replace(/^\n+/, ''),
	};
}

function frontmatterValue(frontmatter: string, key: string): string {
	const match = new RegExp(`^${key}:\\s*(.*)$`, 'm').exec(frontmatter);
	if (!match?.[1]) return '';

	return match[1]
		.trim()
		.replace(/^['"]|['"]$/g, '');
}

function titleFromMarkdown(markdown: string): string {
	const match = /^#\s+(.+)$/m.exec(markdown);
	return match?.[1]?.trim() ?? '';
}
