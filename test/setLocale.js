import {expect} from 'chai';
import formatters from '#lib/formatters';

describe('setLocale', ()=> {

	it('should switch from en -> de', ()=>
		formatters.setLocale('de')
	);

	it('should have changed the default locale', ()=>
		expect(formatters.config.settings.locale).to.equal('de')
	);

	it('should have changed sub-module locales', ()=>
		expect(formatters.relativeTime(Date.now() - 1000 * 60 * 60)).to.equal('1 Std.')
	);

});
