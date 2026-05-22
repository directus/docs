<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content';

const nav = inject<Ref<ContentNavigationItem[]>>('navigation')!;
const route = useRoute();
const router = useRouter();

const { links } = useSectionLinks();
const { header: { nav: navConfig } } = useAppConfig();

const currentSection = computed(() => {
	const pathSegments = route.path.split('/').filter(Boolean);
	const contentSection = pathSegments[0];

	if (!contentSection) return null;
	if (contentSection === 'guides') return null;

	for (const item of navConfig) {
		if (item.children) {
			const matchingChild = item.children.find((child) => {
				if (child.to) {
					const childSegments = child.to.split('/').filter(Boolean);
					return childSegments[0] === contentSection;
				}
				return false;
			});
			if (matchingChild) {
				return matchingChild;
			}
		}

		if (item.to) {
			const itemSegments = item.to.split('/').filter(Boolean);
			if (itemSegments[0] === contentSection) {
				return item;
			}
		}
	}

	return null;
}) as ComputedRef<{ label: string; to: string; icon?: string } | null>;

const navigation = computed(() => {
	const routePrefix = `/${route.path.split('/')[1]}`;

	return nav.value.find((item) => {
		return item.path.startsWith(routePrefix);
	})?.children ?? [];
});

const isFrameworksSection = computed(() => route.path === '/frameworks' || route.path.startsWith('/frameworks/'));

const frameworksRoot = computed(() =>
	nav.value.find(item => item.path === '/frameworks'),
);

type FrameworkOption = { label: string; value: string; icon?: string };

const frameworkOptions = computed<FrameworkOption[]>(() => {
	const items = frameworksRoot.value?.children ?? [];
	return items
		.filter(item => item.path && item.path !== '/frameworks')
		.map(item => ({
			label: item.title ?? item.path?.split('/').pop() ?? '',
			value: item.path,
			icon: item.icon,
		}));
});

const selectedFrameworkPath = computed(() => {
	const match = /^\/frameworks\/([^/]+)/.exec(route.path);
	return match ? `/frameworks/${match[1]}` : undefined;
});

const selectedFrameworkIcon = computed(() =>
	frameworkOptions.value.find(option => option.value === selectedFrameworkPath.value)?.icon,
);

const onFrameworkSelect = (value: string | undefined) => {
	if (value && value !== selectedFrameworkPath.value) {
		router.push(value);
	}
};

const frameworkNavigation = computed(() => {
	const path = selectedFrameworkPath.value;
	if (!path) return [];
	const node = frameworksRoot.value?.children?.find(item => item.path === path);
	return node?.children ?? [];
});

const sectionHeader = computed<{ label: string; icon?: string } | null>(() => {
	if (isFrameworksSection.value) {
		return { label: 'Frameworks', icon: 'i-ph-brackets-curly' };
	}
	return currentSection.value
		? { label: currentSection.value.label, icon: currentSection.value.icon }
		: null;
});
</script>

<template>
	<UContainer>
		<UPage>
			<template #left>
				<UPageAside>
					<UPageAnchors :links="links" />
					<USeparator
						type="dashed"
						class="my-5"
					/>

					<p
						v-if="sectionHeader"
						class="text-xs font-medium text-dimmed mb-2 uppercase flex items-center gap-1"
					>
						<Icon
							v-if="sectionHeader.icon"
							:name="sectionHeader.icon"
						/>
						{{ sectionHeader.label }}
					</p>

					<template v-if="isFrameworksSection">
						<USelectMenu
							:model-value="selectedFrameworkPath"
							:items="frameworkOptions"
							:icon="selectedFrameworkIcon"
							placeholder="Choose a framework"
							value-key="value"
							size="lg"
							class="w-full mb-4"
							@update:model-value="onFrameworkSelect"
						>
							<template #item-leading="{ item }">
								<Icon
									v-if="item.icon"
									:name="item.icon"
									class="size-4"
								/>
							</template>
						</USelectMenu>

						<UContentNavigation
							v-if="frameworkNavigation.length"
							:navigation="frameworkNavigation"
							default-open
							variant="link"
							highlight
						/>

						<NuxtLink
							v-if="selectedFrameworkPath"
							to="/frameworks"
							class="mt-4 flex items-center gap-2 border-t border-dashed border-default pt-4 text-sm font-medium text-muted transition hover:text-primary"
						>
							<Icon
								name="i-ph-arrow-left"
								class="size-4"
							/>
							All Frameworks
						</NuxtLink>
					</template>

					<UContentNavigation
						v-else
						:navigation="navigation"
						default-open
						variant="link"
						highlight
					/>
				</UPageAside>
			</template>

			<slot />
		</UPage>
	</UContainer>
</template>
