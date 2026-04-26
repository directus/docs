#!/usr/bin/env node

import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

if (!fs.existsSync('.git')) {
	process.exit(0);
}

if (!fs.existsSync('.githooks')) {
	console.error('warning: .githooks directory not found; hooks were not configured');
	process.exit(0);
}

try {
	execFileSync('git', ['config', 'core.hooksPath', '.githooks'], { stdio: 'ignore' });
}
catch {
	console.error('warning: failed to configure git core.hooksPath to .githooks; hooks may not run automatically');
	process.exit(0);
}
