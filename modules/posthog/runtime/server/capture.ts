import type { H3Event } from 'h3';
import { PostHog } from 'posthog-node';

let client: PostHog | null | undefined;
let clientKey = '';

export function getServerPostHog(event?: H3Event): PostHog | null {
	const config = useRuntimeConfig(event).public.posthog;
	if (config?.disabled || !config?.publicKey || !config?.host) return null;

	const key = `${config.publicKey}:${config.host}`;
	if (client !== undefined && clientKey === key) return client;

	clientKey = key;
	client = new PostHog(config.publicKey, {
		host: config.host,
		flushAt: 1,
		flushInterval: 0,
	});
	return client;
}

export function captureServerPostHog(event: H3Event | undefined, name: string, distinctId: string, properties: Record<string, unknown>): void {
	const posthog = getServerPostHog(event);
	if (!posthog) return;
	posthog.capture({ distinctId, event: name, properties });
}
