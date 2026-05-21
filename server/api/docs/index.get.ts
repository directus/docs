import listDocs from '~~/server/mcp/tools/list-docs';
import { checkDocsApiRateLimit } from '~~/server/utils/docs-api-rate-limit';

export default defineEventHandler(async (event) => {
	const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown';
	const limit = checkDocsApiRateLimit(`docs-api:${ip}`);
	if (!limit.ok) {
		setResponseHeader(event, 'Retry-After', String(limit.retryAfter));
		throw createError({ statusCode: 429, message: 'Rate limit exceeded' });
	}

	const query = getQuery(event);
	const input: Record<string, unknown> = {};
	if (typeof query.section === 'string') input.section = query.section;
	if (query.limit) input.limit = Number(query.limit);

	return listDocs.handler(input as never, {} as never);
});
