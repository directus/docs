// `@directus/sdk` and `@directus/extensions-sdk` live inside the `directus/directus`
// monorepo (under `packages/`), not as separate repos. Use `path:packages/sdk` or
// `path:packages/extensions-sdk` to scope a search-directus-code call to those packages.
export const DIRECTUS_REPOS = {
	directus: 'directus/directus',
	examples: 'directus/examples',
	docs: 'directus/docs',
} as const;

export type DirectusRepoSlug = keyof typeof DIRECTUS_REPOS;

export const DIRECTUS_REPO_SLUGS = Object.keys(DIRECTUS_REPOS) as [DirectusRepoSlug, ...DirectusRepoSlug[]];

export function directusRepoSearchQualifier(repo?: DirectusRepoSlug): string {
	if (repo) return `repo:${DIRECTUS_REPOS[repo]}`;
	return `(${Object.values(DIRECTUS_REPOS).map(full => `repo:${full}`).join(' OR ')})`;
}
