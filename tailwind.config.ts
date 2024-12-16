import type { Config } from "tailwindcss";

export default <Partial<Config>>{
	theme: {
		extend: {
			colors: {
				purple: {
					50: "#f3f2ff",
					100: "#e9e8ff",
					200: "#d6d4ff",
					300: "#b8b1ff",
					400: "#9585ff",
					500: "#6644ff",
					600: "#6030f7",
					700: "#531ee3",
					800: "#4418bf",
					900: "#39169c",
					950: "#210b6a",
				},
				pink: {
					50: "#fef1fa",
					100: "#fee5f6",
					200: "#feccee",
					300: "#ff99dd",
					400: "#fe68c9",
					500: "#f83cb0",
					600: "#e81a8f",
					700: "#ca0c72",
					800: "#a70d5e",
					900: "#8b1050",
					950: "#55022d",
				},
			},
		},
	},
};
