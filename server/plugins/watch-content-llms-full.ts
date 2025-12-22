import chokidar from 'chokidar';
import path from 'node:path';
import { generateLlmsFull } from '../utils/generate-llms-full.mjs';

function isEnabled() {
	const v = (process.env.LLMS_FULL_ENABLE || '').toLowerCase();
	return v === '1' || v === 'true' || v === 'yes';
}

export default defineNitroPlugin(() => {
	if (process.env.NODE_ENV !== 'development') return;
	if (!isEnabled()) return;

	const contentDir = path.join(process.cwd(), 'content');
	const outFile = path.join(process.cwd(), 'public', 'llms-full.txt');

	const watcher = chokidar.watch(contentDir, {
		ignoreInitial: true,
		ignored: [/(^|[/\\])\../], // dotfiles
		awaitWriteFinish: { stabilityThreshold: 200, pollInterval: 50 },
	});

	const regenerate = async () => {
		try {
			const res = await generateLlmsFull({ contentDir, outFile });
			// eslint-disable-next-line no-console
			console.log(`[llms-full] Regenerated (${res.filesCount} files) after content change`);
		}
		catch (err) {
			// eslint-disable-next-line no-console
			console.error('[llms-full] Regeneration failed:', err);
		}
	};

	watcher.on('add', regenerate);
	watcher.on('change', regenerate);
	watcher.on('unlink', regenerate);
});


