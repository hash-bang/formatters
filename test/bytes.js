import bytes from '#lib/bytes';
import {expect} from 'chai';

describe('bytes', ()=> {

	it('handle empty input', ()=> {
		expect(bytes(0)).to.equal('0b');
		expect(bytes(null)).to.equal('0b');
		expect(bytes("")).to.equal('0b');
	});

	it('handle negatives', ()=> {
		expect(bytes(-0)).to.equal('0b');
		expect(bytes(-1)).to.equal('-1b'); // No idea why this doesn't work as expected, rounding?
		expect(bytes(-1024)).to.equal('-1kb');
	});

	it('should format simple byte strings', ()=> {
		expect(bytes(0)).to.equal('0b');
		expect(bytes(1024)).to.equal('1kb');
	});

});
