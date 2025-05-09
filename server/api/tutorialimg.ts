import { readFileSync } from "fs";
import { join } from "path";
import sharp from "sharp";

export default defineEventHandler(async (event) => {
	const query = getQuery(event);
	const logoFileNames = query?.logos?.split(', ') || ['directus']; // default to directus.png
	const logoFileName = logoFileNames[0];
  console.log('logoFileName', logoFileName);
	const baseImagePath = join('/public/img/tutorials', 'background.png');
	const logoContainerPath = join('/public/img/tutorials', 'logo-container.png');
	// const astroLogoPath = join('public/img/tutorials', 'astro.png');
	const logoPath = join('/public/img/tutorials', `${logoFileName}.png`);
	// const directusLogoPath = join('public/img/tutorials', 'directus.png');

	// Load buffers
	const base = sharp(baseImagePath);
	const logoContainerBuffer = readFileSync(logoContainerPath);
	// const astroLogoBuffer = readFileSync(astroLogoPath);
	const logoBuffer = readFileSync(logoPath);

	// Get metadata to center the logo container
	const [baseMetadata, logoMetadata, directusMetadata] = await Promise.all([
		base.metadata(),
		sharp(logoContainerBuffer).metadata(),
		sharp(logoBuffer).metadata(),
	]);

	const left = Math.floor((baseMetadata.width! - logoMetadata.width!) / 2);
	const top = Math.floor((baseMetadata.height! - logoMetadata.height!) / 2);

	const compositeImages = [
		{
			input: logoContainerBuffer,
			top,
			left,
		},
		{

			input: logoBuffer,
			top: Math.floor(top + (logoMetadata.height! - directusMetadata.height!) / 2),
			left: Math.floor(left + (logoMetadata.width! - directusMetadata.width!) / 2),
		}
	];

	// Compose the image
	const finalImage = await base
		.composite(compositeImages)
		.jpeg()
		.toBuffer();

	// Serve it
	setHeader(event, 'Content-Type', 'image/jpeg');
	return finalImage;
});
