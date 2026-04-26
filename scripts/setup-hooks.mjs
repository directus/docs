#!/usr/bin/env node

import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

if (!fs.existsSync('.git')) {
	process.exit(0);
}

try {
	execFileSync('git', ['config', 'core.hooksPath', '.githooks'], { stdio: 'ignore' });
}
catch {
	process.exit(0);
}
