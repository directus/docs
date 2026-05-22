#!/usr/bin/env node

import { execFileSync } from 'node:child_process';

let existing = '';
try {
	existing = execFileSync('git', ['config', '--get', 'core.hooksPath'], { encoding: 'utf8' }).trim();
}
catch {
	// Not a git checkout or no value set — fall through.
}

if (existing && existing !== '.githooks') {
	console.error(`warning: core.hooksPath is already set to ${existing}; leaving it alone`);
	process.exit(0);
}

try {
	execFileSync('git', ['config', 'core.hooksPath', '.githooks'], { stdio: 'ignore' });
}
catch {
	// Not a git checkout (tarball, CI, etc.) or git not installed.
}
