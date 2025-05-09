import { getRequestURL } from "h3";
import sharp from "sharp";

async function getImageBuffer(baseURL: string, imagePath: string) {
	console.log('Fetching image from:', baseURL, imagePath);
	const imageUrl = `${baseURL}/docs/img/tutorials/${imagePath}.png`;

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
	const baseImageBuffer = await getImageBuffer(getRequestURL(event).origin, 'background');
	const logoContainerBuffer = await getImageBuffer(getRequestURL(event).origin, 'logo-container');
	const logoBuffer = await getImageBuffer(getRequestURL(event).origin, `${logoFileName}`);

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
			top: Math.floor(top + (logoMetadata.height! - directusMetadata.height! - 72) / 2),
			left: Math.floor(left + (logoMetadata.width! - directusMetadata.width!) / 2),
		},
	];

	// Compose the image
	const finalImage = await sharp(baseImageBuffer)
		.composite(compositeImages)
		.jpeg()
		.toBuffer();

	// Serve it
	setHeader(event, 'Content-Type', 'image/jpeg');
	return finalImage;
});
