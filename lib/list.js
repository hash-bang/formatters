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
* @param {Array<String>} v Array of items to format
* @returns {String} The formatted string
*/
export default function list(v) {
	return listFormatterConjuct.format(v);
}

export let listAnd = list;

export function listOr(v) {
	return listFormatterDisjuct.format(v);
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
