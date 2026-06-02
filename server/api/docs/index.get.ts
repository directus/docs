import listDocs from '~~/server/mcp/tools/list-docs';
import { enforceDocsApiLimit } from '~~/server/utils/docs-api-limit';

export default defineEventHandler(async (event) => {
	await enforceDocsApiLimit(event);

	const query = getQuery(event);
	const input: Record<string, unknown> = {};
	if (typeof query.pathPrefix === 'string') input.pathPrefix = query.pathPrefix;
	else if (typeof query.section === 'string') input.pathPrefix = query.section;
	if (query.limit) input.limit = Number(query.limit);

	return listDocs.handler(input as never, {} as never);
});
