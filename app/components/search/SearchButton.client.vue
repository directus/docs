<script setup lang="ts">
import { Inkeep } from '@inkeep/uikit-js';
import type { InkeepEmbedConfig } from '@inkeep/uikit-js/dist/types';
import { defu } from 'defu';

const runtimeConfig = useRuntimeConfig();
const appConfig = useAppConfig();

const inkeepDiv = document.createElement('div');
inkeepDiv.id = 'inkeepModal';
inkeepDiv.style.position = 'absolute';
document.body.appendChild(inkeepDiv);

const handleClose = () => {
	inkeepWidget.render({
		...config.properties,
		isOpen: false,
	});
};

const handleOpen = () => {
	inkeepWidget.render({
		...config.properties,
		isOpen: true,
	});
};

const config: InkeepEmbedConfig = defu(
	{
		targetElement: '#inkeepModal',
		componentType: 'CustomTrigger',
		properties: {
			isOpen: false,
			onClose: handleClose,
			onOpen: undefined,
			baseSettings: {
				apiKey: runtimeConfig.public.INKEEP_API_KEY,
				integrationId: runtimeConfig.public.INKEEP_INTEGRATION_ID,
				organizationId: runtimeConfig.public.INKEEP_ORGANIZATION_ID,
			},
		},
	},
	{ properties: appConfig.inkeep },
);

const inkeepWidget = Inkeep(config.properties.baseSettings).embed(config);
</script>

<template>
	<div
		class="search"
		@click="handleOpen"
	>
		<div class="search-box">
			<Icon name="material-symbols:search-rounded" />
			Search
		</div>
	</div>
</template>

<style scoped lang="scss">
.dark-mode .search-box {
	&:hover {
		border: 1px solid var(--secondary);
		color: var(--secondary);
		box-shadow: 0 0 0.5rem 0 color-mix(in srgb, var(--secondary) 15%, transparent);
	}
}

.search-box {
	border: 1px solid var(--border-subdued);
	border-radius: var(--border-radius);
	width: 100%;
	max-width: 250px;
	padding: 6px 9px;
	font-size: 0.8rem;
	color: var(--typography-subdued);
	display: flex;
	align-items: center;
	gap: 0.5rem;
	transition: border 0.1s ease, box-shadow 0.1s ease, color 0.1s ease;
	background-color: var(--background);
	&:hover {
		cursor: pointer;
		border: 1px solid var(--purple);
		color: var(--purple);
		box-shadow: 0 0 0.5rem 0 color-mix(in srgb, var(--primary) 15%, transparent);
	}
}

.search {
	display: flex;
	justify-content: center;
	align-items: center;
}
</style>
