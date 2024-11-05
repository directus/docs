<script setup lang="ts">
const boxes = [
	{
		title: 'Data Engine',
		description: 'APIs and developer tools for your data.',
		color: 'purple',
		products: ['connect', 'realtime', 'auth', 'automate'],
	},
	{
		title: 'Data Studio',
		description: 'A data web app your whole team will love.',
		color: 'pink',
		products: ['explore', 'editor', 'insights', 'files'],
	},
] as const;
</script>

<template>
	<div class="two-columns">
		<div
			v-for="box in boxes"
			:key="box.title"
			class="box"
			:class="box.color"
		>
			<h2>{{ box.title }}</h2>
			<p>{{ box.description }}</p>
			<div class="products">
				<div
					v-for="product in box.products"
					:key="product"
				>
					<NuxtLink :to="products[product].paths.path">
						<Button
							type="span"
							color="white"
							size="small"
							class="button-dark-mode-override"
						>
							<ProductLink
								:product="product"
								:link="false"
								:color="box.color"
								class="product-link"
							/>
						</Button>
					</NuxtLink>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.two-columns {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 1rem;
}

@media (max-width: 1200px) {
	.two-columns {
		grid-template-columns: 1fr;
	}
}

@media (max-width: 1024px) {
	.two-columns {
		grid-template-columns: repeat(2, 1fr);
	}
}

@media (max-width: 970px) {
	.two-columns {
		grid-template-columns: 1fr;
	}
}

.button-dark-mode-override {
	background-color: color-mix(in hsl shorter hue, var(--white) 95%, var(--black) 5%) !important;
	border-color: color-mix(in hsl shorter hue, var(--white) 95%, var(--black) 5%) !important;
}

.purple {
	background-image: url("~/assets/img/purple-cta-bg.svg");
}

.pink {
	background-image: url("~/assets/img/pink-cta-bg.svg");
}

.box {
	background-position: center top;
	border: 1px solid var(--border);
	border-radius: calc(var(--border-radius) * 2);
	padding: 1.5rem;
	color: white;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	margin-top: 0;
	margin-bottom: 0;
	h2 {
		font-weight: 600;
		font-size: 1.5rem;
		margin: 4px 0 0;
		line-height: 1;
	}
	p {
		margin: 0.5rem 0;
	}
	.products {
		display: flex;
		align-items: center;
		justify-content: start;
		flex-wrap: wrap;
		gap: 1rem;
		padding-top: 2rem;

	}
}
</style>
