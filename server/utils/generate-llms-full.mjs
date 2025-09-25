import { createWriteStream } from 'node:fs';
import { promises as fsp } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const TEXT_EXTENSIONS = new Set([
	'.md', '.mdc'
]);

function normalizeNewlines(text) {
	return text.replace(/\r\n?/g, '\n');
}

function stripFrontmatter(text) {
	// Remove leading YAML frontmatter --- ... ---
	if (text.startsWith('---')) {
		const end = text.indexOf('\n---');
		if (end !== -1) return text.slice(end + 4);
	}
	return text;
}

function keepFencedCode(text) {
	// Preserve fenced code blocks by removing fences and keeping content with optional language header
	return text.replace(/```(\w+)?\n([\s\S]*?)```/g, (_m, lang, code) => {
		const langHeader = lang ? `Code (${lang}):\n` : '';
		const body = code.replace(/\s+$/, '');
		return `\n${langHeader}${body}\n`;
	});
}

// Intentionally keep HTML/MDX as-is for readability in plaintext

function replaceImages(text) {
	// ![alt](url) -> alt (image: url)
	return text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '$1 (image: $2)');
}

function replaceLinks(text) {
	// [label](url) -> label (url)
	return text.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '$1 ($2)');
}

function stripMdSyntax(text) {
	let out = text;
	// Remove emphasis/bold/strikethrough markers while keeping content
	out = out.replace(/\*\*(.*?)\*\*/g, '$1');
	out = out.replace(/\*(.*?)\*/g, '$1');
	out = out.replace(/__(.*?)__/g, '$1');
	out = out.replace(/_(.*?)_/g, '$1');
	out = out.replace(/~~(.*?)~~/g, '$1');
	// Remove table formatting pipes and alignment rows
	out = out.replace(/^\s*\|/gm, '');
	out = out.replace(/\|\s*$/gm, '');
	out = out.replace(/^\s*:?[-=]{3,}:?\s*(\|\s*:?[-=]{3,}:?\s*)+$/gm, '');
	return out;
}

function stripFootnotes(text) {
	let out = text;
	// Remove footnote references [^1]
	out = out.replace(/\[\^.+?\]/g, '');
	// Remove footnote definitions
	out = out.replace(/^\[\^.+?\]:.*$/gm, '');
	return out;
}

function stripHeadingsHashes(text) {
	// Keep heading text but allow a single leading '# ' for H1 style
	return text.replace(/^(#{2,})\s+/gm, '');
}

function collapseWhitespace(text) {
	// Trim trailing spaces and collapse multiple blank lines to a single blank line
	let out = text.replace(/[\t ]+$/gm, '');
	out = out.replace(/\n{3,}/g, '\n\n');
	return out.trim() + '\n';
}

function extractTitle(markdown, fallback) {
	const m = markdown.match(/^#\s+(.+)$/m);
	if (m) return m[1].trim();
	return fallback;
}

// (no-op) reserved for future use

function buildSourceUrl(rootBase, relPathNoExt) {
	const pathPart = relPathNoExt.replace(/\\/g, '/');
	return `${rootBase}/${pathPart}`;
}

function sanitizeMarkdown(content) {
	let out = normalizeNewlines(content);
	out = stripFrontmatter(out);
	out = keepFencedCode(out);
	out = replaceImages(out);
	out = replaceLinks(out);
	out = stripMdSyntax(out);
	out = stripFootnotes(out);
	out = stripHeadingsHashes(out);
	out = collapseWhitespace(out);
	return out;
}

async function listFilesRecursively(rootDir) {
	const entries = await fsp.readdir(rootDir, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		// Skip hidden files/folders
		if (entry.name.startsWith('.')) continue;
		const fullPath = path.join(rootDir, entry.name);
		if (entry.isDirectory()) {
			const childFiles = await listFilesRecursively(fullPath);
			files.push(...childFiles);
		}
		else if (entry.isFile()) {
			const ext = path.extname(entry.name).toLowerCase();
			if (TEXT_EXTENSIONS.has(ext)) {
				files.push(fullPath);
			}
		}
	}
	return files;
}

/**
 * Generate a combined text file of all content files for LLM ingestion.
 * @param {{ contentDir?: string, outFile?: string }} opts
 */
export async function generateLlmsFull(opts = {}) {
	const root = process.cwd();
	const contentDir = opts.contentDir || path.join(root, 'content');
	const outFile = opts.outFile || path.join(root, 'public', 'llms-full.txt');

	await fsp.mkdir(path.dirname(outFile), { recursive: true });

	const allFiles = await listFilesRecursively(contentDir);
	// Stable sort ensures deterministic output
	allFiles.sort((a, b) => a.localeCompare(b));

	const rel = (p) => path.relative(contentDir, p).split(path.sep).join('/');
	const relNoExt = (p) => rel(p).replace(/\.[^.]+$/, '');
	const siteBase = process.env.LLMS_FULL_SITE_BASE || 'https://directus.io/docs';

	let bytesWritten = 0;
	let filesCount = 0;

	await new Promise(async (resolve, reject) => {
		const stream = createWriteStream(outFile, { encoding: 'utf8' });
		stream.on('error', reject);
		stream.on('finish', resolve);

		for (const filePath of allFiles) {
			try {
				const raw = await fsp.readFile(filePath, 'utf8');
				const title = extractTitle(raw, path.basename(filePath, path.extname(filePath)));
				const sourceUrl = buildSourceUrl(siteBase, relNoExt(filePath));
				const clean = sanitizeMarkdown(raw);

				const doc = `# ${title}\nSource: ${sourceUrl}\n\n${clean}\n`;
				bytesWritten += Buffer.byteLength(doc);
				if (!stream.write(doc)) await new Promise((r) => stream.once('drain', r));

				filesCount += 1;
			}
			catch (err) {
				// Skip unreadable files but continue processing others
				// eslint-disable-next-line no-console
				console.warn(`[llms-full] Skipping file due to error: ${filePath}`, err?.message || err);
			}
		}

		stream.end();
	});

	return {
		filesCount,
		bytesWritten,
		outFile,
		generatedAt: new Date().toISOString(),
	};
}

export default generateLlmsFull;

// Allow running directly: `node server/utils/generate-llms-full.mjs`
try {
    const argPath = process.argv?.[1] ? path.resolve(process.argv[1]) : '';
    const argUrl = argPath ? pathToFileURL(argPath).href : '';
    const isCli = argUrl === import.meta.url;
    if (isCli) {
        generateLlmsFull()
            .then((res) => {
                // eslint-disable-next-line no-console
                console.log(`[llms-full] Generated ${res.filesCount} files, ${res.bytesWritten} bytes → ${res.outFile}`);
                process.exit(0);
            })
            .catch((err) => {
                // eslint-disable-next-line no-console
                console.error('[llms-full] Generation failed:', err);
                process.exit(1);
            });
    }
}
catch (e) {
    // eslint-disable-next-line no-console
    console.error('[llms-full] CLI detection failed:', e);
}


