import chalk from 'chalk';
import formatters from '#lib/formatters';

/**
* Annoyingly necessary polyfill to replicate Array.findLast() until its supported in core
* @see Array.findLast()
*/
function findLast(arr, func) {
	for (let i = arr.length - 1; i >= 0; i--) {
		if (func.call(arr, arr[i], i, arr)) return arr[i];
	}
}


/**
* @name StackContext
* @type {Object}
* @description The Object used when calling `replace()` or `merge()`
* @property {String} token The current extracted token
* @property {Object} [options] Options provided to this token
* @property {Object} customRule The currently active rule
* @property {Array<Object>} stack The current stack, NOTE that we are still parsing this so only items BEFORE the current item are available
* @property {Object} match The current RegExp match for this stack item
*/


/**
* Apply other formatting functions to a string or array of strings using square braces to denote markup
* Falsy array items are omitted
* @param {String|Array<String>} value The input value to format
* @param {Object} [options] Additional options to mutate behaviour
* @param {String} [options.join=' '] Default join character(s) to use when concatting arrays
* @param {Object} [options.tokens] Expandable dictionary of other custom tokens to accept, keys are ignored and designed purely to be optionally extendable (as opposed to an array)
* @param {Number} options.tokens.priority The priority order from 0 (most) - 100 (least) to test
* @param {RegExp|Function} options.tokens.match Either a RegExp to test against the token OR a function called as `({token, options})` which should return a boolean
* @param {Function} [options.tokens.replace] Optional function to replace the parsed stack segment inline (i.e. first-compiler-pass). Called as `(StackContext)` (NOTE: stack SO FAR)
* @param {Function} [options.tokens.merge] Optional function called at the same time as `replace` to decorate the item being added to the stack. Called as `(StackContext)`
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
			// bytes - `10[bytes]` {{{
			formatBytes: {
				priority: 30,
				match: /^bytes$/,
				replace: ({replaceLastStackNumber, options}) => replaceLastStackNumber(v =>
					formatters.formatBytes(v, options)
				),
			},
			// }}}
			// number - `10[number]`, `1024[n]` {{{
			formatNumber: {
				priority: 30,
				match: /^(n|number)$/,
				replace: ({replaceLastStackNumber, options}) => replaceLastStackNumber(v =>
					formatters.formatNumber(v, options)
				),
			},
			// }}}
			// percentage - `10[percent]`, `10[percentage]`, `10[%]` {{{
			formatPercentage: {
				priority: 30,
				match: /^0?(%|percent|percentage)$/,
				replace: ({replaceLastStackNumber, token, options}) => replaceLastStackNumber(v =>
					formatters.formatPercentage(v, {
						float: token.startsWith('0'),
						...options,
					})
				),
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
				replace: ({token, options, findLastStackNumber}) => {
					let lastNumber = findLastStackNumber({from: ['number', 'list']});
					if (lastNumber === undefined) {
						throw new Error(`Cannot find numeric to pluralize backwards from token [${token}]`);
					} else {
						return formatters.pluralize({
							value: lastNumber,
							singular: `[${token}]`,
							...options,
						});
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
					let callContext = {
						token, options, customRule, stack, match,
						/**
						* Try and find the nearest number based on criteria
						* @param {Object} options Additioanl options to mutate behaviour
						* @param {Array<String>} [options.from] Segments to consider valid
						* @returns {Number|Undefined} Either the value of the found segment or undefined
						*/
						findLastStackNumber(options) {
							let settings = {
								from: ['number', 'list'],
								...options,
							};
							let foundSegment = findLast(stack, s => settings.from.includes(s.type));
							if (foundSegment === undefined) {
								return undefined;
							} else if (foundSegment.type == 'list') { // Return the LENGTH of the array if its a list
								return foundSegment.content.length;
							} else if (foundSegment.type == 'number') { // Just return the raw number
								return foundSegment.content;
							} else {
								throw new Error(`Dont know how to evaluate the numeric of type "${foundSegment.type}"`);
							}
						},
						replaceLastStackNumber(func) {
							let stackItem = findLast(stack, s => s.type == 'number');
							if (!stackItem) throw new Error('Cannot find nearest stack number');
							let result = func(stackItem.content);
							stackItem.type = 'string';
							stackItem.content = result;
						},
					};

					stack.push({
						type: 'string',
						content: customRule.replace
							? customRule.replace(callContext)
							: null,
						compute: customRule.compute,
						...(customRule.merge
							? customRule.merge(callContext)
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
