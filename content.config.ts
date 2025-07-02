import { defineContentConfig, defineCollection, z } from '@nuxt/content';

export default defineContentConfig({
	collections: {
		landing: defineCollection({
			type: 'page',
			source: 'index.md',
		}),
		content: defineCollection({
			type: 'page',
			source: {
				include: '**',
				exclude: ['index.md'],
			},
			schema: z.object({
				title: z.string(),
				description: z.string().optional(),
				headline: z.string().optional(),
				authors: z.array(z.object({
					name: z.string(),
					title: z.string(),
				})).optional(),
				icon: z.string().optional(),
				technologies: z.array(z.string()).optional(),
				links: z.array(z.object({
					label: z.string(),
					icon: z.string(),
					to: z.string(),
					target: z.string().optional(),
				})).optional(),
				rawbody: z.string(),
			}),
		}),
	},
});
