import getDoc from '~~/server/mcp/tools/get-doc';
import { enforceDocsApiLimit } from '~~/server/utils/docs-api-limit';

export default defineEventHandler(async (event) => {
	await enforceDocsApiLimit(event);

	const query = getQuery(event);
	if (typeof query.path !== 'string' || !query.path) {
		throw createError({ statusCode: 400, message: 'path query parameter is required' });
	}

	return getDoc.handler({ path: query.path } as never, {} as never);
});
