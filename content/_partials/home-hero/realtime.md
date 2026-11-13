```typescript
import { createDirectus, authentication, realtime } from '@directus/sdk'
const directus = createDirectus('https://directus.example.com').with(authentication()).with(realtime());

await directus.setToken('access_token');
await directus.connect();

const { subscription } = await directus.subscribe('messages');

for await (const item of subscription) {
	console.log(item);
};
```
