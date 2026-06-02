import { addComponent, addImports, addServerHandler, addServerPlugin, createResolver, defineNuxtModule, logger } from '@nuxt/kit';
import { defu } from 'defu';

export interface AssistantModuleOptions {
	/** API endpoint path. Default '/__ai__/chat'. */
	apiPath?: string;
	/** OpenRouter model id. */
	model?: string;
	/** PostHog survey id used for thumbs up/down feedback on assistant responses. */
	feedbackSurveyId?: string;
}

const log = logger.withTag('assistant');

const defaults: Required<AssistantModuleOptions> = {
	apiPath: '/__ai__/chat',
	model: 'google/gemini-3.1-flash-lite',
	feedbackSurveyId: '',
};

export function isAssistantEnabled(apiKey: string | undefined): boolean {
	return process.env.ASSISTANT_ENABLED !== 'false' && Boolean(apiKey);
}

export default defineNuxtModule<AssistantModuleOptions>({
	meta: { name: 'assistant' },
	setup(_options, nuxt) {
		const options = defu(nuxt.options.assistant as AssistantModuleOptions | undefined, defaults) as Required<AssistantModuleOptions>;
		const apiKey = process.env.OPENROUTER_API_KEY;
		const model = process.env.AI_MODEL || options.model;
		const feedbackSurveyId = process.env.ASSISTANT_FEEDBACK_SURVEY_ID || options.feedbackSurveyId;
		const enabled = isAssistantEnabled(apiKey);

		const { resolve } = createResolver(import.meta.url);

		nuxt.options.runtimeConfig.public.assistant = defu(
			nuxt.options.runtimeConfig.public.assistant,
			{ enabled, apiPath: options.apiPath, model, feedbackSurveyId },
		);

		addImports([
			{ name: 'useAssistant', from: resolve('./runtime/composables/useAssistant') },
			{ name: 'useAssistantHistory', from: resolve('./runtime/composables/useAssistantHistory') },
		]);

		const components = ['AssistantChat', 'AssistantChatBody', 'AssistantFloatingInput', 'AssistantLoading', 'AssistantMessageFeedback', 'AssistantPreStream', 'AssistantSlashes'];
		for (const name of components) {
			addComponent({ name, filePath: resolve(`./runtime/components/${name}.vue`) });
		}

		if (!enabled) {
			log.warn(process.env.ASSISTANT_ENABLED === 'false' ? 'AI assistant disabled: ASSISTANT_ENABLED=false' : 'AI assistant disabled: OPENROUTER_API_KEY not set');
			return;
		}

		nuxt.options.runtimeConfig.assistant = defu(
			nuxt.options.runtimeConfig.assistant,
			{ openrouterApiKey: apiKey, model },
		);

		addServerPlugin(resolve('./runtime/server/plugins/posthog-otel'));

		const route = options.apiPath.startsWith('/') ? options.apiPath : `/${options.apiPath}`;
		addServerHandler({
			route,
			method: 'post',
			handler: resolve('./runtime/server/api/chat.post'),
		});

		if (nuxt.options.dev && process.env.NODE_ENV !== 'production') {
			addServerHandler({
				route: '/api/__test__/assistant-status',
				method: 'get',
				handler: resolve('./runtime/server/api/__test__/assistant-status.get'),
			});
			addServerHandler({
				route: '/api/__test__/reset-limits',
				method: 'post',
				handler: resolve('./runtime/server/api/__test__/reset-limits.post'),
			});
		}
	},
});

declare module 'nuxt/schema' {
	interface PublicRuntimeConfig {
		assistant: {
			enabled: boolean;
			apiPath: string;
			model: string;
			feedbackSurveyId: string;
		};
	}
	interface RuntimeConfig {
		assistant: {
			openrouterApiKey: string;
			model: string;
		};
	}
}
