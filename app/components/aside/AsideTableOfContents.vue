<script setup lang="ts">
const props = defineProps<{
	toc: PageToc;
}>();

const list = props.toc.links.map(link => ({
	_path: `#${link.id}`,
	title: link.text,
}));
</script>

<template>
	<div>
		<p class="section-title">
			On This Page
		</p>
		<nav>
			<ol>
				<li
					v-for="link of list"
					:key="link._path"
				>
					<NuxtLink
						:to="link._path"
					>
						{{ link.title }}
					</NuxtLink>
				</li>
			</ol>
		</nav>
	</div>
</template>

<style scoped>
ol {
	padding-left: 0;
	list-style-type: none;
	margin: 0;
}

a {
	display: block;
	text-decoration: none;
	margin-top: 0.5rem;
	font-size: 14px;
}

a:hover {
	text-decoration: underline;
}
</style>
