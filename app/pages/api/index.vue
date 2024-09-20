<script setup lang="ts">
import { ApiReference } from '@scalar/api-reference';
import '@scalar/api-reference/style.css';
</script>

<template>
	<div class="api-wrapper">
		<ClientOnly>
			<ApiReference
				:configuration="{
					isEditable: false,
					hideSearch: true,
					hideDarkModeToggle: true,
					hideTestRequestButton: true,
					spec: { url: '/oas.yaml' },
					hiddenClients: [
						'libcurl',
						'clj_http',
						'httpclient',
						'restsharp',
						'native',
						'http1.1',
						'asynchttp',
						'nethttp',
						'okhttp',
						'unirest',
						'xhr',
						'axios',
						'fetch',
						'jquery',
						'okhttp',
						'undici',
						'native',
						'request',
						'axios',
						'fetch',
						'nsurlsession',
						'cohttp',
						'guzzle',
						'http1',
						'http2',
						'webrequest',
						'restmethod',
						'python3',
						'requests',
						'httr',
						'native',
						'httpie',
						'wget',
						'nsurlsession',
					],
				}"
			/>
		</ClientOnly>
	</div>
</template>

<style>
.api-wrapper {
	margin-top: 0px;
	--scalar-font: var(--font--body);
	--scalar-font-code: var(--font--code);
	--scalar-sidebar-width: 260px;
}

.references-navigation-list {
	top: 111px !important;
}

.section.introduction-section {
	padding-top: 24 !important;
}

.section.introduction-section .section-column:nth-of-type(2) {
	padding-top: 24 !important;
}

@media (max-width: 1000px) {
	.api-wrapper {
		margin-top: 0px;
	}

	.section.introduction-section {
		padding-top: 32px !important;
	}

}

.sidebar {
	border-right: 0px !important;
}

.sidebar::after {
	content: "" !important; /* Creates an empty content for the pseudo-element */
	position: absolute !important;
	right: 12px !important; /* Move the border 14px to the right */
	top: 0 !important;
	height: 100% !important;
	width: 2px !important; /* The width of the border */
	background-color: var(
		--border
	) !important; /* Change this to your desired border color */
	z-index: 1 !important;
}

.dark-mode .sidebar::after {
	content: "" !important; /* Creates an empty content for the pseudo-element */
	position: absolute !important;
	right: 12px !important; /* Move the border 14px to the right */
	top: 0 !important;
	height: 100% !important;
	width: 2px !important; /* The width of the border */
	background-color: var(
		--border
	) !important; /* Change this to your desired border color */
	z-index: 1 !important;
}

.sidebar-heading {
	font-weight: 400 !important;
}

.sidebar-heading.active_page {
	font-weight: 500 !important;
}

.sidebar-heading.active_page::after {
	content: "" !important; /* Creates an empty content for the pseudo-element */
	position: absolute !important;
	right: -11px !important; /* Move the border 14px to the right */
	top: 0 !important;
	height: 100% !important;
	width: 2px !important; /* The width of the border */
	background-color: var(
		--purple
	) !important; /* Change this to your desired border color */
	z-index: 50 !important;
}

.dark-mode .sidebar-heading.active_page::after {
	content: "" !important; /* Creates an empty content for the pseudo-element */
	position: absolute !important;
	right: -11px !important; /* Move the border 14px to the right */
	top: 0 !important;
	height: 100% !important;
	width: 2px !important; /* The width of the border */
	background-color: var(
		--pink
	) !important; /* Change this to your desired border color */
	z-index: 50 !important;
}

