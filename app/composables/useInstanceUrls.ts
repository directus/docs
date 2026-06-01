import {
	INSTANCE_URLS_LIMIT,
	INSTANCE_URLS_LS_KEY,
	LEGACY_INSTANCE_URL_COOKIE,
} from '~/utils/userPreferences';

function readLS(key: string): string[] {
	if (!import.meta.client) return [];
	try {
		const raw = localStorage.getItem(key);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
	}
	catch {
		return [];
	}
}

function writeLS(key: string, value: string[]) {
	if (!import.meta.client) return;
	try { localStorage.setItem(key, JSON.stringify(value)); }
	catch { /* ignore quota */ }
}

function normalize(input: string): string | null {
	const trimmed = input.trim().replace(/\/+$/, '');
	if (!trimmed) return null;
	try {
		const url = new URL(trimmed.match(/^https?:\/\//) ? trimmed : `https://${trimmed}`);
		return url.origin + url.pathname.replace(/\/+$/, '');
	}
	catch {
		return null;
	}
}

export default function useInstanceUrls() {
	const urls = useState<string[]>(INSTANCE_URLS_LS_KEY, () => []);
	const legacyCookie = useCookie<string | null>(LEGACY_INSTANCE_URL_COOKIE);

	if (import.meta.client && urls.value.length === 0) {
		const stored = readLS(INSTANCE_URLS_LS_KEY);
		if (stored.length) {
			urls.value = stored;
		}
		else if (legacyCookie.value) {
			const seeded = normalize(legacyCookie.value);
			if (seeded) {
				urls.value = [seeded];
				writeLS(INSTANCE_URLS_LS_KEY, urls.value);
			}
		}
	}

	const primary = computed<string | null>(() => urls.value[0] ?? null);

	function addUrl(input: string) {
		const url = normalize(input);
		if (!url) return;
		const next = [url, ...urls.value.filter(u => u !== url)].slice(0, INSTANCE_URLS_LIMIT);
		urls.value = next;
		writeLS(INSTANCE_URLS_LS_KEY, next);
		legacyCookie.value = url;
	}

	function removeUrl(url: string) {
		const next = urls.value.filter(u => u !== url);
		urls.value = next;
		writeLS(INSTANCE_URLS_LS_KEY, next);
		if (legacyCookie.value === url) {
			legacyCookie.value = next[0] ?? null;
		}
	}

	function clearUrls() {
		urls.value = [];
		writeLS(INSTANCE_URLS_LS_KEY, []);
		legacyCookie.value = null;
	}

	return { urls, primary, addUrl, removeUrl, clearUrls };
}
