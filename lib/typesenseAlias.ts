import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import process from 'node:process';

export function slugifyBranch(branch: string) {
	const slug = branch
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		|| 'unknown';

	const MAX = 60;
	if (slug.length <= MAX) return slug;

	const hash = createHash('sha1').update(branch).digest('hex').slice(0, 6);
	return `${slug.slice(0, MAX - 7)}-${hash}`;
}

export function getLocalGitBranch(): string | null {
	try {
		const branch = execSync('git rev-parse --abbrev-ref HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
			.toString()
			.trim();
		if (!branch || branch === 'HEAD') return null;
		return branch;
	}
	catch {
		return null;
	}
}

export function getTypesenseBranchName() {
	return process.env.GITHUB_HEAD_REF
		|| process.env.GITHUB_REF_NAME
		|| process.env.VERCEL_GIT_COMMIT_REF
		|| getLocalGitBranch();
}

export function resolveBranchTypesenseAlias(branch = getTypesenseBranchName()) {
	if (!branch) return null;
	if (branch === 'main') return 'directus-docs';
	return `directus-docs-preview-${slugifyBranch(branch)}`;
}
