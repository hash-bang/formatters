/**
* Try to pluralize a word (if it is necessary)
* @param {String|Number|Object} input Either the singular word to pluralize (as `options.singular`) OR the numeric value to set as `options.value` OR the options object
* @param {Object} [options] Options to mutate behaviour
* @param {String} [options.singular] The singular varient of the word
* @param {String} [options.plural] The plural varient of the word if known
* @param {Boolean} [options.prefix=false] Include the number as a prefix
* @returns {String} The computed formatted string
*
* @example Pluralize a single word
* pluralize('item') //= "items"
*
* @example Pluralize conditionally based on value
* pluralize(1, 'item') //= "item"
* pluralize(10, 'item') //= "items"
* pluralize(1, 'item', {prefix: true}) //= "1 item"
* pluralize(10, 'item', {prefix: true}) //= "10 items"
*
* @example Specify pluralization rules (pipes)
* pluralize(1, 'item|items') //= "item"
* pluralize(3, 'item|items') //= "items"
* pluralize(1, 'item|items', {prefix: true}) //= "1 item"
* pluralize(10, 'item|items', {prefix: true}) //= "10 items"
*
* @example Specify pluralization rules (braces)
* pluralize(1, 'item[s]') //= "item"
* pluralize(3, 'item[s]') //= "items"
* pluralize(1, 'pe[erson|ople]') //= "person"
* pluralize(3, 'pe[erson|ople]') //= "people"
*/
export default function pluralize(input, options = {}) {
	// Argument mangling {{{
	if (arguments.length == 3) { // Called as (Value: Number, Singular: String, Options: Object)
		[input, options] = [null, {value: input, singular: options, ...arguments[2]}];
	} else if (typeof rawSingular == 'object') { // Called as (Options: Object)
		[input, options] = [null, input];
	} else if (isFinite(input)) { // Called as (Value: Number)
		[input, options] = [null, {...options, value: input}];
	} else if (typeof input == 'string') { // Called as (Singular: String)
		[input, options] = [null, {...options, singular: input}];
	}
	// }}}
	let settings = {
		value: 10,
		singular: undefined,
		plural: undefined,
		...options,
	};
	// Split singular up if given various formats {{{
	let match;
	if (match = /^(?<prefix>.*?)\[(?<modifier>.+?)\](?<suffix>.*)$/.exec(settings.singular)?.groups) {
		if (/\|/.test(match.modifier)) { // Has both singular + plural in the form `[singular|plural]`
			let splitModifier = match.modifier.split(/\s*\|\s*/, 2);
			Object.assign(settings, {
				singular: match.prefix + splitModifier[0] + match.suffix,
				plural: match.prefix + splitModifier[1] + match.suffix,
			});
		} else { // Only has singular
			Object.assign(settings, {
				singular: match.prefix + match.suffix,
				plural: match.prefix + match.modifier + match.suffix,
			});
		}
	} else if (match = /^(?<singular>.*)\|(?<plural>.*)$/.exec(settings.singular)?.groups) { // Split `singular|plural` strings
		Object.assign(settings, match);
	}
	// }}}
	// Try to guess at the plural if we don't have one {{{
	// }}}

	return ''
		+ (settings.prefix
			? settings.value + ' '
			: ''
		)
		+ (settings.value == 1
			? settings.singular
			: settings.plural
		)
}
