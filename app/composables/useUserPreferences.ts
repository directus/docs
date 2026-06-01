import { getFramework } from '#shared/utils/frameworks';
import { getUseCase } from '~/utils/useCases';
import { getDeployment } from '~/utils/deployments';
import { getRole } from '~/utils/roles';
import { getExperience } from '~/utils/experience';
import {
	API_CONSUMER_LS_KEY,
	LEGACY_FRAMEWORK_COOKIE,
	PREFS_COOKIE,
	defaultPrefs,
	type OnboardingState,
	type UserPreferences,
} from '~/utils/userPreferences';

type PreferenceKey = Exclude<keyof UserPreferences, 'onboarding'>;

const validators: { [K in PreferenceKey]: (v: string) => UserPreferences[K] | null } = {
	framework: v => getFramework(v)?.slug ?? null,
	useCase: v => getUseCase(v)?.slug ?? null,
	deployment: v => getDeployment(v)?.slug ?? null,
	role: v => getRole(v)?.slug ?? null,
	experience: v => getExperience(v)?.slug ?? null,
};

export default function useUserPreferences() {
	const cookie = useCookie<UserPreferences>(PREFS_COOKIE, {
		default: () => ({ ...defaultPrefs }),
		maxAge: 60 * 60 * 24 * 30,
		sameSite: 'lax',
		path: '/',
	});

	const legacyFramework = useCookie<string | null>(LEGACY_FRAMEWORK_COOKIE);
	if (!cookie.value.framework && legacyFramework.value) {
		const valid = getFramework(legacyFramework.value);
		if (valid) cookie.value = { ...cookie.value, framework: valid.slug };
	}

	const prefs = computed<UserPreferences>(() => ({ ...defaultPrefs, ...cookie.value }));

	function set<K extends PreferenceKey>(key: K, value: UserPreferences[K] | null) {
		const validated = value === null ? null : validators[key](value as string);
		cookie.value = { ...prefs.value, [key]: validated };
	}

	const library = useState<string | null>(API_CONSUMER_LS_KEY, () => null);

	function reset() {
		cookie.value = { ...defaultPrefs };
		library.value = null;
		if (import.meta.client) {
			try { localStorage.removeItem(API_CONSUMER_LS_KEY); }
			catch { /* ignore */ }
		}
	}

	const framework = computed(() => prefs.value.framework ? getFramework(prefs.value.framework) ?? null : null);
	const useCase = computed(() => prefs.value.useCase ? getUseCase(prefs.value.useCase) ?? null : null);
	const deployment = computed(() => prefs.value.deployment ? getDeployment(prefs.value.deployment) ?? null : null);
	const role = computed(() => prefs.value.role ? getRole(prefs.value.role) ?? null : null);
	const experience = computed(() => prefs.value.experience ? getExperience(prefs.value.experience) ?? null : null);

	const hasAnyPref = computed(() => Boolean(
		prefs.value.framework
		|| prefs.value.useCase
		|| prefs.value.deployment
		|| prefs.value.role
		|| prefs.value.experience,
	));

	const onboardingState = computed<OnboardingState>(() => {
		const v = prefs.value.onboarding;
		if (v) return v;
		return hasAnyPref.value ? 'onboarded' : 'idle';
	});

	function setOnboarding(state: OnboardingState) {
		cookie.value = { ...prefs.value, onboarding: state };
	}
	function startOnboarding() {
		setOnboarding('active');
	}
	function completeOnboarding() {
		setOnboarding('onboarded');
	}
	function dismissOnboarding() {
		setOnboarding('dismissed');
	}

	function touchCookie() {
		cookie.value = { ...prefs.value };
	}

	if (import.meta.client && library.value === null) {
		try { library.value = localStorage.getItem(API_CONSUMER_LS_KEY); }
		catch { /* ignore */ }
	}
	function setLibrary(value: string | null) {
		library.value = value;
		if (import.meta.client) {
			try {
				if (value === null) localStorage.removeItem(API_CONSUMER_LS_KEY);
				else localStorage.setItem(API_CONSUMER_LS_KEY, value);
			}
			catch { /* ignore */ }
		}
	}

	return {
		prefs,
		framework,
		useCase,
		deployment,
		role,
		experience,
		library,
		hasAnyPref,
		onboardingState,
		set,
		setLibrary,
		reset,
		startOnboarding,
		completeOnboarding,
		dismissOnboarding,
		touchCookie,
	};
}
