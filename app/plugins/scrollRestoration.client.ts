import { scrollPositions } from '~/router.options';

export default defineNuxtPlugin(() => {
	const router = useRouter();

	router.beforeEach(() => {
		const key = window.history.state?.key as string | undefined;
		const scroller = document.getElementById('docs-scroll');
		if (key && scroller) {
			scrollPositions.set(key, scroller.scrollTop);
		}
	});
});
