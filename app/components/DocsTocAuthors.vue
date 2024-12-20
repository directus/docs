<script setup lang="ts">
defineProps<{
	authors: { name: string; title: string }[];
}>();
</script>

<template>
	<div>
		<p class="font-semibold text-sm/6 truncate">
			Written by:
		</p>
		<ul class="space-y-3">
			<li
				v-for="author in authors"
				:key="author.name"
				class="text-sm/6 text-gray-500 dark:text-gray-400 mt-2"
			>
				<span class="font-semibold">{{ author.name }}</span><br>{{ author.title }}
			</li>
		</ul>
	</div>
</template>
