import { getRequestURL } from 'h3';
import sharp from 'sharp';

async function getImageBuffer(baseURL: string, imagePath: string) {
	const imageUrl = `${baseURL}/docs/img/tutorials/${imagePath}.png`;

	const res = await fetch(imageUrl);
	if (!res.ok) {
		throw createError({ statusCode: 404, statusMessage: 'Image not found' });
	}

	return Buffer.from(await res.arrayBuffer());
}

async function getImageBufferOrFallback(baseURL: string, imagePath: string, fallback: string) {
	const imageUrl = `${baseURL}/docs/img/tutorials/${imagePath}.png`;
	const res = await fetch(imageUrl);
	if (res.ok) {
		return Buffer.from(await res.arrayBuffer());
	}
	const fallbackUrl = `${baseURL}/docs/img/tutorials/${fallback}.png`;
	const fallbackRes = await fetch(fallbackUrl);
	if (!fallbackRes.ok) {
		throw createError({ statusCode: 404, statusMessage: 'Image not found' });
	}
	return Buffer.from(await fallbackRes.arrayBuffer());
}

export default defineEventHandler(async (event) => {
	const query = getQuery(event);
	const logosParam = typeof query?.logos === 'string' ? query.logos : '';
	const logoFileNames = logosParam ? logosParam.split(', ') : ['directus'];
	const logoFileName = logoFileNames[0] ?? 'directus';
	const baseURL = getRequestURL(event).origin;
	const baseImageBuffer = await getImageBuffer(baseURL, 'background');
	const logoContainerBuffer = await getImageBuffer(baseURL, 'logo-container');
	const logoBuffer = await getImageBufferOrFallback(baseURL, logoFileName, 'directus');

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
	setHeader(
		event,
		'Cache-Control',
		'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
	); // CDN cache for 1 day, stale for 7 days

	return finalImage;
});
