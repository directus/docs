import { defineEventHandler, createError, getHeader } from 'h3';
import { resetAssistantLimits } from '../../utils/rate-limit';
import { isDevContext } from '../../utils/is-dev-context';

export default defineEventHandler(async (event) => {
	if (!import.meta.dev || process.env.NODE_ENV === 'production' || !isDevContext(event)) {
		throw createError({ statusCode: 404, message: 'Not found' });
	}

	const expected = process.env.ASSISTANT_RESET_TOKEN;
	if (expected) {
		const provided = getHeader(event, 'x-reset-token');
		if (provided !== expected) {
			throw createError({ statusCode: 403, message: 'Forbidden' });
		}
	}

	const cleared = await resetAssistantLimits();
	return { ok: true, cleared };
});
