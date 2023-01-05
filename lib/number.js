import config from '#lib/config';

export let numberFormatterOptions = {
};

export let numberFormatter = new Intl.NumberFormat(config.settings.locale, numberFormatterOptions);


/**
* Export a human readable number based on the current locale
*/
export default function number(v) {
	return numberFormatter.format(v);
}

export function setLocale(newLocale) {
	numberFormatter = new Intl.NumberFormat(newLocale, numberFormatterOptions)
}
