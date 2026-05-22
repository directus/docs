<script setup lang="ts">
import type { OpenAPIObject } from 'openapi3-ts/oas30';

const openapi = inject<OpenAPIObject>('openapi')!;
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
