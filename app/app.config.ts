export default defineAppConfig({
	inkeep: {
		baseSettings: {
			primaryBrandColor: '#4322DD',
			organizationDisplayName: 'Directus',
			theme: {
				tokens: {
					fonts: {
						heading: '\'Poppins\', sans-serif',
						body: '\'IBM Plex Sans\', sans-serif',
						mono: '\'IBM Plex Mono\', monospace',
					},
				},
			},
			colorMode: {
				enableSystem: true,
			},
		},
		modalSettings: {
			isModeSwitchingEnabled: false,
			defaultView: 'search',
		},
		searchSettings: {
		},
	},
});
