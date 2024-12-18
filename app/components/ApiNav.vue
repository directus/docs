<script setup lang="ts">
import type { OperationObject } from 'openapi3-ts/oas30';

defineProps<{
	operations: (OperationObject & { method: string; path: string })[];
}>();
</script>

<template>
	<nav class="grow full block pl-4 pr-6 py-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm/6 my-5 font-mono">
		<NuxtLink
			v-for="methodObject of operations"
			:key="methodObject.path"
			:to="`#${methodObject.method}${methodObject.path}`"
			class="block w-max"
		>
			{{ methodObject.method.toUpperCase() }} {{ methodObject.path }}
		</NuxtLink>
	</nav>
</template>
