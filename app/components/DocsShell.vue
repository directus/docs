<template>
	<div class="@container/docs-pane min-w-0">
		<div class="docs-pane min-w-0">
			<DocsBanner />
			<DocsHeader />
			<DocsSubNav />
			<main class="min-h-[calc(100vh-var(--ui-header-height))]">
				<NuxtLayout>
					<NuxtPage />
				</NuxtLayout>
			</main>
			<DocsFooter />
		</div>
	</div>
</template>
