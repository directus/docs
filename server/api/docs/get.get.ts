import getDoc from '~~/server/mcp/tools/get-doc';
import { checkDocsApiRateLimit } from '~~/server/utils/docs-api-rate-limit';

export default defineEventHandler(async (event) => {
	const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown';
	const limit = checkDocsApiRateLimit(`docs-api:${ip}`);
	if (!limit.ok) {
		setResponseHeader(event, 'Retry-After', limit.retryAfter ?? 60);
		throw createError({ statusCode: 429, message: 'Rate limit exceeded' });
	}

	const query = getQuery(event);
	if (typeof query.path !== 'string' || !query.path) {
		throw createError({ statusCode: 400, message: 'path query parameter is required' });
	}

	return getDoc.handler({ path: query.path } as never, {} as never);
});
