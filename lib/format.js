import chalk from 'chalk';
import formatters from '#lib/formatters';

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
* @param {Object} [options.rules] Expandable dictionary of other custom tokens to accept, keys are ignored and designed purely to be optionally extendable (as opposed to an array)
* @param {Number} options.tokens.priority The priority order from 0 (most) - 100 (least) to test
* @param {RegExp|Function} options.tokens.match RegExp to match the rule, can trap groups - `attr` is auto-split into an object
* @param {Function} [options.tokens.tidy] Optional function to run after a match to sanitize input data. Called as `(token)` expected to mutate the token
* @param {Function} options.tokens.operate Function to run on second-pass to return compiled content. Called as `({token: Object, tokenOffset: Number, content: String, attrs: Object, stack: Array<Object>, getNearestNumeric: Function})`
* @returns {String} The formatted output
*/
export default function format(value, options) {
	/* eslint-disable no-cond-assign, no-useless-escape */
	let settings = {
		join: ' ',
		rules: {
			// RULE: `###[bytes]` {{{
			bytes: {
				priority: 30,
				match: /^(?<tag>\[bytes.*?(?<attrs>.*?)])/i,
				operate({attrs, replaceNearestNumeric, removeSelf}) {
					replaceNearestNumeric(v => formatters.bytes(v, attrs));
					removeSelf();
				},
			},
			// }}}
			// RULE: `###[n|number]` {{{
			number: {
				priority: 30,
				match: /^(?<tag>\[n(?:umber)?(?<attrs>.*?)\])/i,
				operate({attrs, replaceNearestNumeric, removeSelf}) {
					replaceNearestNumeric(v => formatters.number(v, attrs));
					removeSelf();
				},
			},
			// }}}
			// RULE: `###[%|percentage|percent]` {{{
			percentage: {
				priority: 30,
				match: /^(?<tag>\[(?:%|percentage|percent)(?<attrs>.*?)\])/i,
				operate({attrs, replaceNearestNumeric, removeSelf}) {
					replaceNearestNumeric(v => formatters.percentage(v, attrs));
					removeSelf();
				},
			},
			// }}}
			// RULE: `[#]` {{{
			quantifier: {
				priority: 50,
				match: /^(?<tag>\[#(?<attrs>.*?)\])/,
				operate({token, attrs, getNearestNumeric}) {
					token.content = formatters.number(getNearestNumeric(), attrs);
				},
			},
			// }}}
			// RULE: `[list]...[/list]` {{{
			list: {
				priority: 70,
				match: /^\[list(?<attrs>.*?)\](?<content>.*?)\[\/list\]/i,
				tidy(token) {
					token.content = token.content.split(/\s*,\s*/);
					token.numericValue = token.content.length;
					token.studied = true;
				},
				operate({token, attrs}) {
					token.content = formatters.list(token.content, attrs);
				},
			},
			// }}}
			// RULE: Chalk colors / [style]...[/style] / [colors]...[/colors] {{{
			chalk: {
				priority: 80,
				match: /^\[(?<isClosing>\/)?(?<mainColor>color|style|bold|dim|italic|underline|overline|inverse|hidden|strikethrough|black|(?:bg|fg)?(?:red|green|yellow|blue|magenta|cyan|white|gray|blackBright|redBright|greenBright|yellowBright|blueBright|magentaBright|cyanBright|whiteBright))(?<subColors>.*?)\]/i,
				tidy(token) {
					if (token.isClosing == '/') {
						token.content = chalk.reset('X').replace(/X.*$/, '');

					} else {
						let colors = [
							token.mainColor,
							...token.subColors
								.split(/\s+|,/)
								.map(c => c.trim())
						]
							.filter(c => c && !/^(color|style)$/i.test(c))

						let chalkFunc = colors
							.reduce((chalkInstance, rawColor) => {
								let color = rawColor.replace(/^fg(.)(.+)$/, (str, firstChar, remaining) => firstChar.toLowerCase() + remaining);
								let nextInstance = chalkInstance[color]
								if (!nextInstance) throw new Error(`Cannot find color "${color}" within chalk. Is this valid?`);
								return nextInstance;
							}, chalk)

						token.content = chalkFunc('X').replace(/X.*$/, ''); // Strip remaining ANSI so we only get the opening meta text
					}
				},
				operate({content}) {
					return content;
				},
			},
			// }}}
			// RULE: Generic plurals {{{
			plural: {
				priority: 90,
				match: /^\[(?<pluralRules>.+?)(?:\s+(?<attrs>.+?))?\]/,
				tidy(token) {
					token.pluralRules = '[' + token.pluralRules + ']'; // Add square braces back as uptream needs them
				},
				operate({token, getNearestNumeric}) {
					token.content = formatters.pluralize({
						singular: token.pluralRules,
						value: getNearestNumeric(),
					});
				},
			},
			// }}}
			// RULE: General numerics {{{
			finalNumeric: {
				priority: 99,
				match: /^(?<content>[\d\.]+)/,
				tidy(token) {
					token.numericValue = parseFloat(token.content);
				},
				operate({content}) {
					return content;
				},
			},
			// }}}
			// RULE: Everything else {{{
			finalString: { // Capture remaining string into a regular strack entry point
				priority: 100,
				match: /^(?<content>[^\[\d]+)/,
				operate({content}) {
					return content;
				},
			}
			// }}}
		},
		autoDirections: new Set(['<', '>', '<>', '><', '|']),
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

		let rules = Object.values(settings.rules)
			.sort((a, b) => a.priority > b.priority ? 1
				: a.priority < b.priority ? -1
				: 0
			)

		// First pass - consume string into `stack` {{{
		while (examine) {
			let ruleExec;
			let rule = rules.find(r => ruleExec = r.match.exec(examine))
			if (!rule) throw new Error(`Unable to find next token in remaining string "${examine}"`);

			ruleExec.groups.attrs = ruleExec.groups.attrs
				? Object.fromEntries(
					ruleExec.groups.attrs
						.split(/\s+/)
						.map(attrSegment => /^(?<key>.+?)(?:\s*=\s*(?<val>.+))?$/g.exec(attrSegment)?.groups)
						.filter(Boolean)
						.map(({key, val}) => {
							// Consume direction hints
							if (settings.autoDirections.has(key))
								[key, val] = ['direction', key];

							return [key, val === undefined ? true : val]
						})
				)
				: {}

			let newToken = {
				rule,
				...ruleExec.groups,
			};
			if (rule.tidy) rule.tidy.call(newToken, newToken);

			stack.push(newToken);
			examine = examine.substr(ruleExec[0].length);
		}
		// }}}

		return stack
			// Second pass - run stack.ITEM.operate() {{{
			.map((token, tokenOffset) => {
				let context = {
					token,
					tokenOffset,
					attrs: token.attrs,
					content: token.content,
					stack,

					/**
					* Find the nearest numeric
					* @param {Object} [options] Options to mutate behaviour
					* @param {String} [options.want='numericValue'] The desired output. ENUM: 'numericValue', 'content', 'token', 'tokenIndex'
					* @param {Boolean} [options.lists=true] Count list lengths as numerics
					*/
					getNearestNumeric(options) {
						let settings = {
							want: 'numericValue',
							lists: true,
							direction: token.attrs.direction ?? '|',
							directionNextIndex(direction, startIndex, lastIndex, step) {
								switch (direction) {
									case '<': return startIndex - step >= 0 ? startIndex - step : false;
									case '>': return startIndex + step <= lastIndex ? startIndex + step : false;
									case '|': return step > lastIndex * 2 ? false
										: (step % 2) != 0 && startIndex - Math.ceil(step / 2) >= 0 ? startIndex - Math.ceil(step / 2)
										: (step % 2) == 0 && startIndex + Math.ceil(step / 2) <= lastIndex ? startIndex + Math.ceil(step / 2)
										: true
								}
							},
							...options,
						};

						// Search within these indexes until we hit a numeric {{{
						let numericIndex;
						settings.direction.split('').some(direction => {
							let step = 0;
							let searchIndex = tokenOffset;

							// searchIndex = settings.directionNextIndex(direction, tokenOffset, stack.length - 1, ++step);
							while (searchIndex !== false) {
								let token = stack[searchIndex];

								if (token.numericValue !== undefined) {
									numericIndex = searchIndex;
									return true;
								}

								do {
									searchIndex = settings.directionNextIndex(direction, tokenOffset, stack.length - 1, ++step);
								} while (searchIndex === true); // Redo "roll again" responses
							}
							return false;
						});

						if (numericIndex === undefined) {
							console.log('ERR STACK', stack.map((s, INDEX) => ({INDEX, ...s})));
							throw new Error(
								`Cannot find numeric in stack `
								+ (
									settings.direction == '<' ? 'backwards'
									: settings.direction == '>' ? 'forwards'
									: settings.direction == '<>' ? 'backwards then forwards'
									: settings.direction == '|' ? 'nearest'
									: 'OTHER'
								)
								+ ' from token index '
								+ tokenOffset
								+ ' of '
								+ stack.length
							);
						}

						return settings.want == 'numericValue' ? stack[numericIndex].numericValue
							: settings.want == 'content' ? stack[numericIndex].content
							: settings.want == 'token' ? stack[numericIndex]
							: numericIndex;
					},


					replaceNearestNumeric(fn) {
						let nearestToken = context.getNearestNumeric({want: 'token'});
						nearestToken.content = fn.call(context, nearestToken.numericValue);
					},

					removeSelf() {
						token.content = '';
					},
				};

				token.rule.operate.call(context, context);
				return token;
			})
			// }}}
			.map(token => token.content)
			.join('')
	}
}
