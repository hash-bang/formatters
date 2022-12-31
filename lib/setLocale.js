import config from '#lib/config';
import {setLocale as listSL} from '#lib/list';
import {setLocale as numberSL} from '#lib/number';
import {setLocale as relativeTimeSL} from '#lib/relativeTime';

/*
* Change the default Locale to use for all formatters
* NOTE: This needs to be a promise as some sub-formatters need to dynamically load that locale data
* @returns {Promise} A promise which will resolve when the locale swtich has completed
*/
export default function setLocale(newLocale) {
	// Tell all submodules that need it to switch locale
	return Promise.all([
		listSL(newLocale),
		numberSL(newLocale),
		relativeTimeSL(newLocale),
	])
		.then(()=> config.settings.locale = newLocale)
}
