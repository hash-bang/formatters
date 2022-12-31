import list, {listAnd, listOr} from '#lib/list';
import {expect} from 'chai';

describe('list', ()=> {

	it('handle empty input', ()=> {
		expect(list([])).to.equal('');
		expect(()=> list(null)).to.throw;
		expect(list("")).to.equal('');
	});

	it('handle conjuctions (AND)', ()=> {
		expect(list(['Foo', 'Bar', 'Baz'])).to.equal('Foo, Bar and Baz');
		expect(listAnd(['Foo', 'Bar', 'Baz'])).to.equal('Foo, Bar and Baz');
	});

	it('handle disjuctions (OR)', ()=> {
		expect(listOr(['Foo', 'Bar', 'Baz'])).to.equal('Foo, Bar or Baz');
	});

});
