import type { Context } from '@opentelemetry/api';
import type { NodeSDK } from '@opentelemetry/sdk-node';
import type { ReadableSpan, Span, SpanProcessor } from '@opentelemetry/sdk-trace-base';
import { assistantRateLimitStore } from '../utils/rate-limit';
import { redactValue } from '../utils/sanitize';

declare global {
	// eslint-disable-next-line no-var
	var __directusAssistantOtel: NodeSDK | undefined;
	// eslint-disable-next-line no-var
	var __directusAssistantOtelProcessor: SpanProcessor | undefined;
}

function isAiSpan(span: ReadableSpan): boolean {
	if (/^(gen_ai\.|llm\.|ai\.|traceloop\.)/.test(span.name)) return true;
	return Object.keys(span.attributes).some(key => /^(gen_ai\.|llm\.|ai\.|traceloop\.)/.test(key));
}

class RedactingSpanProcessor implements SpanProcessor {
	constructor(private inner: SpanProcessor) {}

	onStart(span: Span, parentContext: Context): void {
		this.inner.onStart(span, parentContext);
	}

	onEnd(span: ReadableSpan): void {
		if (process.env.POSTHOG_AI_DEBUG === 'true') {
			console.log('[assistant:otel] span', {
				name: span.name,
				ai: isAiSpan(span),
				attributes: Object.keys(span.attributes).filter(key => /^(gen_ai\.|llm\.|ai\.|traceloop\.)/.test(key)),
			});
		}

		const mutable = span as unknown as { attributes?: Record<string, unknown>; events?: Array<{ attributes?: Record<string, unknown> }> };
		if (mutable.attributes) mutable.attributes = redactValue(mutable.attributes) as Record<string, unknown>;
		if (mutable.events) {
			mutable.events = mutable.events.map(event => ({
				...event,
				attributes: event.attributes ? redactValue(event.attributes) as Record<string, unknown> : event.attributes,
			}));
		}
		this.inner.onEnd(span);
	}

	shutdown(): Promise<void> {
		return this.inner.shutdown();
	}

	forceFlush(): Promise<void> {
		return this.inner.forceFlush();
	}
}

export default defineNitroPlugin(async () => {
	const config = useRuntimeConfig();
	const assistantEnabled = process.env.ASSISTANT_ENABLED !== 'false' && Boolean(config.assistant?.openrouterApiKey);
	const posthogAiHost = process.env.POSTHOG_AI_HOST || config.public.posthog?.host;
	const posthogEnabled = !config.public.posthog?.disabled && Boolean(config.public.posthog?.publicKey && posthogAiHost);

	const redisReachable = Boolean((process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL) && (process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN));
	console.log(`[assistant] enabled=${assistantEnabled} model=${config.assistant?.model || 'unset'} store=${assistantRateLimitStore()} redis_reachable=${redisReachable} posthog=${posthogEnabled ? 'ok' : 'disabled'} posthog_ai_host=${posthogAiHost || 'unset'}`);

	if (!assistantEnabled || !posthogEnabled || globalThis.__directusAssistantOtel) return;

	try {
		const [{ NodeSDK }, { resourceFromAttributes }, { PostHogSpanProcessor }, { trace }] = await Promise.all([
			import('@opentelemetry/sdk-node'),
			import('@opentelemetry/resources'),
			import('@posthog/ai/otel'),
			import('@opentelemetry/api'),
		]);

		const processor = new RedactingSpanProcessor(new PostHogSpanProcessor({
			apiKey: config.public.posthog.publicKey,
			host: posthogAiHost,
		}));
		globalThis.__directusAssistantOtelProcessor = processor;

		globalThis.__directusAssistantOtel = new NodeSDK({
			resource: resourceFromAttributes({
				'service.name': 'directus-docs-assistant',
			}),
			spanProcessors: [processor],
		});
		globalThis.__directusAssistantOtel.start();

		if (process.env.POSTHOG_AI_SELF_TEST === 'true') {
			const span = trace.getTracer('directus-docs-assistant').startSpan('gen_ai.self_test', {
				attributes: {
					'gen_ai.system': 'directus-docs',
					'gen_ai.request.model': 'self-test',
					'ai.telemetry.functionId': 'posthog-ai-self-test',
				},
			});
			span.end();
			await processor.forceFlush();
			console.log('[assistant:otel] self-test flushed');
		}
	}
	catch (error) {
		globalThis.__directusAssistantOtel = undefined;
		globalThis.__directusAssistantOtelProcessor = undefined;
		console.warn('[assistant] failed to start PostHog OTel', error);
	}
});
