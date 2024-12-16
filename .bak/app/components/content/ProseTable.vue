<script setup lang="ts">

</script>

<template>
	<div class="prose-table-wrapper">
		<table>
			<slot />
		</table>
	</div>
</template>

<style scoped lang="scss">
.prose-table-wrapper {
	overflow-x: auto;
}
</style>
