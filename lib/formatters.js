import bytes, {default as formatBytes} from '#lib/bytes';
import byUnit, {default as formatByUnit} from '#lib/byUnit';
import config from '#lib/config';
import format from '#lib/format';
import list, {listAnd, listOr, default as formatList, listAnd as formatListAnd, listOr as formatListOr} from '#lib/list';
import number, {default as formatNumber} from '#lib/number';
import pluralize, {default as formatPlural} from '#lib/pluralize';
import relativeTime, {default as formatRelativeTime} from '#lib/relativeTime';
import setLocale from '#lib/setLocale';

// Export a global object with subkeys
export default {
	bytes,
	formatBytes,
	config,
	byUnit,
	format,
	formatByUnit,
	list,
	formatList,
	listAnd,
	formatListAnd,
	listOr,
	formatListOr,
	number,
	formatNumber,
	pluralize,
	formatPlural,
	relativeTime,
	formatRelativeTime,
	setLocale,
}

// Named direct exports
export {
	bytes,
	formatBytes,
	config,
	byUnit,
	format,
	formatByUnit,
	list,
	formatList,
	listAnd,
	formatListAnd,
	listOr,
	formatListOr,
	number,
	formatNumber,
	pluralize,
	formatPlural,
	relativeTime,
	formatRelativeTime,
	setLocale,
}
