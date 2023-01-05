import number from '#lib/number';
import {expect} from 'chai';

describe('number', ()=> {

	it('handle empty input', ()=> {
		expect(number(0)).to.equal('0');
		expect(number(null)).to.equal('0');
		expect(number("")).to.equal('0');
	});

	it('handle negatives', ()=> {
		expect(number(-0)).to.equal('-0');
		expect(number(-1)).to.equal('-1');
		expect(number(-1024)).to.equal('-1,024');
	});

	it('should format simple byte strings', ()=> {
		expect(number(0)).to.equal('0');
		expect(number(1024)).to.equal('1,024');
	});

});
