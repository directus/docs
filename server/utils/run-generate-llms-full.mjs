import { generateLlmsFull } from './generate-llms-full.mjs';
import { readFileSync } from 'node:fs';
import path from 'node:path';

function loadDotEnv() {
	try {
		const envPath = path.join(process.cwd(), '.env');
		const raw = readFileSync(envPath, 'utf8');
		for (const line of raw.split(/\r?\n/)) {
			if (!line || line.trim().startsWith('#')) continue;
			const idx = line.indexOf('=');
			if (idx === -1) continue;
			const key = line.slice(0, idx).trim();
			let value = line.slice(idx + 1).trim();
			if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith('\'') && value.endsWith('\''))) {
				value = value.slice(1, -1);
			}
			if (!(key in process.env)) process.env[key] = value;
		}
	}
	catch {
		// no .env present or failed to read — ignore
	}
}

function isEnabled() {
	const v = (process.env.LLMS_FULL_ENABLE || '').toLowerCase();
	return v === '1' || v === 'true' || v === 'yes';
}

async function main() {
	loadDotEnv();
	if (!isEnabled()) {
		// eslint-disable-next-line no-console
		console.log('[llms-full] Skipped (LLMS_FULL_ENABLE not set to true)');
		process.exit(0);
	}

	try {
		const res = await generateLlmsFull();
		// eslint-disable-next-line no-console
		console.log(`[llms-full] Generated ${res.filesCount} files, ${res.bytesWritten} bytes → ${res.outFile}`);
	}
	catch (err) {
		// eslint-disable-next-line no-console
		console.error('[llms-full] Generation failed:', err);
		process.exit(1);
	}
}

main();


