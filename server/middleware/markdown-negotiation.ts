// Redirect `Accept: text/markdown` or curl requests to the static .md sibling
// emitted by modules/content-markdown.ts during build. Pass-through for everything else.

const SKIP_PREFIXES = ['/raw/', '/__', '/api/', '/_nuxt/', '/_ipx/'];

export default defineEventHandler((event) => {
	if (event.method !== 'GET') return;

	const url = getRequestURL(event);
	const baseURL = useRuntimeConfig().app.baseURL.replace(/\/$/, '');
	const stripped = baseURL && url.pathname.startsWith(baseURL)
		? url.pathname.slice(baseURL.length)
		: url.pathname;

	if (stripped.endsWith('.md')) return;
	if (stripped === '/mcp' || stripped.startsWith('/mcp/')) return;
	for (const prefix of SKIP_PREFIXES) {
		if (stripped.startsWith(prefix)) return;
	}

	const accept = getHeader(event, 'accept') || '';
	const ua = getHeader(event, 'user-agent') || '';
	const wantsMarkdown = accept.includes('text/markdown') || /^curl\//i.test(ua);
	if (!wantsMarkdown) return;

	const cleanPath = stripped.replace(/\/$/, '');
	const target = cleanPath === '' ? `${baseURL}/index.md` : `${baseURL}${cleanPath}.md`;
	return sendRedirect(event, target, 302);
});
