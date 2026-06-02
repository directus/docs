export default function useNormalizedPath() {
	const route = useRoute();

	const path = computed(() => route.path.replace(/\/$/, ''));

	return { path };
}
