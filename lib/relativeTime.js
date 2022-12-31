import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en'

TimeAgo.addDefaultLocale(en);
let timeAgo = new TimeAgo('en-US');


/**
* Load + reinit timeAgo, returing a promise when done
* @param {String} newLocale The newLocale string to use
* @returns {Promise} A promise which resolves when the operation has completed
*/
export function setLocale(newLocale) {
	let mainLocale = newLocale.split('_', 2).at(0);
	return import(`javascript-time-ago/locale/${mainLocale}`)
		.then(importedLocale => {
			TimeAgo.addLocale(importedLocale.default);
			timeAgo = new TimeAgo(newLocale);
		})
}

export default function relativeTime(time) {
	return time
		? timeAgo.format(time, 'mini')
		: '0s'
}
