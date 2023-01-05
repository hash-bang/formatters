import pluralize from '#lib/pluralize';
import {settings} from '#lib/config';

export let listFormatterOptions = {
	notation: 'short',
};

export let listFormatterConjuct = new Intl.ListFormat(settings.locale, {
	type: 'conjunction',
	...listFormatterOptions,
});

export let listFormatterDisjuct = new Intl.ListFormat(settings.locale, {
	type: 'disjunction',
	...listFormatterOptions,
});


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
* @returns {String} The formatted string
*/
export default function list(v, options) {
	let settings = {
		or: false,
		and: false,
		cutoff: 0,
		cutoffPlural: 'other[s]',
		...options,
	};

	if (settings.cutoff > 0 && v.length > settings.cutoff) {
		let omittedCount = v.length - settings.cutoff;
		v = [
			...v.slice(0, settings.cutoff),
			pluralize(omittedCount, settings.cutoffPlural, {prefix: true}),
		];
	}

	if (settings.or) {
		return listFormatterDisjuct.format(v);
	} else {
		return listFormatterConjuct.format(v);
	}
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

export function setLocale(newLocale) {
	listFormatterConjuct = new Intl.ListFormat(newLocale, {
		type: 'conjunction',
		...listFormatterOptions,
	});
	listFormatterDisjuct = new Intl.ListFormat(newLocale, {
		type: 'disjunction',
		...listFormatterOptions,
	});
}
