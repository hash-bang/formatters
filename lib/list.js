import config from '#lib/config';
import pluralize from '#lib/pluralize';
import {singleton} from '#lib/utils';

/**
* Return a list of items (with a conjuction - i.e. 'AND') style
* If neither `options.and` or `options.or` is specified a conjuction (i.e. 'and') is assumed
*
* @param {Array<String>} v Array of items to format
* @param {Object} [options] Options to mutate behaviour
* @param {Boolean} [options.and=false] Join items using a conjuction (i.e. 'and')
* @param {Boolean} [options.or=false] Join items using a disjunction (i.e. 'or')
* @param {Number} [options.cutoff=0] Stop outputting items after this number and instead add `options.cutoffPlural` to the suffix
* @param {String} [options.cutoffPlural='other[s]'] `pluralize()` compatible string to output if there are any more items after the `options.cutOff` value
* @param {Boolean|String} [options.quote=false] Whether to quote all contents of the array (i.e. surround with speachmarks). If a string, this specifies the surrounding strings instead of `"`
* @returns {String} The formatted string
*/
export default function list(v, options) {
	let settings = {
		or: false,
		and: false,
		cutoff: 0,
		cutoffPlural: 'other[s]',
		quote: false,
		...options,
	};

	if (settings.cutoff > 0 && v.length > settings.cutoff) {
		let omittedCount = v.length - settings.cutoff;
		v = [
			...v.slice(0, settings.cutoff),
			pluralize(omittedCount, settings.cutoffPlural, {prefix: true}),
		];
	}

	return singleton(Intl.ListFormat, config.settings.locale, {
		type: settings.or
			? 'disjunction'
			: 'conjunction',
		notation: 'short',
	}).format(
		settings.quote === true ? v.map(i => `"${i}"`)
		: settings.quote ? v.map(i => `${settings.quote}${i}${settings.quote}`)
		: v
	);
}

export function listAnd(v, options) {
	return list(v, {
		and: true,
		...options,
	});
}

export function listOr(v, options) {
	return list(v, {
		or: true,
		...options,
	});
}
