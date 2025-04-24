import { readFileSync } from "fs";
import { join } from "path";
import sharp from "sharp";

export default defineEventHandler(async (event) => {
	const baseImagePath = join('public/img/tutorials', 'background.png');
	const logoContainerPath = join('public/img/tutorials', 'logo-container.png');
	const astroLogoPath = join('public/img/tutorials', 'astro.png');

	// Load buffers
	const base = sharp(baseImagePath);
	const logoContainerBuffer = readFileSync(logoContainerPath);
	const astroLogoBuffer = readFileSync(astroLogoPath);

	// Get metadata to center the logo container
	const [baseMetadata, logoMetadata, astroMetadata] = await Promise.all([
		base.metadata(),
		sharp(logoContainerBuffer).metadata(),
		sharp(astroLogoBuffer).metadata(),
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
	    input: astroLogoBuffer,
	  	top: Math.floor(top + (logoMetadata.height! - astroMetadata.height!) / 2),
	    left: Math.floor(left + (logoMetadata.width! - astroMetadata.width!) / 2),
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
