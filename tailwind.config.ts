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
			},
		},
	},
};
