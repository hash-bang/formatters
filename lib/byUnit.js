import formatters from '#lib/formatters';

export default function byUnit(v, unit) {
	switch (unit) {
		case 'bytes':
			return formatters.bytes(v);
		case 'number':
			return formatters.number(v);
		case 'timeMs':
			return formatters.relativeTime(v);
		default:
			throw new Error(`Unit "${unit} not supported`);
	}
}
