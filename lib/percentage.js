import config from '#lib/config';
import {singleton} from '#lib/utils';

/**
* Export a human readable percentage based on the current locale
* @param {*} v The value to format
* @param {Object} [options] Options to mutate behaviour
* @param {Number} [options.dp=2] Decimal place precision to use, set to falsy to only show integers
* @param {Boolean} [options.pad=true] If using a non-falsy `dp` also force decimal places to the same length
* @param {Boolean} [options.float=flase] Treat the incomming number as a floating value - i.e. times it by 100
* @returns {String} The formatted percentage string
*/
export default function percentage(v, options) {
	let settings = {
		float: false,
		dp: 0,
		pad: false,
		...options,
	};
	if (!settings.float) v /= 100;

	// return percentageFormatterDp[settings.dp || 0].format(v)
	return singleton(Intl.NumberFormat, config.settings.locale, {
		style: 'percent',
		minimumFractionDigits: settings.dp && settings.pad ? settings.dp : 0,
		maximumFractionDigits: settings.dp,
		roundingPriority: settings.dp ? 'morePrecision' : 'auto',
	}).format(v);
}
