<script setup lang="ts">
import { apiReferenceNavigation } from '~/generated/api-reference/meta';

const oasNavigation = apiReferenceNavigation;
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
