<script setup lang="ts">
import { appConfig } from '~~/utils/app-config';

const { data } = await useAsyncData('appConfig', appConfig);

const year = new Date().getFullYear();
</script>

<template>
	<div
		v-if="data?.footer"
		class="lined-wrap"
	>
		<div>
			<footer class="footer">
				<nav
					class="primary container base-container footer-container"
				>
					<ul>
						<li class="logo">
							<NuxtLink to="/">
								<HeaderLogo />
							</NuxtLink>

							<div
								class="description"
							>
								<p>{{ data.footer.description }}</p>
							</div>
						</li>
						<li
							v-for="group of data.footer.groups"
							:key="group.id"
						>
							<div class="group-title">
								{{ group.title }}
							</div>

							<ul class="children">
								<li
									v-for="child in group.links"
									:key="child.id"
								>
									<NuxtLink :href="child?.page ? `/${child.page.category.area.slug}/${child.page.category.slug}/${child.page.slug}` :(child.href ?? undefined)">
										{{ child?.page?.title ?? child.text }}
									</NuxtLink>
								</li>
							</ul>
						</li>
					</ul>
				</nav>

				<div class="base-divider" />

				<nav class="secondary container base-container">
					<small>&copy;{{ year }} Monospace Inc</small>

					<ul
						class="links"
					>
						<li
							v-for="child in data.footer.secondary_links"
							:key="child.id"
						>
							<NuxtLink :href="child?.page ? `/${child.page.category.area.slug}/${child.page.category.slug}/${child.page.slug}` :(child.href ?? undefined)">
								{{ child?.page?.title ?? child.text }}
							</NuxtLink>
						</li>
					</ul>
					<ul class="socials">
						<li
							v-for="service in data.footer.socials"
							:key="service.sort"
						>
							<NuxtLink :href="service.href">
								<Icon
									:name="service.icon"
									class="social-icon"
								/>
							</NuxtLink>
						</li>
					</ul>
				</nav>
			</footer>
		</div>
	</div>
</template>

<style scoped lang="scss">
.lined-wrap {
	border-top: 1px solid var(--border);
}

.base-container {
	/* Text sizes */
	--font-size-xs: 0.75rem; /* 12px */
	--font-size-sm: 0.875rem; /* 14px */
	--font-size-base: 1rem; /* 16px */
	--font-size-lg: 1.125rem; /* 18px */
	--font-size-xl: 1.25rem; /* 20px */
	--font-size-2xl: 1.5rem; /* 24px */
	--font-size-3xl: 1.875rem; /* 30px */
	--font-size-4xl: 2.5rem; /* 40px */
	--font-size-5xl: 3rem; /* 48px */
	--font-size-6xl: 3.75rem; /* 60px */
	--font-size-7xl: 4.5rem; /* 72px */
	--font-size-8xl: 6rem; /* 96px */
	--font-size-9xl: 8rem; /* 128px */

	--line-height-xs: 1rem; /* 16px */
	--line-height-sm: 1.25rem; /* 20px */
	--line-height-base: 1.5rem; /* 24px */
	--line-height-lg: 1.625rem; /* 26px */
	--line-height-xl: 1.75rem; /* 28px */
	--line-height-2xl: 2rem; /* 32px */
	--line-height-3xl: 2.5rem; /* 36px */
	--line-height-4xl: 3rem; /* 40px */
	--line-height-5xl: 3.5rem; /* 56px */
	--line-height-6xl: 1;
	--line-height-7xl: 1;
	--line-height-8xl: 1;
	--line-height-9xl: 1;

	/* Spacing Scale */
	--space-0: 0;
	--space-05: 0.125rem; /* 2px */
	--space-1: 0.25rem; /* 4px */
	--space-2: 0.5rem; /* 8px */
	--space-3: 0.75rem; /* 12px */
	--space-4: 1rem; /* 16px */
	--space-5: 1.25rem; /* 20px */
	--space-6: 1.5rem; /* 24px */
	--space-7: 1.75rem; /* 28px */
	--space-8: 2rem; /* 32px */
	--space-9: 2.25rem; /* 36px */
	--space-10: 2.5rem; /* 40px */
	--space-11: 2.75rem; /* 44px */
	--space-12: 3rem; /* 48px */
	--space-14: 3.5rem; /* 56px */
	--space-16: 4rem; /* 64px */
	--space-20: 5rem; /* 80px */
	--space-24: 6rem; /* 96px  */
	--space-28: 7rem; /* 112px */
	--space-32: 8rem; /* 128px */
	--space-36: 9rem; /* 144px */
	--space-40: 10rem; /* 160px */
	--space-44: 11rem; /* 176px */
	--space-48: 12rem; /* 192px */
	--space-52: 13rem; /* 208px */
	--space-56: 14rem; /* 224px */
	--space-60: 15rem; /* 240px */
	--space-64: 16rem; /* 256px */
	--space-72: 18rem; /* 288px */
	--space-80: 20rem; /* 320px */
	--space-96: 24rem; /* 384px */

	/* Border Radius */
	--rounded-none: 0;
	--rounded-sm: 0.125rem; /* 2px */
	--rounded: 0.25rem; /* 4px */
	--rounded-md: 0.375rem; /* 6px */
	--rounded-lg: 0.5rem; /* 8px */
	--rounded-xl: 0.75rem; /* 12px */
	--rounded-2xl: 1rem; /* 16px */
	--rounded-3xl: 1.5rem; /* 24px */
	--rounded-full: 9999px;

	/* Transitions */
	--ease-linear: linear;
	--ease-in: cubic-bezier(0.4, 0, 1, 1);
	--ease-out: cubic-bezier(0, 0, 0.2, 1);
	--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

	--duration-0: 0s;
	--duration-75: 75ms;
	--duration-100: 100ms;
	--duration-150: 150ms;
	--duration-200: 200ms;
	--duration-300: 300ms;
	--duration-500: 500ms;
	--duration-700: 700ms;
	--duration-1000: 1000ms;
}

