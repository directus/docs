import searchDocs from '~~/server/mcp/tools/search-docs';
import { enforceDocsApiLimit } from '~~/server/utils/docs-api-limit';

export default defineEventHandler(async (event) => {
	await enforceDocsApiLimit(event);

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
