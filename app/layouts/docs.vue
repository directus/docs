<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content';
import { docsSections } from '#shared/utils/docsSections';

const { currentSection, sectionNavigation } = useSectionNavigation();
const nav = inject<Ref<ContentNavigationItem[]>>('navigation')!;
const route = useRoute();
const router = useRouter();

const isFrameworksSection = computed(() => route.path === '/frameworks' || route.path.startsWith('/frameworks/'));

const gettingStartedSection = docsSections.find(s => s.id === 'getting-started')!;

const fallbackSection = computed(() => (currentSection.value ? null : gettingStartedSection));

const gettingStartedNavigation = computed<ContentNavigationItem[]>(() => {
	const root = nav.value?.find(item => item.path === '/getting-started');
	return root?.children ?? [];
});

const displaySection = computed(() => currentSection.value ?? fallbackSection.value);
const displayNavigation = computed(() =>
	currentSection.value ? sectionNavigation.value : gettingStartedNavigation.value,
);

const frameworksRoot = computed(() =>
	nav.value?.find(item => item.path === '/frameworks'),
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
</script>

<template>
	<UContainer>
		<DocsPage>
			<template #left>
				<DocsAside class="lg:ps-0 lg:-ms-0 lg:pe-2">
					<p
						v-if="displaySection"
						class="text-xs font-medium text-dimmed mb-2 uppercase font-mono tracking-widest flex items-center gap-1"
					>
						<Icon
							v-if="displaySection?.icon"
							:name="displaySection.icon"
						/>
						{{ displaySection.label }}
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
								name="i-lucide-arrow-left"
								class="size-4"
							/>
							All Frameworks
						</NuxtLink>
					</template>

					<UContentNavigation
						v-else
						:navigation="displayNavigation"
						default-open
						variant="link"
						highlight
					/>
				</DocsAside>
			</template>

			<slot />
		</DocsPage>
	</UContainer>
</template>
