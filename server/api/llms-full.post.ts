import path from 'node:path';
import { generateLlmsFull } from '../utils/generate-llms-full.mjs';

function isEnabled() {
	const v = (process.env.LLMS_FULL_ENABLE || '').toLowerCase();
	return v === '1' || v === 'true' || v === 'yes';
}

export default defineEventHandler(async (event) => {
	if (!isEnabled()) {
		throw createError({ statusCode: 403, statusMessage: 'LLMS generation disabled' });
	}

	const token = getHeader(event, 'x-llms-token') || getQuery(event).token;
	const expected = process.env.LLMS_FULL_TOKEN;
	if (expected && token !== expected) {
		throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
	}

	const result = await generateLlmsFull({
		contentDir: path.join(process.cwd(), 'content'),
		outFile: path.join(process.cwd(), 'public', 'llms-full.txt'),
	});
	return result;
});


