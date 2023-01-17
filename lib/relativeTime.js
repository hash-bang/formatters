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


/**
* Output the distance backwards (or forwards) to a date relative to now
* @param {Date|Number} time The time to use as a static timestamp
* @param {Object} [options] Additional options to mutate behaviour
* @param {Boolean} [options.microTime=true] If the difference is less than a second switch to reporting millisecond distances
* @returns {String} A formatted representation of time
*/
export default function relativeTime(time, options) {
	let settings = {
		microTime: true,
		...options,
	};

	let distance = Math.abs(new Date(Date.now() - time).getTime());

	return !time || distance == 0 ? '0s'
		: settings.microTime && distance < 1000 ? `${Date.now() - time}ms`
		: timeAgo.format(time, 'mini')
}
