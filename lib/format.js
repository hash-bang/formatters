import chalk from 'chalk';
import formatters from '#lib/formatters';

/**
* Finds the nearest numerical value from the stack
* This function looks backwards from the offset to find the nearest numerical value
*/
/*
export function findNearestNumber(options) {
	let settings = {
		stack: [],
		offset: 0,
		...options,
	};

	return stack
		.slice(0, settings.offset)
		.findLast(s => {
			if (s.type == 'number') { // Basic static number
				return true;
			} else if (s.compute && s.content === null) { // Has a computed value that hasn't been computed yet

			}
		})
}
*/


function findLast(arr, func) {
	for (let i = arr.length - 1; i >= 0; i--) {
		if (func.call(arr, arr[i], i, arr)) return arr[i];
	}
}


/**
* Apply other formatting functions to a string or array of strings using square braces to denote markup
* Falsy array items are omitted
* @param {String|Array<String>} value The input value to format
* @param {Object} [options] Additional options to mutate behaviour
* @param {String} [options.join=' '] Default join character(s) to use when concatting arrays
* @param {Object} [options.tokens] Expandable dictionary of other custom tokens to accept, keys are ignored and designed purely to be optionally extendable (as opposed to an array)
* @param {Number} options.tokens.priority The priority order from 0 (most) - 100 (least) to test
* @param {RegExp|Function} options.tokens.match Either a RegExp to test against the token OR a function called as `({token, options})` which should return a boolean
* @param {Function} [options.tokens.replace] Optional function to replace the parsed stack segment inline (i.e. first-compiler-pass). Called as `({token, options, customRule, stack, match})` (NOTE: stack SO FAR)
* @param {Function} [options.tokens.merge] Optional function called at the same time as `replace` to decorate the item being added to the stack. Called as `({token, options, customRule, stack, match})`
* @param {Function} [options.tokens.compute] Optional second pass function to call as `({stackItem, stackOffset, stack})` to return a late/lazy computed value
* @returns {String} The formatted output
*/
export default function format(value, options) {
	/* eslint-disable no-cond-assign, no-useless-escape */
	let settings = {
		join: ' ',
		tokens: {
			// list counts - `[#]` {{{
			listCount: {
				priority: 50,
				match: /^#$/,
				merge: ()=> ({
					type: 'number',
				}),
				compute: ({options, stack}) => {
					let firstList = stack.find(s => s.type == 'list');
					if (!firstList) throw new Error('Cannot find list to add list count via [#]');
					return formatters.number(firstList.content.length, options);
				},
			},
			// }}}
			// Terminal colors - `[gray]`, `[fgBlue bgWhite bold]` {{{
			termColors: {
				priority: 80,
				match: /^\/?(color|style|bold|dim|italic|underline|overline|inverse|hidden|strikethrough|black|(?:bg|fg)?(?:red|green|yellow|blue|magenta|cyan|white|gray|blackBright|redBright|greenBright|yellowBright|blueBright|magentaBright|cyanBright|whiteBright))$/i,
				replace: ({token, options}) => {
					if (token.startsWith('/')) {
						return chalk.reset('');
					} else {
						let excludeMeta = new Set(['color', 'style']);
						return [
							token,
							...Object.keys(options || {}),
						]
							.filter(color => color && !excludeMeta.has(color))
							.map(color => color.replace(/^fg(.)/, (junk, firstChar) => firstChar.toLowerCase()))
							.reduce((chalkInstance, colorSegment) => {
								if (!chalkInstance[colorSegment]) throw new Error(`Style segment "${colorSegment}" is not a valid chalk color`);
								return chalkInstance[colorSegment];
							}, chalk)('')
					}
				},
			},
			// }}}
			// Plurals - `[s]`, `[s|es]` {{{
			plurals: { // Plural support - should come last as there are quite a few varients of this
				priority: 100,
				match: ()=> true,
				replace: ({token, stack}) => {
					let [singular, plural] = token.split(/\s*\|\s*/, 2);
					if (!plural) [singular, plural] = ['', singular]; // No singular given, assume we were only given a plural

					let lastNumber = findLast(stack, s => s.type == 'number');
					if (lastNumber === undefined) {
						throw new Error(`Cannot find numeric to pluralize backwards from token [${token}]`);
					} else if (lastNumber.content == 1) {
						return singular;
					} else {
						return plural;
					}
				},
			},
			// }}}
		},
		...options,
	};

	if (Array.isArray(value)) { // Run each array item through this function - effectively flattening the array
		return value
			.filter(Boolean) // Omit falsy
			.map(v => format(v, options))
			.join(settings.join);
	} else {
		let stack = [];

		let examine = value;
		let nextOperand = {type: 'string'};

		let customRules = Object.values(settings.tokens)
			.sort((a, b) => a.priority > b.priority ? 1
				: a.priority < b.priority ? -1
				: 0
			)
			.map(rule => Object.assign(rule, {
				rawMatch: rule.match,
				match: // Change match to a simple matcher function if given anything else like a RegExp
					typeof rule.match == 'function' ? rule.match
					: rule.match instanceof RegExp ? ({token}) => rule.rawMatch.test(token)
					: (()=> { throw new Error('Unknown match type') })()
			}))

		while (examine) {
			let match;
			if (match = /^\[(?<token>.+?)\]/.exec(examine)) { // Start next token group
				// Move examine string on by capture length
				examine = examine.substr(match[0].length);

				// Correct token + options if we have attributes {{{
				let token = match.groups.token;
				let options;
				let customRule;
				if (match = /^(?<token>.+?)(?:\s+(?<attrs>.+))$/.exec(match.groups.token)?.groups) {
					token = match.token;
					options = match.attrs
						? Object.fromEntries(
							match.attrs
								.split(/\s+/)
								.map(attrSegment => /^(?<key>.+?)(?:\s*=\s*(?<val>.+))?$/g.exec(attrSegment)?.groups)
								.filter(Boolean)
								.map(({key, val}) => [key, val === undefined ? true : val])
						)
						: false;
				}
				// }}}

				if (token == 'list') { // {{{
					nextOperand = {
						type: 'list',
						options,
					}; // }}}
				} else if (token == '/list') { // {{{
					nextOperand = {type: 'string'}; // }}}
				} else if (customRule = customRules.find(tr => tr.match({token, options}))) {
					stack.push({
						type: 'string',
						content: customRule.replace
							? customRule.replace({token, options, customRule, stack, match})
							: null,
						compute: customRule.compute,
						...(customRule.merge
							? customRule.merge({token, options, customRule, stack, match})
							: {}
						),
					});
				} else {
					nextOperand = {type: 'string'};
				}
			} else if (match = /^(?<content>[^\[]+)/.exec(examine)) {
				let subMatch;
				if (nextOperand.type == 'list') {
					stack.push({
						...nextOperand,
						content: match[1].split(/\s*,\s*/),
					});
					nextOperand = 'string';
					examine = examine.substr(match[0].length);
				} else if (subMatch = /^(?<prefix>.*?)(?<number>[\d\.,]+)/.exec(match[1])) {
					if (subMatch.groups.prefix) stack.push({type: 'string', content: subMatch.groups.prefix});
					stack.push({
						type: 'number',
						content: parseFloat(subMatch.groups.number.replace(/,/g, '')),
					});
					examine = examine.substr(subMatch[0].length);
				} else {
					stack.push({
						type: 'string',
						content: match[1],
					});
					examine = examine.substr(match[0].length);
				}
			} else { // No other tokens found - assume rest of content is a raw string
				stack.push({
					type: 'string',
					content: examine,
				});
				examine = '';
				break;
			}
		}

		return stack
			.map((stackItem, stackOffset) => {
				if (stackItem.compute) // Evaluate lazy / dynamic content
					stackItem.content = stackItem.compute({stackItem, stackOffset, stack});

				switch (stackItem.type) {
					case 'string':
						return stackItem.content;
					case 'list':
						return formatters.list(stackItem.content, stackItem.options);
					case 'number':
						return formatters.number(stackItem.content, stackItem.options);
					default:
						throw new Error(`Unknown token "${stackItem.type}" this shouldnt happen`);
				}
			})
			.join('')
	}
}
