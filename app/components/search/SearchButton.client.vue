<template>
	<div class="search">
		<AlgoliaDocSearch />
	</div>
</template>

<script lang="ts" setup></script>

<style lang="scss">
#docsearch {
	width: 100%;
	max-width: 205px;
}

.DocSearch-Button {
	border: 1px solid var(--border-subdued) !important;
	border-radius: var(--border-radius) !important;
	width: 100% !important;
	max-width: 250px !important;
	padding: 6px 9px !important;
	margin: 0 !important;
	font-size: 0.8rem !important;
	color: var(--typography-subdued) !important;
	display: flex !important;
	align-items: center !important;
	gap: 0.5rem !important;
	transition: border 0.1s ease, box-shadow 0.1s ease, color 0.1s ease,
		background-color 0.1s ease !important;
	background-color: var(--background) !important;
	--docsearch-text-color: var(--typography-subdued);
}

.DocSearch-Button:hover {
	cursor: pointer !important;
	border: 1px solid var(--purple) !important;
	color: var(--purple) !important;
	box-shadow: 0 0 0.5rem 0 color-mix(in srgb, var(--primary) 15%, transparent) !important;
}

.dark-mode .DocSearch-Button {
	border: 1px solid var(--border-subdued) !important;
	color: var(--typography-subdued) !important;
	background-color: var(--background-dark) !important;
}

.dark-mode .DocSearch-Button:hover {
	border: 1px solid var(--secondary) !important;
	color: var(--secondary) !important;
	box-shadow: 0 0 0.5rem 0 color-mix(in srgb, var(--secondary) 15%, transparent) !important;
	background-color: var(
		--background-dark-hover
	) !important;
}

.DocSearch-Button-Container {
	gap: 1rem;
}

.DocSearch-Button .DocSearch-Search-Icon {
	color: var(--typography-subdued);
}

.DocSearch-Button:hover .DocSearch-Search-Icon {
	color: var(--purple);
}

.DocSearch-Button-Placeholder {
	font-size: inherit !important;
	padding: 0 !important;
}

.DocSearch-Button-Keys {
	display: none !important;
}

.DocSearch-Button-Key {
	display: none !important;
}

@media (width <= 768px) {
	.DocSearch-Button-Keys,
	.DocSearch-Button-Placeholder {
		display: block !important;
	}
}

.search {
	display: flex !important;
	justify-content: center !important;
	align-items: center !important;
}
</style>