.base-container :deep(> *) {
	/** acts as an overridable default */
	grid-column: standard;
}

.base-divider {
	--base-divider-color: var(--border);

	width: 100%;
	border-top: 1px solid var(--base-divider-color);
}

.footer-container {
	background-color: var(--background);
	padding-block: var(--space-10);
	padding-block-end: var(--space-5);
	margin-block-start: 0;
	font-weight: 500;
	line-height: 20px;

	:deep(.base-divider) {
		--base-divider-color: var(--border);
	}

	.page-section.bg-pristine-white + &,
	.page-section.bg-pristine-white-lines + & {
		border-top: 1px solid var(--border);
	}
}

.footer {
	font-size: var(--font-size-sm);
	line-height: var(--line-height-sm);

	small {
		font-size: var(--font-size-sm);
		line-height: var(--line-height-sm);
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	a {
		color: var(--typography-subdued);
		text-decoration: none;
		transition: color var(--duration-150) var(--ease-out);
		font-size: var(--font-size-sm);

		&:hover {
			transition: none;
			color: var(--typography);
			text-decoration: underline;
		}
	}

	.primary > ul {
		--columns: 1;
		--column-size: 1fr;

		padding-block-end: 2rem;
		display: grid;
		row-gap: var(--space-9);
		grid-template-columns: repeat(var(--columns), var(--column-size));

		@media (width > 25rem) {
			--columns: 2;
		}

		@media (width > 50rem) {
			--columns: 4;
		}

		@media (width > 75rem) {
			--columns: 6;
			column-gap: var(--space-10);
			row-gap: 0;
		}
	}

	.logo {
		svg {
			max-height: var(--space-9);
			margin-block-end: var(--space-2);
		}

		.description {
			color: var(--typography-subdued);

			line-height: 1.5;
			font-size: 14px;
			text-wrap: balance;
		}

		@media (width > 25rem) {
			grid-column: 1 / span 2;
		}

		@media (width > 50rem) {
			grid-column: 1 / span 4;
		}

		@media (width > 75rem) {
			grid-column: 1 / span 2;
		}
	}

	.group-title {
		margin-block-end: var(--space-1);

		@media (width > 50rem) {
			margin-block-end: var(--space-3);
		}

		@media (width > 75rem) {
			margin-block-end: var(--space-4);
		}
	}

	.children {
		li + li {
			margin-block-start: var(--space-1);
		}

		@media (width > 75rem) {
			li + li {
				margin-block-start: var(--space-2);
			}
		}
	}

	.base-divider {
		margin-block: var(--space-5);

		@media (width > 50rem) {
			margin-block-start: var(--space-20);
			margin-block-end: var(--space-5);
		}
	}

	.secondary {
		color: var(--typography-subdued);
		padding-block: var(--space-4);

		@media (width > 60rem) {
			display: flex;
			align-items: center;
			gap: var(--space-8);
		}

		.links {
			margin-block: var(--space-3);

			@media (width > 25rem) {
				display: flex;
				gap: var(--space-4);
				margin-block: var(--space-6);
			}

			@media (width > 60rem) {
				margin-block: 0;
				gap: var(--space-8);
			}
		}

		.socials {
			display: flex;
			gap: var(--space-6);
			flex-wrap: wrap;
			align-items: center;
			justify-content: space-between;

			.social-icon {
				width: var(--space-6);
				height: var(--space-6);
				color: var(--typography-subdued);
				transition: filter var(--duration-150) var(--ease-out);

				@media (width > 35rem) {
					width: var(--space-7);
					height: var(--space-7);
				}

				&:hover {
					transition: none;
					color: var(--typography);
				}
			}

			@media (width > 35rem) {
				justify-content: flex-start;
			}

			@media (width > 60rem) {
				margin-inline-start: auto;
				gap: var(--space-8);
			}
		}
	}
}
</style>
