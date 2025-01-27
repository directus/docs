---
id: 11a1c86f-36bf-4dd5-8bce-7eed75451514
slug: ai-santa-roast-app-with-directus-nuxt
title: How I Built an AI Open Source Santa Roast App with Directus and Nuxt
authors:
  - name: Bryant Gillespie
    title: Growth Engineer
description: Bryant breaks down how he built an AI-powered app that roasts developers based on their GitHub contributions.
---

Hey folks! Bryant here from Directus. In this post, I’ll walk you through our [Salty Open Source Santa](https://salty-santa.vercel.app) project - how we built it, why we built it, and all the fun little features we packed into this thing. Let's dive in!

<iframe style="width:100%; aspect-ratio:16/9; margin-bottom: 1em;" src="https://www.youtube.com/embed/aHHdh50hkG4" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

**What is Salty Open Source Santa?**

So what exactly is this thing? Well, it's basically the open source community's naughty or nice list. You write a letter to Santa, and he analyzes your public GitHub profile data to determine if your open source contributions were good enough to make the nice list. And then he writes you back a salty roast-style letter.

![Screenshot of OS Santa app](/img/os-salty-santa-2.png)

**You can check to see if you’re on Open Source Santa’s Naughty or Nice list at [https://salty-santa.vercel.app](https://salty-santa.vercel.app)**

## The Idea 💡

Like a lot of fun projects, this started with a simple conversation on Slack. My colleague John Daniels and I were brainstorming ideas for our Christmas promotion. Last year, we did a whole ["12 Days of CMS" thing](https://x.com/directus/status/1734671700296380579) where team members sang that dreadful song. And this year, I wanted to up the ante a bit.

![Conversation about formation of the Salty Santa app](/img/os-salty-santa-1.png)

John suggested scanning letters and having them transcribed. I’m way more of a smartass than John so I said "Hey, what if we make it snarkier? Like, you write a letter to Santa and he roasts you back?”

So with that direction, I built the first version in an episode of our ["100 Apps, 100 Hours" show on Directus TV](https://directus.io/tv/100-apps-100-hours).  Let's just say it wasn't as pretty as what you see now. Here’s what it looked like.

<div style="padding:56.25% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/1047153908?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media" style="position:absolute;top:0;left:0;width:100%;height:100%;" title="ai-letters-to-santa-preview"></iframe></div><script src="https://player.vimeo.com/api/player.js"></script>

But after recording the episode, I still couldn’t get the idea out of my head and I thought there was a lot more fun we could have with it. I scoped the features out a bit further with some brainstorming help from the fine folks on my team – Matt, Christina, and Lindsey.

**Here’s the additional feature list we came up with:**

- A scoring algorithm to be more fair who makes it onto the nice list
- An actual Nice list page to see which devs are in Santa’s good graces
- Roast a friend mode with suggestions from your GitHub organization
- A “Spicyness” Meter to rank the spiciest letters and increase enagement
- An animated naughty or nice “gauge” to build suspense while you wait on the letter
- Dynamic OG images that mimic a personalized letter from Santa to increase sharing
- And the cherry on top – Santa actually reads the letter aloud to you

*We’ll cover some of these features in-depth, but first let’s run the through the tech stack.*

## The Tech Stack 💾

Let's dive into the fun stuff - the actual tech that powers Santa’s roasts.

### Backend – Directus

We're using Directus for the backend (shocking, I know 😉). But it's actually a pretty lightweight data model and setup compared to other projects I’ve built. We've got just four collections:

```md
// Our main collections
- profiles (stores all the letters and scores)
- likes (for that spicy meter!)
- metrics (for storing calculated metrics on a daily basis)
- globals (help content, site title, etc.)
```

![Profiles saved in the Salty OS Santa Directus project](/img/os-salty-santa-4.png)

Under the hood, it's all sitting on a PostgreSQL database – hosted on [Directus Cloud](https://directus.cloud). Anytime I add a collection or field to my data model, Directus mirrors those changes to Postgres and updates the APIs automatically. Super handy when you're iterating quickly on a project like this.

All communication to the frontend is through a single Directus user name “Santa’s Helper” (gotta carry the theme 🤣🎅). Santa’s Helper authenticates using a static access token and has a single Access Policy called `Elves`.

![Users saved in the Salty OS Santa Directus project](/img/os-salty-santa-5.png)

The `Elves` policy has create, read, and update permissions on `profiles` and `likes`. And also read permissions for the `directus_` system collections in order to generate types using a helper Node script.

![Access policies in the Salty Santa Directus project](/img-salty-santa-6.png)

If you ever use this same pattern, just make sure you’re only using static access tokens for server-to-server comms. You don’t want to expose those to anyone on the frontend because of the elevated permissions that might be attached.

### Frontend – Nuxt

For the frontend, we're running with [Nuxt](https://nuxt.com).

We're using the alpha version of [Nuxt UI](https://ui.nuxt.com) (living dangerously, I know!). It's built on [RadixVue](https://www.radix-vue.com/) and [Tailwind CSS v4-beta](https://tailwindcss.com/blog/tailwindcss-v4-beta). The component library is fantastic - it gave us all these nice little UI pieces that we could customize for our holiday theme.

**Business Logic in Nuxt Server Routes**

We’re using Nuxt Server Routes pretty heavily in this project. They give us these nice, type-safe API endpoints that we proxy to the Directus API. And they add an extra layer of caching that we can leverage to reduce costs and improve performance since things like GitHub profile data don’t need to be realtime.

**Authentication with Nuxt Auth Utils**

Authentication is really simple and handled via a GitHub OAuth app and the [nuxt-auth-utils](https://github.com/atinux/nuxt-auth-utils) package.

We're not storing any sensitive GitHub data - we just need to know who's logged in so we can fetch their public profile data. The package handles all the OAuth flow, session management, and token refresh stuff for us.

We use session data to personalize the experience. Like when you're writing a letter to Santa, we can pre-fill it with your GitHub info if you're logged in, or show the friend mode UI if you're not.

The whole auth flow is super smooth:

1. Click "Sign in with GitHub"
2. GitHub OAuth popup appears
3. Authorize the app
4. Get redirected back with your session
5. Start roasting (or getting roasted by) Santa!

**Why Not Use Directus Auth?**

While Directus has a really robust authentication SSO providers (including GitHub), we deliberately went with `nuxt-auth-utils` for this project. Here's why… we didn't actually need "real" user accounts or any of the powerful permission features that Directus provides. We just needed a quick way to say "hey, this person is logged in with GitHub" so we could fetch their public profile data.

Plus, keeping the auth lightweight meant one less thing to configure in our Directus instance, which we're primarily using it as the store for all the letters and likes. Sometimes simpler is better.

### The AI Magic – Anthropic + Vercel AI SDK

For the AI part, we're using Anthropic's Claude 3.5 Sonnet. We actually tested this against a few different LLMs, and Claude just had this perfect balance of snark and humor that really nailed the Santa voice we were going for.

We're using the [Vercel AI SDK](https://sdk.vercel.ai/) to handle our Anthropic API calls, specifically their `generateObject` function which is super handy. Here's an example of how that might look below.

```typescript
import { z } from 'zod';
import { generateObject } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';

// Schema for the AI Payload to return proper JSON
export const aiPayloadSchema = z.object({
    letter: z.string().min(1), // The letter in Markdown format
    list: z.enum(['naughty', 'nice']), // The list the user belongs to
    flagged: z.boolean().optional(), // Was the letter flagged as inappropriate?
    flagged_reason: z.string().optional(), // Reason for why it was flagged
});

// Create the Anthropic client
const anthropic = createAnthropic({
    apiKey: config.anthropicApiKey as string,
});

// Generate the letter
const aiResponse = await generateObject({
    model: anthropic('claude-3-5-sonnet-20240620'),
    schema: aiPayloadSchema,
    maxTokens: 8192,
    messages: [{ role: 'user', content: prompt }],
});
```

The `generateObject` method from the Vercel AI forces Claude to return data in exactly the structure we want. We define our schema with Zod, and the SDK makes sure the AI response matches that structure. No more parsing weird JSON strings or weird edge cases dealing with malformed responses.

### Frontend Hosting – Vercel

The frontend is hosted with the big triangle company - Vercel. In my own testing across various Nuxt projects over the last year or two, I’ve found that deploying Nuxt 3 on Vercel usually “just works” more often than other providers. Other providers usually take me a little more time to debug and troubleshoot builds. Cost is definitely a concern though - especially if this thing gets really popular.

### The Fun Extras

There’s some other cool additional libraries that add those special touches.

- [**@tsparticles**](https://particles.js.org/) – powers the falling snow effect animation.
- [**@vueuse/sound**](https://github.com/vueuse/sound) – makes it super easy to add sound effects to any Vue.js app.
- [**micromark**](https://github.com/micromark/micromark) – to render markdown coming back from the LLM.

*Next up, let’s deep dive into the actual features.*

## The Feature List 🎅

### Naughty or Nice scoring algorithm ✅

The original version relied on the AI Santa to decide whether a developer made it onto the naughty or nice list. The roasts were hilarious but almost everyone was on the naughty list. Which didn’t feel “fair” to those who contribute a lot, so we had to figure out a way to fix it. 

After eliciting feedback from the team and our AI / LLM friends, we came back with this (way over-engineered 😅) algorithm.

**Base Points**

| **Data Point** | **Score** |
| --- | --- |
| Issues | 0.5 pts per issue |
| Commits | 1 pts per commit |
| Pull Requests | 2 pts per PR |
| Code Reviews | 3 pts per review |
| Followers | 2 pts per follower |
| Stars | 2 pts per star on owned repos |
| Sponsorships | 25 points per GitHub sponsorship (where you are the sponsor) |

**Modifiers**

- Abandoned Forks: -2 points for each forked repository not updated in 6+ months
- Popular Projects: 20% bonus (1.2×) for having any project with >500 stars
- Organization Membership: 10% bonus (1.1×) for being part of GitHub organizations

**Final Score**

- Users scoring 500+ points are classified as "nice"
- Users scoring below 500 points are classified as "naughty"

**Fetching user data with the GitHub GraphQL API**

We needed to grab a lot of different data points to calculate that naughty/nice score - commits, PRs, reviews, issues, followers, organizations, and more. With the GitHub REST API, we’d be making 6-10 separate API calls for each profile to get all the data we needed to properly score a profile.. 

With GraphQL, we can get it all in one shot.

```graphql
query getUserProfile($username: String!) {
  user(login: $username) {
    login
    name
    location
    twitterUsername
    url
    avatarUrl
    websiteUrl
    company
    bio
    readme: repository(name: $username) {
      object(expression: "HEAD:README.md") {
        ... on Blob {
          text
        }
      }
    }
    starredRepositories {
      totalCount
    }
    followers {
      totalCount
    }
    following {
      totalCount
    }
    organizations(first: 3, orderBy: {field: CREATED_AT, direction: DESC}) {
      nodes {
        name
        description
        url
        avatarUrl
		 membersWithRole(first: 10){
          nodes{
            name
            login
            avatarUrl
          }
        }
      }
    }
    repositories(visibility: PUBLIC, first: 10, ownerAffiliations: OWNER, orderBy: {field: PUSHED_AT, direction: DESC}) {
      totalCount
      nodes {
        forkCount
        isFork
        name
        description
        descriptionHTML
        url
        createdAt
        stargazerCount
        issues(states: OPEN) {
          totalCount
        }
        readme: object(expression: "HEAD:README.md") {
          ... on Blob {
            text
          }
        }
        pushedAt
        commitComments {
          totalCount
        }
      }
    }
    contributionsCollection(
      from: "2024-01-01T00:00:00Z"
      to: "2024-12-31T23:59:59Z"
    ) {
      totalRepositoryContributions
      totalRepositoriesWithContributedIssues
      totalRepositoriesWithContributedCommits
      totalCommitContributions
      totalIssueContributions
      totalPullRequestContributions
      totalPullRequestReviewContributions
    }
    sponsorshipsAsSponsor(activeOnly: true, first: 100) {
      totalCount
    }
  }
}
```

The data returned then gets fed into our custom scoring algorithm. Next, the resulting score and profile gets passed to the LLM. And finally the generated letter, score, and metadata is stored in Directus to be retrieved on the frontend.

Here’s what our complete `roast` Nuxt server endpoint looks like.

```tsx
// server/api/roast.post.ts

import { z } from 'zod';
import { generateObject } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';

import userQuery from '~~/server/graphql/getUserProfile';
import orgQuery from '~~/server/graphql/getOrgProfile';

import type { GitHubUserData } from '~~/server/graphql/getUserProfile';
import type { GitHubOrgData } from '~~/server/graphql/getOrgProfile';
import type { RoastResponse } from '#shared/types/endpoints.js';
import type { H3Error } from 'h3';

// Schema for the AI Payload to return proper JSON
export const aiPayloadSchema = z.object({
	letter: z.string().min(1), // The letter in Markdown format
	list: z.enum(['naughty', 'nice']), // The list the user belongs to
	flagged: z.boolean().optional(), // Was the letter flagged as inappropriate?
	flagged_reason: z.string().optional(), // Reason for why it was flagged
});

// Schema for the roast endpoint body
export const profileSchema = z.object({
	username: z.string().min(1),
	wishlist: z.string().optional(),
	type: z.enum(['user', 'organization']).optional().default('user'),
	mode: z.enum(['self', 'friend']).optional().default('self'),
	roasted_by: z.string().optional(),
	profileType: z.enum(['User', 'Organization']),
});

// Create the Anthropic client
const config = useRuntimeConfig();
const anthropic = createAnthropic({
	apiKey: config.anthropicApiKey as string,
});

export default defineEventHandler(async (event): Promise<RoastResponse | H3Error> => {
	const body = await readValidatedBody(event, (body) => profileSchema.parse(body));
	const { username, wishlist, mode, roasted_by, profileType } = body;

	// Check to see if the profile already exists in Directus if so, redirect to the profile
	const [directusResponse] = await directusServer.request(
		readItems('profiles', { filter: { username: { _eq: username } }, limit: 1 }),
	);

	if (directusResponse) {
		return {
			redirect: `/${username}`,
		};
	}

	// Check to see if the user is logged in to GitHub if not, don't allow them to submit a letter to save on costs
	const session = await requireUserSession(event);

	if (!session) {
		throw createError({
			statusCode: 401,
			message: 'Unauthorized. Please login to submit a letter to Santa.',
		});
	}

	try {
		const variables = { username };

		const response = await $fetch('https://api.github.com/graphql', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
				'Content-Type': 'application/json',
			},
			body: {
				query: profileType === 'User' ? userQuery : orgQuery,
				variables,
			},
		});

		const typedResponse = response as { data: { user?: GitHubUserData; organization?: GitHubOrgData } };

		const profileData =
			profileType === 'User'
				? (typedResponse.data.user as GitHubUserData)
				: (typedResponse.data.organization as GitHubOrgData);

		// Score the contributions based on the profile type
		const score = calculateNiceScore(profileData, profileType);

		const prompt = `
			You are the open source Santa Claus. You determine who's open source contributions are naughty or nice.
			Analyze the following Github ${profileType === 'User' ? 'user' : 'organization'}'s profile carefully and in detail.
			We've determined the ${profileType}'s score based on their contributions. Whether they're on the nice list
			or the naughty list, roast them accordingly. Write a short, funny letter in a snarky sarcastic tone.
			Include a couple lines from the wish list in the letter if it's provided.
			If the mode provided is "friend", then make a short mention of the roasted_by user in one of the paragraphs.

			STRUCTURE:
			- Intro
			- 3 short paragraphs
			- PS

			RULES:
			- Do NOT include a signature and like 'Yours, From Santa' in the letter.
			- The letter should be in Markdown format.
			- If someone uses profanity or asks for something inappropriate, do not roast them. Set the flagged field to true and provide a reason.

			Wish List: ${wishlist} ${mode === 'friend' ? `Note: Wishlist provided by ${roasted_by}` : ''}
			Profile: ${JSON.stringify(profileData)}
			Score: ${score}
			Mode: ${mode}
			Roasted By: ${roasted_by}
		`;

		const aiResponse = await generateObject({
			model: anthropic('claude-3-5-sonnet-20240620'),
			schema: aiPayloadSchema,
			maxTokens: 8192,
			messages: [{ role: 'user', content: prompt }],
		});

		// If the user has organizations and membersWithRoles exist, loop through the organizations and add the members to the metadata as possible_roasts
		const possibleRoasts: any[] = [];
		if (profileType === 'User' && (profileData as GitHubUserData).organizations?.nodes) {
			for (const org of (profileData as GitHubUserData).organizations.nodes ?? []) {
				if (org?.membersWithRole?.nodes) {
					possibleRoasts.push(...org.membersWithRole.nodes);
				}
			}
		}

		// Generate metadata to store with the profile
		const metadata = {
			ai_usage: aiResponse.usage,
			ai_response: aiResponse.object,
			score: score,
			possible_roasts: possibleRoasts,
		};

		// Store the profile in Directus
		const directusResponse = await directusServer.request(
			createItem('profiles', {
				username,
				letter: aiResponse.object.letter,
				list: score.list,
				wishlist,
				mode,
				score: score.finalScore,
				roasted_by,
				metadata,
				type: profileType,
			}),
		);

		return {
			redirect: `/${username}`,
			letter: directusResponse.letter,
			list: directusResponse.list,
			metadata: directusResponse.metadata,
			roasted_by: directusResponse.roasted_by,
			score: directusResponse.score,
			type: directusResponse.type,
			mode: directusResponse.mode,
			username: directusResponse.username,
			wishlist: directusResponse.wishlist,
		};
	} catch (error) {
		console.error(JSON.stringify(error));
		throw createError({
			statusCode: 500,
			message: 'Failed to roast profile',
		});
	}
});

```

### Spicyness Meter ✅

We wanted a way for users to engage with letters other than their own and cast a vote on the spiciest letters, so we created the spicemeter. You can increase your opinion of the spiciness by left-clicking or decrease by right-clicking. [These go to eleven.](https://www.youtube.com/watch?v=4xgx4k83zzc)

![Level of spicy-ness set to 7](/img/os-salty-santa-11.png)

The inspiration for this was taken from [Josh Comeau](https://www.joshwcomeau.com/) and his awesome blog. Instead of a simple like button, there’s an interactive heart button that you can mash up to 16 times.

![Heart button on Josh Comeau's blog](/img/os-salty-santa-10.png)

It seems like such a simple interaction until you factor in that each person should only get X number of likes on any given post. Here’s how it works.

- We get the IP from the request `x-forwarded-for` header
- We keep that secure by creating a hash of the IP.
- We store the hash and the count in our `likes` Directus collection to track individual user interactions

```tsx
// server/api/profiles/[username]/likes.post.ts
import type { LikesResponse } from '~~/shared/types/endpoints.js';

export default defineEventHandler(async (event): Promise<LikesResponse> => {
	const username = getRouterParam(event, 'username');

	if (!username) throw createError({ statusCode: 400, message: 'Missing username. username is required.' });

	const ip =
		(event.node.req.headers['x-forwarded-for'] as string) ||
		(event.node.req.headers['x-vercel-forwarded-for'] as string);

	const visitorHash = createVisitorHash(ip, process.env.SALT as string);

	try {
		// Get existing profile with all likes
		const existingProfile = await directusServer.request(
			readItem('profiles', username, {
				fields: [
					'username',
					{
						likes: ['id', 'visitor_hash', 'profile', 'count'],
					},
				],
			}),
		);

		if (!existingProfile) {
			throw createError({ statusCode: 404, message: 'Profile not found.' });
		}

		// Get user's specific like record
		const userLike = existingProfile.likes?.find(like => like.visitor_hash === visitorHash);

		const body = await readBody(event);
		const newCount = Math.min(Math.max(body.count || 0, 0), 11);

		let like;

		if (userLike) {
			// Update existing like record
			like = await directusServer.request(
				updateItem('likes', userLike.id, {
					profile: existingProfile.username,
					count: newCount,
				}),
			);
		} else {
			// Create new like record
			like = await directusServer.request(
					createItem('likes', {
						profile: existingProfile.username,
						visitor_hash: visitorHash,
						count: newCount,
					}),
			);
		}

		// Calculate total likes by summing all likes
		const totalLikes = existingProfile.likes?.reduce((sum, like) => {
			// If this is the user's like, use the new count
			if (like.visitor_hash === visitorHash) {
				return sum + newCount;
			}
			return sum + (like.count || 0);
		}, 0);

		const response: LikesResponse = {
			username: existingProfile.username,
			totalLikes: totalLikes || 0,
			userLikeCount: newCount,
		};

		return response;
	} catch (error) {
		console.error('Error updating like count:', error);
		throw createError({
			statusCode: 500,
			message: 'Failed to update like count.',
		});
	}
});

```

### The Nice List ✅

After you figure out if you’re on the naughty or nice list, you might want to see if your friends made the list next. So we build a page to show each list side by side, sorted by the number of likes or “spice level”.

![Open source Santa's List](/img/os-salty-santa-8.png)

We use [cached event handlers](https://nitro.build/guide/cache#cached-event-handlers) from Nuxt / Nitro here to cache the data for a short period of time to prevent hammering the Directus API if there’s a lot of users on the page.

After hearing feedback from teammates about privacy concerns, we added a simple switch that lets users opt out of appearing on the public list.

![Opt out button for users](/img/os-salty-santa-9.png)

### Dynamic OG Images ✅

Fun social sharing / OG images seem to have become a thing in my projects. And if I’m building a Nuxt project - I always reach for the [`nuxt-og-image` module](https://github.com/nuxt-modules/og-image) by rockstar Harlan Wilton. 

![OS Salty Santa OG Image on social media](/img/os-salty-santa-7.png)

It’s as simple as creating a separate Vue component for image design and then calling `defineOgImageComponent` in your Nuxt page.

```tsx
// app/components/OgImage/Username.vue
<script setup lang="ts">
const props = withDefaults(
	defineProps<{
		username?: string;
		avatarUrl?: string;
	}>(),
	{
		username: 'random_hacker_323',
	},
);
</script>

<template>
	<div class="w-full h-full flex flex-col bg-red-900 p-12">
		<!-- do template-y stuff here -->
		</div>
</template>
```

```tsx
// app/pages/[username].vue
<script setup lang="ts">
const username = computed(() => route.params.username);
const avatarUrl = computed(() => `https://github.com/${username.value}.png`);

defineOgImageComponent('Username', {
	username: username.value,
	avatarUrl: avatarUrl.value,
});
</script>
```

There can still be a few gotchas depending on the rendering method and the host you’re using. I almost always end up add the `sharp` module as a dependency. This site is using SSR and hosted on Vercel and 🤞 we haven’t had any major issues yet.

### Santa Reads Aloud ❌

Some features just don’t make the final cut. This one got axed not because it didn’t work or wasn’t awesome - but for cost purposes.

Mr [Pedro Pizzaro](https://directus.io/team/pedro-pizarro) – one of our AEs is freaking awesome at voiceover. And he recorded a custom salty sample voice that we used to create a custom voice at [ElevenLabs](https://elevenlabs.io). 

Once you sent your letter to Santa, we’d send the generated text to their API to generate speech and then play it back to you on your profile page. But the amount of credits we’d burn through made it too expensive to include.

But fear not - here’s a sample of what could have been.

<audio controls>
  <source src="https://product-team.directus.app/assets/c856d836-7ef6-4ff6-8961-152b3156c49f.mp3" type="audio/mpeg">
  Your browser does not support the audio element.
</audio>

## Salty Santa FAQs ❓

### **How long did it take to build?**

From idea to launch has been about **3 weeks** of time. That’s not really the total build time just the elapsed time since work started onit.

I’d estimate I’ve spent a solid 30 hours of time “in-the-seat” actually building, testing and improving this thing. The majority of that in the frontend interaction, prompt engineering, and the scoring algorithm.

### What does it cost to run?

Because we’re fetching a lot of data like repositories and their readmes, the input token count in quite high. The average input token count is around ~9,977 tokens. This varies a lot based on the users repos and readme content. 

Output is a totally different story – averaging around ~360 tokens since we’re just outputting the letter (mostly).

That brings the **cost to ~$0.035 per profile roasted**. Or put a different way - every 1000 roasts would cost us about $35. 

We may tweak our data fetching and adjust our prompts to attempt to lower this if it becomes really popular.

## Santa’s Summary

This thing was a blast to build and I hope this a super-helpful write up for your own projects. Be sure to check out the live project at https://salty-santa.vercel.app. 

Let us know your feedback. And shoot us your ideas for the next fun build.
