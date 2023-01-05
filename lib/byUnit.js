import formatters from '#lib/formatters';

export default function byUnit(v, unit) {
	switch (unit) {
		case 'bytes':
			return formatters.bytes(v);
		case 'number':
			return formatters.number(v);
		case 'timeMs': // Aka - Duration in MS
			return formatters.relativeTime(Date.now() - v);
		default:
			throw new Error(`Unit "${unit}" not supported`);
	}
}
