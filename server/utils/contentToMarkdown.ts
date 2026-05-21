const MAX_PARTIAL_DEPTH = 5;

const PARTIAL_INLINE = /:partial\{[^}]*content="([^"]+)"[^}]*\}/g;
const VIDEO_EMBED = /:video-embed\{[^}]*video-id="([^"]+)"[^}]*\}/g;
const DOC_CLI_SNIPPET = /:doc-cli-snippet\{[^}]*command="([^"]+)"[^}]*\}/g;
const PRODUCT_LINK = /:product-link\{[^}]*\}/g;
const CTA_CLOUD_LINE = /^[\t ]*:cta-cloud(?:\{[^}]*\})?[\t ]*$/gm;

export function contentToMarkdown(rawbody: string, partials: Map<string, string>): string {
	const inlined = inlinePartials(rawbody, partials, 0);
	const stripped = stripBlockFences(inlined);
	return rewriteInlineDirectives(stripped).trimEnd() + '\n';
}

function inlinePartials(body: string, partials: Map<string, string>, depth: number): string {
	if (depth >= MAX_PARTIAL_DEPTH) return body;

	return body.replace(PARTIAL_INLINE, (_match, name: string) => {
		const partial = partials.get(name);
		if (partial === undefined) {
			return `<!-- partial '${name}' not found -->`;
		}
		return inlinePartials(partial, partials, depth + 1);
	});
}

function stripBlockFences(body: string): string {
	const lines = body.split('\n');
	const out: string[] = [];
	const openFences: number[] = [];
	let inCodeBlock = false;
	let codeFence = '';

	for (const line of lines) {
		const codeMatch = line.match(/^[\t ]*(```+|~~~+)/);
		if (codeMatch) {
			if (!inCodeBlock) {
				inCodeBlock = true;
				codeFence = codeMatch[1];
			}
			else if (line.trim().startsWith(codeFence)) {
				inCodeBlock = false;
				codeFence = '';
			}
			out.push(line);
			continue;
		}

		if (inCodeBlock) {
			out.push(line);
			continue;
		}

		const open = line.match(/^[\t ]*(:{2,})([a-z][a-z0-9-]*)(?:\{[^}]*\})?[\t ]*$/);
		if (open) {
			openFences.push(open[1].length);
			continue;
		}

		const closeMatch = line.match(/^[\t ]*(:{2,})[\t ]*$/);
		if (closeMatch && openFences.length > 0) {
			const closeLen = closeMatch[1].length;
			const lastOpen = openFences[openFences.length - 1];
			if (closeLen === lastOpen) {
				openFences.pop();
				continue;
			}
		}

		out.push(line);
	}

	return out.join('\n');
}

function rewriteInlineDirectives(body: string): string {
	return body
		.replace(VIDEO_EMBED, (_m, id: string) => `[Watch video](https://www.youtube.com/watch?v=${id})`)
		.replace(DOC_CLI_SNIPPET, (_m, cmd: string) => `\n\`\`\`bash\n${cmd}\n\`\`\`\n`)
		.replace(CTA_CLOUD_LINE, '')
		.replace(PRODUCT_LINK, '');
}
