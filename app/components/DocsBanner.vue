<script setup lang="ts">
const { data: banner } = useFetch('/api/banner');

const dismissedBanners = useCookie('directus-dismissed-banners', {
	default: () => [] as string[],
});

const bannerVisible = computed(() => {
	const value = banner.value;
	if (!value || Object.keys(value).length === 0) return false;
	if (!('id' in value) || !('content' in value)) return false;
	return !dismissedBanners.value.includes(value.id);
});

const dismiss = (id: string) => {
	dismissedBanners.value = [...dismissedBanners.value, id];
};

useHead(computed(() => ({
	style: [{ innerHTML: `:root { --ui-banner-height: ${bannerVisible.value ? '32px' : '0px'}; }` }],
})));
</script>

<template>
	<div
		v-if="banner && bannerVisible"
		class="bg-inverted text-inverted cursor-pointer h-8"
	>
		<UContainer class="h-full flex items-center gap-x-4">
			<NuxtLink
				class="flex-grow h-full flex items-center text-background no-underline text-xs leading-xs font-semibold group"
				:href="banner.link ?? undefined"
			>
				<Icon
					v-if="banner.icon"
					class="mr-2 size-5"
					:name="getIconName(banner.icon)"
				/>
				<span
					class="whitespace-nowrap overflow-hidden text-ellipsis"
					v-html="banner.content"
				/>
				<Icon
					class="hidden md:block transform duration-150 ease-out ml-1 group-hover:translate-x-1 size-5"
					name="material-symbols:arrow-forward"
				/>
			</NuxtLink>

			<button
				aria-label="Close"
				@click="dismiss(banner.id)"
			>
				<Icon
					name="material-symbols:close"
					class="size-5"
				/>
			</button>
		</UContainer>
	</div>
</template>
