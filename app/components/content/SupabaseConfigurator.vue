<script setup lang="ts">
const host = ref('db.your-project-ref.supabase.co');
const port = ref('5432');
const database = ref('postgres');
const user = ref('postgres');

const uriInput = ref('');
const showUriInput = ref(false);
const uriError = ref('');
const isCopied = ref(false);
const isDownloaded = ref(false);

function parseUri() {
	const uri = uriInput.value.trim();
	uriError.value = '';

	if (!uri) return;

	const match = uri.match(/^(?:postgresql|postgres):\/\/([^:@]+)(?::[^@]*)?@([^:/]+)(?::(\d+))?(?:\/([^?#]*))?/);

	if (match) {
		const [, parsedUser, parsedHost, parsedPort, parsedDatabase] = match;
		if (parsedUser) user.value = parsedUser;
		if (parsedHost) host.value = parsedHost;
		if (parsedPort) port.value = parsedPort;
		if (parsedDatabase) database.value = parsedDatabase;
		uriInput.value = '';
		showUriInput.value = false;
	}
	else {
		uriError.value = 'Could not parse that URI — make sure it starts with postgresql:// or postgres://';
	}
}

const dockerCompose = computed(() => `services:
  directus:
    image: directus/directus:11.17.0
    ports:
      - 8055:8055
    environment:
      SECRET: "replace-with-a-random-string"
      PUBLIC_URL: "http://localhost:8055"
      DB_CLIENT: "pg"
      DB_HOST: "${host.value}"
      DB_PORT: "${port.value}"
      DB_DATABASE: "${database.value}"
      DB_USER: "${user.value}"
      DB_PASSWORD: "YOUR-DATABASE-PASSWORD"
      DB_SSL: "true"
      DB_SSL__REJECT_UNAUTHORIZED: "true"`);

async function copyToClipboard() {
	try {
		await navigator.clipboard.writeText(dockerCompose.value);
		isCopied.value = true;
		setTimeout(() => { isCopied.value = false; }, 2000);
	}
	catch {
		// Silently fail
	}
}

function downloadFile() {
	const blob = new Blob([dockerCompose.value], { type: 'text/yaml' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = 'docker-compose.yml';
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
	isDownloaded.value = true;
	setTimeout(() => { isDownloaded.value = false; }, 2000);
}
</script>

<template>
	<ClientOnly>
		<div class="not-prose my-6 space-y-4">
			<!-- Connection fields -->
			<UCard>
				<template #header>
					<p class="text-sm font-semibold">
						Configure your connection details
					</p>
				</template>

				<div class="space-y-4">
					<div class="flex flex-col gap-1.5">
						<label class="text-xs font-medium text-muted">Host</label>
						<UInput
							v-model="host"
							placeholder="db.your-project-ref.supabase.co"
							class="font-mono"
						/>
					</div>

					<div class="grid grid-cols-3 gap-3">
						<div class="flex flex-col gap-1.5">
							<label class="text-xs font-medium text-muted">Port</label>
							<UInput
								v-model="port"
								placeholder="5432"
								class="font-mono"
							/>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-xs font-medium text-muted">Database</label>
							<UInput
								v-model="database"
								placeholder="postgres"
								class="font-mono"
							/>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-xs font-medium text-muted">User</label>
							<UInput
								v-model="user"
								placeholder="postgres"
								class="font-mono"
							/>
						</div>
					</div>

					<div class="border-t border-default pt-3">
						<UButton
							variant="ghost"
							size="xs"
							color="neutral"
							:trailing-icon="showUriInput ? 'material-symbols:keyboard-arrow-up' : 'material-symbols:keyboard-arrow-down'"
							@click="showUriInput = !showUriInput"
						>
							{{ showUriInput ? 'Hide URI input' : 'Paste a connection URI to auto-fill' }}
						</UButton>

						<div
							v-if="showUriInput"
							class="mt-3 space-y-2"
						>
							<UTextarea
								v-model="uriInput"
								placeholder="postgresql://user:password@host:5432/database"
								:rows="2"
								class="w-full font-mono text-xs"
							/>
							<div class="flex items-center gap-3">
								<UButton
									size="xs"
									@click="parseUri"
								>
									Auto-fill from URI
								</UButton>
								<p
									v-if="uriError"
									class="text-xs text-error"
								>
									{{ uriError }}
								</p>
							</div>
						</div>
					</div>
				</div>
			</UCard>

			<!-- Password warning -->
			<UAlert
				icon="material-symbols:warning-outline"
				color="warning"
				title="Replace the password before use"
				description="The generated file uses YOUR-DATABASE-PASSWORD as a placeholder. Edit the file and replace it with your actual Supabase database password before running docker compose up."
			/>

			<!-- Generated docker-compose.yml -->
			<UCard>
				<template #header>
					<div class="flex items-center justify-between">
						<code class="text-sm">docker-compose.yml</code>
						<div class="flex gap-2">
							<UButton
								size="xs"
								variant="outline"
								color="neutral"
								:leading-icon="isCopied ? 'material-symbols:check' : 'material-symbols:content-copy-outline'"
								:label="isCopied ? 'Copied!' : 'Copy'"
								@click="copyToClipboard"
							/>
							<UButton
								size="xs"
								variant="outline"
								color="neutral"
								leading-icon="material-symbols:download"
								:label="isDownloaded ? 'Downloaded!' : 'Download'"
								@click="downloadFile"
							/>
						</div>
					</div>
				</template>

				<pre class="overflow-x-auto text-xs leading-relaxed"><code>{{ dockerCompose }}</code></pre>
			</UCard>
		</div>
	</ClientOnly>
</template>
