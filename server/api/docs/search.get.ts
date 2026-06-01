import searchDocs from '~~/server/mcp/tools/search-docs';
import { checkDocsApiRateLimit } from '~~/server/utils/docs-api-rate-limit';

export default defineEventHandler(async (event) => {
	const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown';
	const limit = checkDocsApiRateLimit(`docs-api:${ip}`);
	if (!limit.ok) {
		setResponseHeader(event, 'Retry-After', limit.retryAfter ?? 60);
		throw createError({ statusCode: 429, message: 'Rate limit exceeded' });
	}

	const query = getQuery(event);
	if (typeof query.q !== 'string' || !query.q) {
		throw createError({ statusCode: 400, message: 'q query parameter is required' });
	}

	const input: Record<string, unknown> = { query: query.q };
	if (typeof query.section === 'string') input.section = query.section;
	if (typeof query.framework === 'string') input.framework = query.framework;
	if (query.limit) input.limit = Number(query.limit);

	return searchDocs.handler(input as never, {} as never);
});
