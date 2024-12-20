export default function (val: string): string {
	return val
		.replace(/[!"#$%&'()*+,/:;<=>?@[\\\]^`{|}~]/g, '')
		.replace(/(\s|\.)/g, '-')
		.replace(/<(?:.|\n)*?>/gm, '')
		.replace(/—/g, '--')
		.replace(/-{2,}/g, '-')
		.toLowerCase();
}
