<script setup lang="ts">
const host = ref('db.your-project-ref.supabase.co');
const port = ref('5432');
const database = ref('postgres');
const user = ref('postgres');

const uriInput = ref('');
const showUriInput = ref(false);
const uriError = ref('');
const activeOutput = ref('compose');

const isCopiedCompose = ref(false);
const isDownloadedCompose = ref(false);
const isCopiedEnv = ref(false);
const isDownloadedEnv = ref(false);

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
    image: directus/directus:11.17.4
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
      DB_SSL__REJECT_UNAUTHORIZED: "false"`);

const envFile = computed(() => `# Supabase Postgres (direct connection)
DB_HOST=${host.value}
DB_PORT=${port.value}
DB_DATABASE=${database.value}
DB_USER=${user.value}
DB_PASSWORD=YOUR-DATABASE-PASSWORD
DB_SSL__REJECT_UNAUTHORIZED=false

# Directus URL — must match the address you open in the browser
PUBLIC_URL=http://localhost:8055`);

async function copyCompose() {
	try {
		await navigator.clipboard.writeText(dockerCompose.value);
		isCopiedCompose.value = true;
		setTimeout(() => { isCopiedCompose.value = false; }, 2000);
	}
	catch { /* Silently fail */ }
}

function downloadCompose() {
	triggerDownload(dockerCompose.value, 'docker-compose.yml', 'text/yaml');
	isDownloadedCompose.value = true;
	setTimeout(() => { isDownloadedCompose.value = false; }, 2000);
}

async function copyEnv() {
	try {
		await navigator.clipboard.writeText(envFile.value);
		isCopiedEnv.value = true;
		setTimeout(() => { isCopiedEnv.value = false; }, 2000);
	}
	catch { /* Silently fail */ }
}

function downloadEnv() {
	triggerDownload(envFile.value, '.env', 'text/plain');
	isDownloadedEnv.value = true;
	setTimeout(() => { isDownloadedEnv.value = false; }, 2000);
}

function triggerDownload(content: string, filename: string, mime: string) {
	const blob = new Blob([content], { type: mime });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
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
				description="Both files use YOUR-DATABASE-PASSWORD as a placeholder. Replace it with your actual Supabase database password before running the stack."
			/>

			<!-- Generated output with file tabs -->
			<div class="rounded-lg border border-default overflow-hidden">
				<!-- Tab bar -->
				<div class="flex items-center justify-between bg-muted/50 border-b border-default pl-2 pr-3 pt-1.5">
					<div class="flex gap-1">
						<button
							class="px-3 py-1.5 text-xs font-mono rounded-t-md border border-b-0 -mb-px transition-colors"
							:class="activeOutput === 'compose'
								? 'bg-default border-default text-default'
								: 'border-transparent text-muted hover:text-default'"
							@click="activeOutput = 'compose'"
						>
							docker-compose.yml
						</button>
						<button
							class="px-3 py-1.5 text-xs font-mono rounded-t-md border border-b-0 -mb-px transition-colors"
							:class="activeOutput === 'env'
								? 'bg-default border-default text-default'
								: 'border-transparent text-muted hover:text-default'"
							@click="activeOutput = 'env'"
						>
							.env
						</button>
					</div>

					<div class="flex gap-2 pb-1.5">
						<template v-if="activeOutput === 'compose'">
							<UButton
								size="xs"
								variant="outline"
								color="neutral"
								:leading-icon="isCopiedCompose ? 'material-symbols:check' : 'material-symbols:content-copy-outline'"
								:label="isCopiedCompose ? 'Copied!' : 'Copy'"
								@click="copyCompose"
							/>
							<UButton
								size="xs"
								variant="outline"
								color="neutral"
								leading-icon="material-symbols:download"
								:label="isDownloadedCompose ? 'Downloaded!' : 'Download'"
								@click="downloadCompose"
							/>
						</template>
						<template v-else>
							<UButton
								size="xs"
								variant="outline"
								color="neutral"
								:leading-icon="isCopiedEnv ? 'material-symbols:check' : 'material-symbols:content-copy-outline'"
								:label="isCopiedEnv ? 'Copied!' : 'Copy'"
								@click="copyEnv"
							/>
							<UButton
								size="xs"
								variant="outline"
								color="neutral"
								leading-icon="material-symbols:download"
								:label="isDownloadedEnv ? 'Downloaded!' : 'Download'"
								@click="downloadEnv"
							/>
						</template>
					</div>
				</div>

				<!-- Code content -->
				<pre
					v-if="activeOutput === 'compose'"
					class="p-4 overflow-x-auto text-xs leading-relaxed"
				><code>{{ dockerCompose }}</code></pre>
				<pre
					v-else
					class="p-4 overflow-x-auto text-xs leading-relaxed"
				><code>{{ envFile }}</code></pre>
			</div>
		</div>
	</ClientOnly>
</template>
