#!/usr/bin/env node

import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

if (!fs.existsSync('.git')) {
	process.exit(0);
}

/**
 * Hooks are a contributor convenience, not a hard install requirement.
 * Warn instead of failing so package installation still works in tarballs, CI, or
 * other environments where git metadata is intentionally absent.
 */
if (!fs.existsSync('.githooks')) {
	console.error('warning: .githooks directory not found; hooks were not configured');
	process.exit(0);
}

let currentHooksPath = '';
try {
	currentHooksPath = execFileSync('git', ['config', '--get', 'core.hooksPath'], { encoding: 'utf8' }).trim();
}
catch {
	// No local hooks path is configured.
}

if (currentHooksPath && currentHooksPath !== '.githooks') {
	console.error(`warning: core.hooksPath is already set to ${currentHooksPath}; hooks were not configured`);
	process.exit(0);
}

try {
	execFileSync('git', ['config', 'core.hooksPath', '.githooks'], { stdio: 'ignore' });
}
catch {
	console.error('warning: failed to configure git core.hooksPath to .githooks; hooks may not run automatically');
	process.exit(0);
}
