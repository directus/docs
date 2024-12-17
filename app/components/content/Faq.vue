<script setup lang="ts">
import type { AccordionItem } from '#ui/types';

defineProps<{items: AccordionItem[] }>();
</script>

<template>
	<UAccordion :items="items" color="gray" size="md">
		<template #item="{ item }">
			<MDC :value="item.content" />
		</template>
	</UAccordion>
</template>
