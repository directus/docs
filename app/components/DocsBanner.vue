<script setup lang="ts">
const { data: banner } = useFetch('/api/banner');

const dismissedBanners = useCookie('directus-dismissed-banners', {
	default: () => [] as string[],
});

const bannerVisible = computed(() => {
	const bannerValue = unref(banner);
	if (!bannerValue) return false;
	if (Object.keys(bannerValue).length === 0) return false;

	if (!('id' in bannerValue) || !('content' in bannerValue)) return false;
	return unref(dismissedBanners).includes(bannerValue.id) === false;
});

const dismiss = (id: string) => {
	dismissedBanners.value = [...unref(dismissedBanners), id];
};

const iconName = computed(() => {
	const bannerValue = unref(banner);
	if (
		!bannerValue
		|| (typeof bannerValue === 'object' && Object.keys(bannerValue).length === 0)
	)
		return null;
	return getIconName(bannerValue.icon);
});
</script>

<template>
	<div
		v-if="banner && bannerVisible"
		class="bg-inverted text-inverted cursor-pointer h-8"
	>
		<UContainer class="h-full flex items-center gap-x-4">
			<NuxtLink
				class="flex-grow h-full flex items-center text-background no-underline text-xs leading-xs font-semibold group"
				:href="banner?.link ?? undefined"
			>
				<Icon
					v-if="iconName"
					class="mr-2 size-5"
					:name="iconName"
				/>
				<span
					class="whitespace-nowrap overflow-hidden text-ellipsis"
					v-html="banner?.content"
				/>
				<Icon
					class="hidden md:block transform duration-150 ease-out ml-1 group-hover:translate-x-1 size-5"
					name="material-symbols:arrow-forward"
				/>
			</NuxtLink>

			<button
				aria-label="Close"
				:padded="false"
				icon="material-symbols:close"
				@click="banner && dismiss(banner.id)"
			>
				<Icon
					name="material-symbols:close"
					class="size-5"
				/>
			</button>
		</UContainer>
	</div>
</template>
