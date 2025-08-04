const filledIcons = [
	'all_inclusive',
	'apartment',
	'api',
	'api',
	'arrow_back',
	'arrow_forward',
	'arrow_outward',
	'autopay',
	'autostop',
	'avg_pace',
	'cached',
	'check',
	'checklist',
	'checklist_rtl',
	'close',
	'cloudy',
	'code',
	'compare_arrows',
	'cruelty_free',
	'dynamic_feed',
	'electrical_services',
	'emoji_people',
	'expand_less',
	'expand_more',
	'full_stacked_bar_chart',
	'functions',
	'globe_uk',
	'home_app_logo',
	'horizontal_rule',
	'laps',
	'link',
	'image_search',
	'insights',
	'login',
	'menu_rounded',
	'money_off',
	'monitoring',
	'online_prediction',
	'open_in_new',
	'password',
	'partner_exchange',
	'post_add',
	'public',
	'published_with_changes',
	'query_stats',
	'repeat',
	'search',
	'security',
	'sort_by_alpha',
	'sports_martial_arts',
	'support',
	'sync_alt',
	'timeline',
	'translate',
	'trending_up',
	'update',
	'webhook',
	'work',
	'support_agent',
	'edit_sharp',
];

export function getIconName(name: string): string | undefined {
	if (!name) return;
	// Convert the icon coming from the API to the name of the icon component
	// Directus uses Google Material Icons and the icon values are snake_case (e.g. "account_circle")
	const prefix = 'material-symbols:';
	// Change snake case to kebab case
	const kebabCase = name.replace(/_/g, '-');
	// If the icon is one of the filled icons, do not add the suffix '-outline'. Needed because of descrepancies between the Google Material Font we use in Directus icon interface and the Iconify library.
	const iconName = prefix + kebabCase + (filledIcons.includes(name) ? '' : '-outline');
	return iconName;
}
