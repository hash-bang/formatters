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
	/* eslint-disable no-cond-assign*/
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
	if (!settings.plural) {
		let matchingRule = pluralRules.find(([matcher]) => matcher.test(settings.singular));
		if (!matchingRule) throw new Error(`No valid pluralization rule found for the singular "${settings.singular}"`);
		settings.plural = settings.singular.replace(matchingRule[0], matchingRule[1]);
	}

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

export let pluralRules = [
	// These definitions are rewritten from https://github.com/swang/plural

	// words like cherry, where a word ends in a y, but the letter before the y is a consonant
	// also contains unique rule for words that end with 'quy' (soliloquy)
	[/[^aeiou]y$|quy$/i, w => w.substr(0, w.length - 1) + 'ies'],

	// words that end with ch, x, s append 'es'
	[/x$|ch$|s$/i, w => w + 'es'],

	// words that maintain latin/greek plural
	[/nucleus|syllabus|focus|fungus|cactus/i, w => w.substr(0, w.length - 2) + 'i'],
	[/thesis|crisis/i, w => w.substr(0, w.length - 2) + 'es'],
	[/appendix|index/i, w => w.substr(0, w.length - 2) + 'ices'],

	// stereo -> stereos
	[/[aeiouy]o$/i, w => w + 's'],
	[/[^aeiouy]o$/i, w => w + 'es'],

	// f/fe ending words gets switched to ves
	// unless it's dwarf or roof
	[/(fe?$)/i, (w, regex) => {
		if (w === 'dwarf' || w === 'roof')
			return w + 's'
		return w.replace(regex, 'ves')
	}],

	[/^criterion$/, 'criteria'],
	[/^bacterium$/, 'bacteria'],
	[/^memo$/, 'memos'],
	[/^cello$/, 'cellos'],
	[/^die$/, 'dice'],
	[/^goose$/, 'geese'],
	[/^mouse$/, 'mice'],
	[/^person$/, 'people'],
	[/^chilli$/, 'chillies'],

	[/^(?:wo)?man$/i, w => w.replace(/a/, 'e')],

	// animals w/ no plural
	[/\b(?:bison|cod|deer|fowl|halibut|moose|sheep)\b/i, w => w],

	// singular nouns that end in -s
	(()=> {
		let stuff = Object.values({
			tools: ['goggle', 'scissor', 'plier', 'tong', 'tweezer'],
			clothes: ['trouser', 'pant', 'pantie', 'clothe'],
			games: ['billiard', 'bowl', 'card', 'dart', 'skittle', 'draught'],
			illnesses: ['diabete', 'measle', 'mump', 'rabie', 'ricket', 'shingle'],
			misc: ['kudo', 'premise', 'shamble', 'glasse', 'spectacle', 'jitter',
				'alm', 'fece', 'bowel', 'sud', 'entrail', 'electronic', 'outskirt', 'odd', 'tropic',
				'riche', 'surrounding', 'thank', 'heroic', 'remain', 'amend'
			],
		}).flat();
		return [
			new RegExp('\\b(?:' + stuff.join('|') + ')s\\b', 'i'),
			w => w,
		];
	})(),

	// most words ending in -ics are the same in their plural form
	// mathematics, statistics, linguistics, classics, acoustics
	[/ics$/i, w => w],

	// uncountable
	[/\b(?:tea|sugar|water|air|rice|knowledge|beauty|anger|fear|love|money|research|safety|evidence)\b/i, w => w],

	// Fallback if all else fails
	[/$/, 's'],
];
