<script setup lang="ts">
import type { OpenAPIObject } from 'openapi3-ts/oas30';

const openapi = inject<OpenAPIObject>('openapi')!;
</script>

<template>
	<div>
		<UContainer>
			<UPage>
				<template #left>
					<UAside>
						<UNavigationTree
							:links="mapOasNavigation(openapi)"
							:multiple="false"
							default-open
						/>
					</UAside>
				</template>

				<slot />
			</UPage>
		</UContainer>
	</div>
</template>
