<template>
	<div>
		<DocsHeader />

		<UContainer>
			<main class="min-h-[calc(100vh-var(--ui-header-height))]">
				<DocsPage>
					<UError :error="error" />
				</DocsPage>
			</main>
		</UContainer>
	</div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app';

defineProps<{
	error: NuxtError;
}>();
</script>
