#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

import sharp from 'sharp';

import { getFrontmatterBlock, listRoutableContentFiles } from './_content-lib.ts';

const IMAGES_DIR = 'public/img/tutorials';
const CARDS_DIR = path.join(IMAGES_DIR, 'cards');
const FALLBACK_LOGO = 'directus';

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
	console.log(`tutorial-cards

Bakes a card image for the first technology of every tutorial into ${CARDS_DIR}.
Technologies without a logo in ${IMAGES_DIR} get the Directus card.

Usage:
  node scripts/tutorial-cards.ts          Write missing cards
  node scripts/tutorial-cards.ts --force  Rewrite every card
  node scripts/tutorial-cards.ts --check  Exit 1 if any card is missing
`);
	process.exit(0);
}

function firstTechnology(source: string): string | undefined {
	const block = getFrontmatterBlock(source);
	if (!block) return undefined;

	const match = block.body.match(/^technologies:\s*(?:\[\s*([^\],]+)|\r?\n\s*-\s*(.+))/m);
	const value = match?.[1] ?? match?.[2];
	return value?.trim().replace(/^['"]|['"]$/g, '') || undefined;
}

function cardPath(technology: string): string {
	return path.join(CARDS_DIR, `${technology}.jpg`);
}

async function writeCard(technology: string): Promise<void> {
	const logoFile = path.join(IMAGES_DIR, `${technology}.png`);
	const logo = fs.readFileSync(fs.existsSync(logoFile) ? logoFile : path.join(IMAGES_DIR, `${FALLBACK_LOGO}.png`));
	const background = fs.readFileSync(path.join(IMAGES_DIR, 'background.png'));
	const container = fs.readFileSync(path.join(IMAGES_DIR, 'logo-container.png'));

	const [backgroundMeta, containerMeta, logoMeta] = await Promise.all([
		sharp(background).metadata(),
		sharp(container).metadata(),
		sharp(logo).metadata(),
	]);

	const left = Math.floor((backgroundMeta.width - containerMeta.width) / 2);
	const top = Math.floor((backgroundMeta.height - containerMeta.height) / 2);

	const composed = await sharp(background)
		.composite([
			{ input: container, top, left },
			{
				input: logo,
				top: Math.floor(top + (containerMeta.height - logoMeta.height - 72) / 2),
				left: Math.floor(left + (containerMeta.width - logoMeta.width) / 2),
			},
		])
		.png()
		.toBuffer();

	// Cards render at most ~400px wide, so half size is still sharp on 2x screens.
	await sharp(composed).resize({ width: 960 }).jpeg({ quality: 82, mozjpeg: true }).toFile(cardPath(technology));
}

async function main(): Promise<void> {
	const technologies = new Set<string>([FALLBACK_LOGO]);
	for (const file of listRoutableContentFiles()) {
		const technology = firstTechnology(fs.readFileSync(file, 'utf8'));
		if (technology) technologies.add(technology);
	}

	const force = args.includes('--force');
	const missing = [...technologies].filter(technology => force || !fs.existsSync(cardPath(technology)));

	if (args.includes('--check')) {
		if (missing.length) {
			console.error(`Missing tutorial cards: ${missing.join(', ')}`);
			console.error('Run `pnpm tutorial-cards` and commit the result.');
			process.exit(1);
		}
		console.log(`All ${technologies.size} tutorial cards present.`);
		return;
	}

	fs.mkdirSync(CARDS_DIR, { recursive: true });
	for (const technology of missing) {
		await writeCard(technology);
		console.log(`Wrote ${cardPath(technology)}`);
	}
	console.log(`${missing.length} card(s) written, ${technologies.size} total.`);
}

await main();
