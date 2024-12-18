import { methods } from '~/constants';

export default function (method: string): method is typeof methods[number] {
	return methods.includes(method as typeof methods[number]);
}
