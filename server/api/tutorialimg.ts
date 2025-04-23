// import { readFileSync } from "fs";
import { join } from "path";
import sharp from "sharp";

export default defineEventHandler(async (event) => {
	const baseImagePath = join('public/img/tutorials', 'background.png');
	// const icon1Path = join('public/images', 'icon1.png')
	// const icon2Path = join('public/images', 'icon2.png')

	// Load base image
	const base = sharp(baseImagePath);

	// // Prepare icon overlays
	// const icon1Buffer = readFileSync(icon1Path)
	// const icon2Buffer = readFileSync(icon2Path)

	// const compositeImages = [
	//   {
	//     input: icon1Buffer,
	//     top: 50,
	//     left: 100,
	//   },
	//   {
	//     input: icon2Buffer,
	//     top: 300,
	//     left: 400,
	//   },
	// ]

	// Compose the image
	const finalImage = await base
	// .composite(compositeImages)
		.jpeg()
		.toBuffer();

	// Serve it
	setHeader(event, 'Content-Type', 'image/jpeg');
	return finalImage;
});
