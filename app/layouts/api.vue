<script setup lang="ts">
import type { OpenAPIObject } from 'openapi3-ts/oas30';
import useSectionLinks from '~/composables/useSectionLinks';

const { links } = useSectionLinks();

const openapi = inject<OpenAPIObject>('openapi')!;
</script>

<template>
	<div class="mx-6">
		<UPage>
			<template #left>
				<UAside
					:ui="{

					}"
				>
					<UPageAnchors :links="links" />
					<USeparator
						type="dashed"
						class="my-5"
					/>
					<UNavigationTree
						:links="mapOasNavigation(openapi)"
						:multiple="false"
						default-open
					/>
				</UAside>
			</template>

			<slot />
		</UPage>
	</div>
</template>
