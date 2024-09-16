<script setup lang="ts">
import { ApiReference } from '@scalar/api-reference';
import '@scalar/api-reference/style.css';
</script>

<template>
	<ClientOnly>
		<ApiReference
			:configuration="{
				isEditable: false,
				hideSearch: true,
				hideDarkModeToggle: true,
				hideTestRequestButton: true,
				spec: {
					url: '/oas.yaml',
				},
			}"
		/>
	</ClientOnly>
</template>

<style>
.references-navigation-list {
	top: 0 !important;
}

/* .endpoint-path.example-path {
	display: none;
}

.request-method {
	display: none;
} */
</style>
