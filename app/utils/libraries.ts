export interface LibraryOption {
	value: string;
	label: string;
	icon: string;
	matchLabels: string[];
}

export const libraries: LibraryOption[] = [
	{ value: '0', label: 'SDK', icon: 'simple-icons:directus', matchLabels: ['Directus SDK', 'SDK'] },
	{ value: '1', label: 'REST', icon: 'i-lucide-globe', matchLabels: ['REST'] },
	{ value: '2', label: 'GraphQL', icon: 'simple-icons:graphql', matchLabels: ['GraphQL'] },
];

export const sampleVariants: LibraryOption[] = [
	{ value: 'fetch', label: 'Fetch', icon: 'simple-icons:javascript', matchLabels: ['Fetch', 'JavaScript fetch', 'fetch'] },
	{ value: 'curl', label: 'cURL', icon: 'simple-icons:curl', matchLabels: ['cURL', 'curl'] },
];

export const allSampleOptions: LibraryOption[] = [...libraries, ...sampleVariants];

export const getSampleOptionByLabel = (label: string): LibraryOption | undefined =>
	allSampleOptions.find(l => l.matchLabels.includes(label));

export const getLibraryByLabel = (label: string): LibraryOption | undefined =>
	libraries.find(l => l.matchLabels.includes(label));

export const getLibraryByValue = (value: string): LibraryOption | undefined =>
	libraries.find(l => l.value === value);
