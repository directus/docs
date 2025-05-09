import { readFileSync } from "fs";
import { join } from "path";
import sharp from "sharp";

async function getImageBuffer(baseURL: string, imagePath: string) {
	const imageUrl = `${baseURL}/img/${imagePath}.png`;

	const res = await fetch(imageUrl);
	if (!res.ok) {
		throw createError({ statusCode: 404, statusMessage: 'Image not found' });
	}

	return Buffer.from(await res.arrayBuffer());
}

export default defineEventHandler(async (event) => {
	const query = getQuery(event);
	const logoFileNames = query?.logos?.split(', ') || ['directus']; // default to directus.png
	const logoFileName = logoFileNames[0];
	const baseImageBuffer = await getImageBuffer(getRequestURL(event).origin, 'background.png');
	const logoContainerBuffer = await getImageBuffer(getRequestURL(event).origin, 'logo-container.png');
	// const astroLogoPath = join('public/img/tutorials', 'astro.png');
	const logoBuffer = await getImageBuffer(getRequestURL(event).origin, `${logoFileName}.png`);
	// const directusLogoPath = join('public/img/tutorials', 'directus.png');

	// Get metadata to center the logo container
	const [baseMetadata, logoMetadata, directusMetadata] = await Promise.all([
		sharp(baseImageBuffer).metadata(),
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
