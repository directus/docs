<script setup lang="ts">
const { spec: openapi } = await import('@directus/openapi');

provide('openapi', openapi);

const oasNavigation = computed(() => mapOasNavigation(openapi));
</script>

<template>
	<UContainer>
		<UPage>
			<template #left>
				<UPageAside
					:ui="{

					}"
				>
					<UContentNavigation
						:navigation="oasNavigation"
						highlight
						default-open
						variant="link"
						type="single"
					/>
				</UPageAside>
			</template>

			<slot />
		</UPage>
	</UContainer>
</template>
