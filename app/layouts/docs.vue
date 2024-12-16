<script setup lang="ts">
import type { NavItem } from '@nuxt/content';

const navigation = inject<NavItem[]>('navigation', []);
</script>

<template>
	<div>
		<UContainer>
			<UPage>
				<template #left>
					<UAside>
						<UNavigationTree :links="mapContentNavigation(navigation)" :multiple="false" default-open />
					</UAside>
				</template>

				<slot />
			</UPage>
		</UContainer>
	</div>
</template>

<style scoped>
/* Your component styles go here */
</style>
