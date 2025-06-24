<script setup lang="ts">
const { data: banner } = useFetch('/api/banner');

const dismissedBanners = useCookie('directus-dismissed-banners', {
	default: () => [] as string[],
});

const bannerVisible = computed(() => {
	if (!unref(banner)) return false;
	return unref(dismissedBanners).includes(unref(banner)!.id) === false;
});

const dismiss = (id: string) => {
	dismissedBanners.value = [...unref(dismissedBanners), id];
};

const iconName = computed(() => {
	if (!unref(banner)) return null;
	return getIconName(unref(banner)!.icon);
});
</script>

<template>
	<div
		v-if="banner && bannerVisible"
		class="bg-inverted text-inverted cursor-pointer  h-8"
	>
		<UContainer class="h-full flex items-center gap-x-4">
			<NuxtLink
				class="flex-grow h-full flex items-center text-background no-underline text-xs leading-xs font-semibold group"
				:href="banner.link ?? undefined"
			>
				<Icon
					v-if="iconName"
					class="mr-2 size-5"
					:name="iconName"
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
				:padded="false"
				icon="material-symbols:close"
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
