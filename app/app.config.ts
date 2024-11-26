export default defineAppConfig({
	inkeep: {
		baseSettings: {
			primaryBrandColor: '#4322DD',
			organizationDisplayName: 'Directus',
			theme: {
				tokens: {
					fonts: {
						heading: '\'Poppins\', sans-serif',
						body: '\'Inter\', sans-serif',
						mono: '\'Fire Mono\', monospace',
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
