import { METHODS } from '~/constants';

export default function (method: string): method is typeof METHODS[number] {
	return METHODS.includes(method as typeof METHODS[number]);
}
