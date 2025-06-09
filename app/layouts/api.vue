<script setup lang="ts">
import type { OpenAPIObject } from 'openapi3-ts/oas30';

const { links } = useSectionLinks();

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
					<UPageAnchors :links="links" />
					<USeparator
						type="dashed"
						class="my-5"
					/>
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
