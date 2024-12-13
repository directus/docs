```typescript
import { createDirectus, rest, registerUser, authentication } from '@directus/sdk';
const directus = createDirectus('https://directus.example.com').with(rest()).with(authentication());

const newUser = await directus.request(
	registerUser({
		email: 'user@example.com',
		password: 'd1r3ctu5'
	})
);

const user = await directus.login('user@example.com', 'd1r3ctu5');
```