.light-mode {
	color-scheme: light;
	--scalar-color-1: var(--typography);
	--scalar-color-2: var(--typography-subdued);
	--scalar-color-3: var(--typography-subdued);
	--scalar-color-accent: var(--primary);
	--scalar-background-1: var(--background);
	--scalar-background-2: var(--background-subdued);
	--scalar-background-3: var(--background-subtle);
	--scalar-background-accent: var(--primary);

	--scalar-border-color: var(--border-subdued);
	--scalar-scrollbar-color: rgba(0, 0, 0, 0.18);
	--scalar-scrollbar-color-active: rgba(0, 0, 0, 0.36);
	--scalar-lifted-brightness: 1;
	--scalar-backdrop-brightness: 1;

	--scalar-shadow-1: 0 1px 3px 0 rgba(0, 0, 0, 0.11);
	--scalar-shadow-2: rgba(0, 0, 0, 0.08) 0px 13px 20px 0px,
		rgba(0, 0, 0, 0.08) 0px 3px 8px 0px, var(--scalar-border-color) 0px 0 0 1px;

	--scalar-button-1: var(--primary);
	--scalar-button-1-color: #fff;
	--scalar-button-1-hover: rgb(28 31 33);

	--scalar-color-red: var(--red-5);
	--scalar-color-orange: var(--red-5);
	--scalar-color-green: var(--green-5);
	--scalar-color-blue: var(--blue-5);
	--scalar-color-purple: var(--purple);
}

.dark-mode {
	color-scheme: dark;
	--scalar-color-1: var(--typography);
	--scalar-color-2: var(--typography);
	--scalar-color-3: var(--typography);
	--scalar-color-accent: var(--secondary);
	--scalar-background-1: var(--background);
	--scalar-background-2: var(--background-subdued);
	--scalar-background-3: var(--background-subtle);
	--scalar-background-accent: var(--secondary);

	--scalar-border-color: var(--border);
	--scalar-scrollbar-color: rgba(255, 255, 255, 0.24);
	--scalar-scrollbar-color-active: rgba(255, 255, 255, 0.48);
	--scalar-lifted-brightness: 1;
	--scalar-backdrop-brightness: 1;

	--scalar-shadow-1: 0 1px 3px 0 rgba(0, 0, 0, 0.11);
	--scalar-shadow-2: rgba(15, 15, 15, 0.2) 0px 3px 6px,
		rgba(15, 15, 15, 0.4) 0px 9px 24px, 0 0 0 1px rgba(255, 255, 255, 0.1);

	--scalar-button-1: var(--pink);
	--scalar-button-1-color: #fff;
	--scalar-button-1-hover: rgb(28 31 33);

	--scalar-color-red: var(--red-3);
	--scalar-color-orange: var(--red-3);
	--scalar-color-green: var(--green-3);
	--scalar-color-blue: var(--blue-3);
	--scalar-color-purple: var(--pink);
}

/* Sidebar */
.light-mode .t-doc__sidebar {
	--scalar-sidebar-background-1: var(--background);
	--scalar-sidebar-item-hover-color: currentColor;
	--scalar-sidebar-item-hover-background: var(--scalar-background-2);
	--scalar-sidebar-item-active-background: transparent;
	--scalar-sidebar-border-color: var(--scalar-border-color);
	--scalar-sidebar-color-1: var(--scalar-color-1);
	--scalar-sidebar-color-2: var(--scalar-color-1);
	--scalar-sidebar-color-active: var(--purple);
	--scalar-sidebar-search-background: var(--scalar-background-3);
	--scalar-sidebar-search-border-color: var(--scalar-sidebar-search-background);
	--scalar-sidebar-search--color: var(--scalar-color-3);
}

.dark-mode .sidebar {
	--scalar-sidebar-background-1: var(--background);
	--scalar-sidebar-item-hover-color: currentColor;
	--scalar-sidebar-item-hover-background: var(--scalar-background-2);
	--scalar-sidebar-item-active-background: transparent;
	--scalar-sidebar-border-color: var(--scalar-border-color);
	--scalar-sidebar-color-1: var(--scalar-color-1);
	--scalar-sidebar-color-2: var(--scalar-color-1);
	--scalar-sidebar-color-active: var(--pink);
	--scalar-sidebar-search-background: var(--scalar-background-3);
	--scalar-sidebar-search-border-color: var(--scalar-sidebar-search-background);
	--scalar-sidebar-search--color: var(--scalar-color-3);
}
</style>
