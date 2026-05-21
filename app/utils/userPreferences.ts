export type Deployment = 'cloud' | 'self-hosted';
export type Role = 'developer' | 'non-developer';
export type Experience = 'new' | 'familiar' | 'experienced';
export type OnboardingState = 'idle' | 'active' | 'onboarded' | 'dismissed';

export interface UserPreferences {
	framework: string | null;
	useCase: string | null;
	deployment: Deployment | null;
	role: Role | null;
	experience: Experience | null;
	onboarding: OnboardingState | null;
}

export const PREFS_COOKIE = 'directus-docs-prefs';
export const LEGACY_FRAMEWORK_COOKIE = 'framework';
export const API_CONSUMER_LS_KEY = 'code-group-api-consumer';

export const defaultPrefs: UserPreferences = {
	framework: null,
	useCase: null,
	deployment: null,
	role: null,
	experience: null,
	onboarding: null,
};

export const RECENTS_LS_KEY = 'directus-docs-recents';
export const FAVORITES_LS_KEY = 'directus-docs-favorites';
export const RECENTS_LIMIT = 20;

export const INSTANCE_URLS_LS_KEY = 'directus-docs-instance-urls';
export const LEGACY_INSTANCE_URL_COOKIE = 'directus-instance-url';
export const INSTANCE_URLS_LIMIT = 5;
