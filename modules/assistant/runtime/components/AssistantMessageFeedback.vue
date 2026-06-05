<script setup lang="ts">
import type { UIMessage } from 'ai';

const props = defineProps<{
	message: UIMessage;
	surveyId: string;
}>();

const { $posthog } = useNuxtApp();

const submitted = ref<1 | 2 | null>(null);
const submissionId = ref<string | null>(null);
const shownTracked = ref(false);
const copied = ref(false);
let copyTimeout: ReturnType<typeof setTimeout> | undefined;

const messageText = computed(() =>
	(props.message.parts ?? [])
		.flatMap(p => (p.type === 'text' ? [p.text] : []))
		.join('\n\n')
		.trim(),
);

const traceId = computed(() => {
	const part = props.message.parts?.find(p => p.type === 'data-trace-id') as { data?: { traceId?: string } } | undefined;
	return part?.data?.traceId ?? null;
});

const hasText = computed(() =>
	props.message.parts?.some(p => p.type === 'text' && p.text.trim().length > 0) ?? false,
);

const followupAnchorId = computed(() => `assistant-feedback-${props.message.id}`);

async function copyResponse() {
	const text = messageText.value;
	if (!text) return;
	try {
		await navigator.clipboard.writeText(text);
		copied.value = true;
		if (copyTimeout) clearTimeout(copyTimeout);
		copyTimeout = setTimeout(() => {
			copied.value = false;
		}, 2000);
	}
	catch (error) {
		console.warn('[assistant] copy failed', error);
	}
}

watch([traceId, hasText], ([id, ready]) => {
	if (!props.surveyId || !id || !ready || shownTracked.value) return;
	shownTracked.value = true;
	$posthog?.capture('survey shown', {
		$survey_id: props.surveyId,
		$ai_trace_id: id,
	});
}, { immediate: true });

function newSubmissionId(): string {
	if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
	return `sub_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

const RATING_QUESTION_ID = 'c4d9628a-c974-489e-a198-24fba849d695';

// PostHog rating-question values for this survey: 1 = thumbs up (positive, ends survey), 2 = thumbs down (negative, branches to follow-up).
function rate(rating: 1 | 2) {
	if (!props.surveyId || submitted.value || !traceId.value) return;
	submitted.value = rating;
	submissionId.value = newSubmissionId();

	$posthog?.capture('survey sent', {
		$survey_id: props.surveyId,
		$survey_response: rating,
		[`$survey_response_${RATING_QUESTION_ID}`]: rating,
		$ai_trace_id: traceId.value,
		$survey_submission_id: submissionId.value,
		$survey_completed: rating === 1,
	});

	if (rating === 2) {
		nextTick(() => showFollowupSurvey());
	}
}

function showFollowupSurvey() {
	if (!$posthog) return;
	const selector = `#${followupAnchorId.value}`;
	if (!document.querySelector(selector)) return;
	$posthog.renderSurvey(props.surveyId, selector);
}
</script>

<template>
	<div
		v-if="hasText"
		class="flex flex-col gap-2"
	>
		<div class="flex items-center gap-1">
			<template v-if="surveyId && traceId">
				<UTooltip text="Helpful">
					<UButton
						icon="material-symbols:thumb-up-outline"
						:color="submitted === 1 ? 'primary' : 'neutral'"
						variant="ghost"
						size="lg"
						square
						:ui="{ base: 'rounded-md' }"
						:disabled="submitted !== null"
						aria-label="Mark response helpful"
						@click="rate(1)"
					/>
				</UTooltip>
				<UTooltip text="Not helpful">
					<UButton
						icon="material-symbols:thumb-down-outline"
						:color="submitted === 2 ? 'primary' : 'neutral'"
						variant="ghost"
						size="lg"
						square
						:ui="{ base: 'rounded-md' }"
						:disabled="submitted !== null"
						aria-label="Mark response not helpful"
						@click="rate(2)"
					/>
				</UTooltip>
			</template>
			<UTooltip :text="copied ? 'Copied' : 'Copy response'">
				<UButton
					:icon="copied ? 'material-symbols:check' : 'material-symbols:content-copy-outline'"
					color="neutral"
					variant="ghost"
					size="lg"
					square
					:ui="{ base: 'rounded-md' }"
					aria-label="Copy response"
					@click="copyResponse"
				/>
			</UTooltip>
		</div>
		<div
			v-show="submitted === 2"
			:id="followupAnchorId"
		/>
	</div>
</template>
