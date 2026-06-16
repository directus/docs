import { defineEventHandler, getRequestIP, createError } from 'h3';
import { fingerprintFromEvent } from '../../utils/fingerprint';
import { getAssistantLimitStatus, ipPrefix } from '../../utils/rate-limit';
import { isDevContext } from '../../utils/is-dev-context';

export default defineEventHandler(async (event) => {
	if (!import.meta.dev || process.env.NODE_ENV === 'production' || !isDevContext(event)) {
		throw createError({ statusCode: 404, message: 'Not found' });
	}

	const fp = fingerprintFromEvent(event);
	const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown';
	const status = await getAssistantLimitStatus({
		ip,
		fingerprint: fp.fingerprint,
		fingerprintEntropy: fp.entropy,
		ipPrefix: ipPrefix(ip),
	});

	return {
		ip,
		fingerprint: fp.fingerprint,
		fingerprintEntropy: fp.entropy,
		...status,
	};
});
