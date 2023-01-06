import percentage from '#lib/percentage';
import {expect} from 'chai';

describe('percentage', ()=> {

	it('handle empty input', ()=> {
		expect(percentage(0)).to.equal('0%');
		expect(percentage(null)).to.equal('0%');
		expect(percentage("")).to.equal('0%');
	});

	it('handle negatives', ()=> {
		expect(percentage(-0)).to.equal('-0%');
		expect(percentage(-1)).to.equal('-1%');
		expect(percentage(-0.248, {float: true})).to.equal('-25%');
	});

	it('should format simple byte strings', ()=> {
		expect(percentage(0)).to.equal('0%');
		expect(percentage(12)).to.equal('12%');
		expect(percentage(0.12, {float: true})).to.equal('12%');
		expect(percentage(0.1287, {float: true})).to.equal('13%');
	});

	it('should change decimal-place precision', ()=> {
		expect(percentage(0.12, {float: true, dp: false})).to.equal('12%');
		expect(percentage(0.1287, {float: true, dp: false})).to.equal('13%');
		expect(percentage(0.13426, {float: true, dp: 0})).to.equal('13%');
		expect(percentage(0.13426, {float: true, dp: 1})).to.equal('13.4%');
		expect(percentage(0.13426, {float: true, dp: 2})).to.equal('13.43%');
	});

});
