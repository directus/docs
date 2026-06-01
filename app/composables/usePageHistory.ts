import { FAVORITES_LS_KEY, RECENTS_LIMIT, RECENTS_LS_KEY } from '~/utils/userPreferences';

export interface PageEntry {
	path: string;
	title: string;
	visitedAt?: number;
}

function readLS<T>(key: string, fallback: T): T {
	if (!import.meta.client) return fallback;
	try {
		const raw = localStorage.getItem(key);
		if (!raw) return fallback;
		return JSON.parse(raw) as T;
	}
	catch {
		return fallback;
	}
}

function writeLS(key: string, value: unknown) {
	if (!import.meta.client) return;
	try { localStorage.setItem(key, JSON.stringify(value)); }
	catch { /* ignore quota errors */ }
}

export default function usePageHistory() {
	const recents = useState<PageEntry[]>(RECENTS_LS_KEY, () => []);
	const favorites = useState<PageEntry[]>(FAVORITES_LS_KEY, () => []);

	if (import.meta.client && recents.value.length === 0) {
		recents.value = readLS<PageEntry[]>(RECENTS_LS_KEY, []);
	}
	if (import.meta.client && favorites.value.length === 0) {
		favorites.value = readLS<PageEntry[]>(FAVORITES_LS_KEY, []);
	}

	function recordVisit(entry: PageEntry) {
		if (!entry.path || !entry.title) return;
		const next = [{ ...entry, visitedAt: Date.now() }, ...recents.value.filter(r => r.path !== entry.path)]
			.slice(0, RECENTS_LIMIT);
		recents.value = next;
		writeLS(RECENTS_LS_KEY, next);
	}

	function isFavorite(path: string) {
		return favorites.value.some(f => f.path === path);
	}

	function toggleFavorite(entry: PageEntry) {
		if (!entry.path || !entry.title) return;
		const next = isFavorite(entry.path)
			? favorites.value.filter(f => f.path !== entry.path)
			: [{ path: entry.path, title: entry.title }, ...favorites.value];
		favorites.value = next;
		writeLS(FAVORITES_LS_KEY, next);
	}

	function clearRecents() {
		recents.value = [];
		writeLS(RECENTS_LS_KEY, []);
	}

	function clearFavorites() {
		favorites.value = [];
		writeLS(FAVORITES_LS_KEY, []);
	}

	return { recents, favorites, recordVisit, isFavorite, toggleFavorite, clearRecents, clearFavorites };
}
