import chalk from 'chalk';
import {expect} from 'chai';
import format from '#lib/format';
import mlog from 'mocha-logger';


describe('formatter', ()=> {

	before('force enable color', ()=> {
		process.env.FORCE_COLOR = 3;
	});

	it('handle byte formatting', ()=> {
		expect(format('10[bytes]')).to.equal('10b');
		expect(format('1024[bytes]')).to.equal('1kb');

		expect(format('prefix 10 [bytes] suffix')).to.equal('prefix 10b  suffix');
		expect(format('prefix 1024 [bytes] suffix')).to.equal('prefix 1kb  suffix');
	});

	it('handle number formatting', ()=> {
		expect(format('10[number]')).to.equal('10');
		expect(format('1024[number]')).to.equal('1,024');
		expect(format('10[n]')).to.equal('10');
		expect(format('1024[n]')).to.equal('1,024');
		expect(format('10 [n]')).to.equal('10 ');
		expect(format('1024 [n]')).to.equal('1,024 ');
		expect(format('prefix 1024 [n] suffix')).to.equal('prefix 1,024  suffix');
	});

	it('handle percentage formatting', ()=> {
		expect(format('10[percent]')).to.equal('10%');
		expect(format('10.31827319872398172[percent]')).to.equal('10%');
		expect(format('10.31827319872398172[percent dp=2]')).to.equal('10.32%');
		expect(format('10[percentage]')).to.equal('10%');
		expect(format('10.31827319872398172[percentage]')).to.equal('10%');
		expect(format('10[%]')).to.equal('10%');
		expect(format('10.31827319872398172[% dp=2]')).to.equal('10.32%');
		expect(format('prefix 10 [%] suffix')).to.equal('prefix 10%  suffix');
		expect(format('prefix 10.31827319872398172 [%] suffix')).to.equal('prefix 10%  suffix');
	});

	it('handle prefix plurals', ()=> {
		expect(format('10 green bottle[s]')).to.equal('10 green bottles');
		expect(format('1 green bottle[s]')).to.equal('1 green bottle');
		expect(format('1 [person|people]')).to.equal('1 person');
		expect(format('3 [person|people]')).to.equal('3 people');
	});

	it('handle lists', ()=> {
		expect(format('[list]foo,bar,baz[/list]')).to.equal('foo, bar and baz');
		expect(format('[list or]foo,bar,baz[/list]')).to.equal('foo, bar or baz');
		expect(format('[list and quote]foo,bar,baz[/list]')).to.equal('"foo", "bar" and "baz"');
		expect(format('prefix [list or]foo,bar,baz[/list] suffix')).to.equal('prefix foo, bar or baz suffix');
		expect(format('prefix [list cutoff=3]foo,bar,baz,quz,quuz[/list] suffix')).to.equal('prefix foo, bar, baz and 2 others suffix');
		expect(format('prefix [list or cutoff=3]foo,bar,baz,quz,quuz[/list] suffix')).to.equal('prefix foo, bar, baz or 2 others suffix');
	});

	it('handle list counts', ()=> {
		expect(format('[#] items: [list]foo,bar,baz[/list]')).to.equal('3 items: foo, bar and baz');
		expect(format('[list or]foo,bar,baz[/list] ([#])')).to.equal('foo, bar or baz (3)');
	});

	it('handle list + backward plurals', ()=> {
		expect(format('[list]foo[/list] item[s]')).to.equal('foo item');
		expect(format('[list]foo,bar,baz[/list] - [#] item[s]')).to.equal('foo, bar and baz - 3 items');
	});

	it('handle list + forward plurals', ()=> {
		expect(format('item[s] - [list]foo[/list]')).to.equal('item - foo');
		expect(format('item[s] - [list or]foo[/list]')).to.equal('item - foo');
		expect(format('item[s] - [list]foo,bar,baz[/list]')).to.equal('items - foo, bar and baz');
		expect(format('item[s] - [list or]foo,bar,baz[/list]')).to.equal('items - foo, bar or baz');
		expect(format('[#] item[s] - [list]foo[/list]')).to.equal('1 item - foo');
		expect(format('[#] item[s] - [list or]foo[/list]')).to.equal('1 item - foo');
		expect(format('[#] item[s] - [list]foo,bar,baz[/list]')).to.equal('3 items - foo, bar and baz');
		expect(format('[#] item[s] - [list or]foo,bar,baz[/list]')).to.equal('3 items - foo, bar or baz');
	});

	it('handle numerics with direction hinting', ()=> {
		expect(format('123 [# <] 456')).to.equal('123 123 456');
		expect(format('123 [# >] 456')).to.equal('123 456 456');
		expect(format('123 [# |] 456')).to.equal('123 123 456');

		expect(format('[list]foo,bar[/list] [# <] [list]baz,quz,quark[/list]')).to.equal('foo and bar 2 baz, quz and quark');
		expect(format('[list]foo,bar[/list] [# >] [list]baz,quz,quark[/list]')).to.equal('foo and bar 3 baz, quz and quark');
		expect(format('[list]foo,bar[/list] [# |] [list]baz,quz,quark[/list]')).to.equal('foo and bar 2 baz, quz and quark');

		expect(format('1 [person|people <] 3')).to.equal('1 person 3');
		expect(format('1 [person|people <>] 3')).to.equal('1 person 3');
		expect(format('1 [person|people >] 3')).to.equal('1 people 3');
		expect(format('1 [person|people ><] 3')).to.equal('1 people 3');
		expect(format('1 [person|people |] 3')).to.equal('1 person 3');
	});

	it('handle list + plurals + counts', ()=> {
		expect(format('[list]foo,bar,baz[/list] - [#] item[s]')).to.equal('foo, bar and baz - 3 items');
		expect(format('[#] item[s] - [list]foo,bar,baz[/list]')).to.equal('3 items - foo, bar and baz');
		expect(format('[#] item[s] - [list or]foo,bar,baz[/list]')).to.equal('3 items - foo, bar or baz');
	});

	it('handle array concatination', ()=> {
		expect(format(['foo', 'bar', 'baz'])).to.equal('foo bar baz');
		expect(format(['foo', undefined, null, false, 'bar', '', 'baz'])).to.equal('foo bar baz');
	});

	it('kitchen sink tests', ()=> {
		let res = format('[red]Red[/red], [style green]Green[/style], [color blue]Blue[/color]');
		mlog.log('Result:', res);
		expect(res)
			.to.equal([
				chalk.red._styler.open,
				'Red',
				chalk.reset._styler.open,
				', ',
				chalk.green._styler.open,
				'Green',
				chalk.reset._styler.open,
				', ',
				chalk.blue._styler.open,
				'Blue',
				chalk.reset._styler.open,
			].join(''));

		res = format('"[list or]foo,bar,baz[/list]" [gray bold]([#] item[|s] in total)[/gray]');
		mlog.log('Result:', res);
		expect(res)
			.to.equal([
				'"foo, bar or baz" ',
				chalk.grey.bold._styler.open,
				'(3 items in total)',
				chalk.reset._styler.open,
			].join(''));

		res = format('1 [person|people] with 2 [arm|arms] and 2 [leg|legs]');
		mlog.log('Result:', res);
		expect(res)
			.to.equal('1 person with 2 arms and 2 legs');

		res = format('[bold]1[/bold] [person|people] with [italic blue]2[/italic] [arm|arms] and [style bold fgBlue bgWhite]2[/style] [leg|legs]');
		mlog.log('Result:', res);
		expect(res)
			.to.equal([
				chalk.bold._styler.open,
				'1',
				chalk.reset._styler.open,
				' person with ',
				chalk.italic.blue._styler.open,
				'2',
				chalk.reset._styler.open,
				' arms and ',
				chalk.bold.blue.bgWhite._styler.open,
				'2',
				chalk.reset._styler.open,
				' legs',
			].join(''));
	});

});
