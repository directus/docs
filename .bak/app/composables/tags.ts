export const useTags = () => {
	const route = useRoute();
	const router = useRouter();

	const selectedTags = computed(() => {
		return route.query.tags && typeof route.query.tags == 'string'
			? route.query.tags.split(',')
			: [];
	});

	const setTags = (tags: string[]) => {
		router.push({
			query: {
				...route.query,
				tags: tags.length > 0 ? tags.join(',') : undefined,
			},
		});
	};

	function toggleTag(tag: string) {
		if (selectedTags.value.includes(tag)) {
			setTags(selectedTags.value.filter(t => t !== tag));
		}
		else {
			setTags([...selectedTags.value, tag]);
		}
	}

	function clearTags() {
		setTags([]);
	}

	return { selectedTags, toggleTag, setTags, clearTags };
};
