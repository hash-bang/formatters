import relativeTime from '#lib/relativeTime';
import {expect} from 'chai';

describe('relativeTime', ()=> {

	it('handle empty input', ()=> {
		expect(relativeTime(0)).to.equal('0s');
		expect(relativeTime(null)).to.equal('0s');
		expect(relativeTime("")).to.equal('0s');
	});

	it('handle negatives', ()=> {
		expect(relativeTime(Date.now())).to.equal('0s');
		expect(relativeTime(Date.now() - 1000)).to.equal('1s');
		expect(relativeTime(Date.now() - 1000 * 60)).to.equal('1m');
		expect(relativeTime(Date.now() - 1000 * 60 * 60)).to.equal('1h');
	});

	it('handle positives', ()=> {
		expect(relativeTime(Date.now())).to.equal('0s');
		expect(relativeTime(Date.now() + 1000)).to.equal('1s');
		expect(relativeTime(Date.now() + 1000 * 60)).to.equal('1m');
		expect(relativeTime(Date.now() + 1000 * 60 * 60)).to.equal('1h');
	});

});
