import type { NavItem, ParsedContent } from '@nuxt/content';

export const resolveRoute = (path: string, pages: Pick<ParsedContent, '_path' | 'additional_paths'>[], navigation: NavItem[]) => {
	const page = pages.find(page => page._path === path || (Array.isArray(page.additional_paths) && page.additional_paths.includes(path)));

	if (page) {
		return page._path;
	}

	const isActualPage = (navItem: NavItem) => pages.some(page =>
		page._path === navItem._path
		|| (Array.isArray(page.additional_paths) && page.additional_paths.includes(navItem._path)),
	);

	const findPage = (tree: NavItem[], pathResolved = false): NavItem | null => {
		for (const branch of tree) {
			if (path.startsWith(branch._path) || pathResolved) {
				if (isActualPage(branch)) {
					return branch;
				}
				if (branch.children && branch.children?.length > 0) {
					if (branch._path === path) {
						return findPage(branch.children, true);
					}
					else {
						return findPage(branch.children, pathResolved);
					}
				}
				return null;
			}
		}
		return null;
	};

	const found = findPage(navigation);

	if (found) {
		return found._path;
	}

	return null;
};

export const allRoutes = (navigation: NavItem[]): string[] => {
	const result: string[] = [];

	navigation.forEach(({ _path, additional_paths = [], children = [] }) => {
		if (_path) result.push(_path);
		result.push(...additional_paths);
		if (children.length) result.push(...allRoutes(children));
	});

	return result;
};
