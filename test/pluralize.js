import pluralize from '#lib/pluralize';
import {expect} from 'chai';

describe('pluralize', ()=> {

	it('should handle pre-defined plurals', ()=> {
		expect(pluralize('person', {plural: 'people'})).to.equal('people');
		expect(pluralize('person', {singular: 'person', plural: 'people', value: 1})).to.equal('person');
		expect(pluralize(10, {prefix: true, singular: 'person', plural: 'people'})).to.equal('10 people');
	});

	it('should handle plural shorthands (pipes)', ()=> {
		expect(pluralize('person|people')).to.equal('people');
		expect(pluralize('person|people', {value: 1})).to.equal('person');
		expect(pluralize('person|people', {value: 2})).to.equal('people');
	});

	it('should handle plural shorthands (braces)', ()=> {
		expect(pluralize('item[s]')).to.equal('items');
		expect(pluralize('item[s]', {value: 1})).to.equal('item');
		expect(pluralize('item[s]', {value: 2})).to.equal('items');

		expect(pluralize('pe[rson|ople]')).to.equal('people');
		expect(pluralize('pe[rson|ople]', {value: 1})).to.equal('person');
		expect(pluralize('pe[rson|ople]', {value: 2})).to.equal('people');
	});

	it('within a sentence', ()=> {
		expect(pluralize(1, 'bottle of beer[s]', {prefix: true})).to.equal('1 bottle of beer');
	});

});
