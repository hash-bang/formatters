import bytes from '#lib/bytes';
import byUnit from '#lib/byUnit';
import config from '#lib/config';
import list, {listAnd, listOr} from '#lib/list';
import number from '#lib/number';
import relativeTime from '#lib/relativeTime';
import setLocale from '#lib/setLocale';

export default {
	bytes,
	config,
	formatBytes: bytes,
	byUnit,
	list,
	listAnd,
	listOr,
	number,
	formatNumber: number,
	relativeTime,
	formatRelativeTime: relativeTime,
	setLocale,
}
