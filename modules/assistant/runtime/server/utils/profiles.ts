export type AssistantMode = 'normal' | 'degraded';

export type LimitProfile = {
	maxOutputTokens: number;
	maxSteps: number;
	messageLimit: number;
};

export const PROFILES: Record<AssistantMode, LimitProfile> = {
	normal: {
		maxOutputTokens: 4000,
		maxSteps: 12,
		messageLimit: 12,
	},
	degraded: {
		maxOutputTokens: 1500,
		maxSteps: 3,
		messageLimit: 4,
	},
};
