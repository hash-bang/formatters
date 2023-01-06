import config from '#lib/config';
import {singleton} from '#lib/utils';

/**
* Export a human readable number based on the current locale
*/
export default function number(v) {
	return singleton(Intl.NumberFormat, config.settings.locale, {
	}).format(v);
}
