<script setup lang="ts">
import type { OperationObject } from 'openapi3-ts/oas30';

defineProps<{
	operations: (OperationObject & { method: string; path: string })[];
}>();
</script>

<template>
	<nav class="grow full block pl-4 pr-6 py-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm/6 font-mono">
		<ULink
			v-for="methodObject of operations"
			:key="methodObject.path"
			:to="`#${slugify(methodObject.summary!)}`"
			class="block w-max hover:text-primary"
		>
			<span :class="methodObject.method.toLowerCase()">{{ methodObject.method.toUpperCase() }}</span> {{ methodObject.path }}
		</ULink>
	</nav>
</template>

<style scoped>
.get {
	color: var(--color-success);
}

.post {
	color: var(--color-primary);
}

.put {
	color: var(--color-warning);
}

.delete {
	color: var(--color-error);
}

.patch {
	color: var(--color-warning);
}

.options {
	color: var(--color-info);
}

.head {
	color: var(--color-info);
}
</style>
