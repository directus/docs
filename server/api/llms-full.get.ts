import fs from 'node:fs';
import path from 'node:path';

export default defineEventHandler(async (event) => {
	// Serve the generated file from public to ensure same path as static assets
	const filePath = path.join(process.cwd(), 'public', 'llms-full.txt');
	if (!fs.existsSync(filePath)) {
		throw createError({ statusCode: 404, statusMessage: 'llms-full.txt not found' });
	}
	setHeader(event, 'Content-Type', 'text/plain; charset=utf-8');
	return fs.createReadStream(filePath);
});


