@MomsFriendlyDevCo/Formatters
=============================
Collection of string formatters in ES6 exportable format.

All formatters are usable as either sub-methods or individual stand-alone libraries:

```javascript
// Import as global formatter object
import formatters from '@momsfriendlydevco/formatters';

formatters.bytes(1024); //= "1kb"
```

```javascript
// Import just the function
import {bytes} from '@momsfriendlydevco/formatters';

bytes(1024); //= "1kb"
```

```javascript
// Import function, but prefixed
import {formatBytes} from '@momsfriendlydevco/formatters';

formatBytes(1024); //= "1kb"
```


Formatters
==========
As above all formatters are either camel cased from the main module, exported as the same or can be addressed as `format${MODULE}`.

bytes(value)
------------
Return a short, human readable byte string.
Also available as `formatBytes()`
```javascript
import {bytes} from '@momsfriendlydevco/formatters';

bytes(1024); //= "1kb"
```


list(value) / listAnd(value) / listOr(value)
--------------------------------------------
Combine a list of strings into a readable list.
Also available as `listAnd()`, `listOr()`, `formatList()`, `formatListAnd()`, `formatListOr()`

```javascript
import {list, listOr} from '@momsfriendlydevco/formatters';

list(['Foo', 'Bar', 'Baz']); //= "Foo, Bar and Baz"
listOr(['Foo', 'Bar', 'Baz']); //= "Foo, Bar or Baz"

list(['foo', 'bar', 'baz'], {cutoff: 2}); //= "foo, bar and 1 other"
```

Options are:

| Option         | Type      | Default      | Description                                                                                            |
|----------------|-----------|--------------|--------------------------------------------------------------------------------------------------------|
| `and`          | `Boolean` | `false`      | Join items using a conjuction (i.e. 'and')                                                             |
| `or`           | `Boolean` | `false`      | Join items using a disjunction (i.e. 'or')                                                             |
| `cutoff`       | `Number`  | `0`          | Stop outputting items after this number and instead add `options.cutoffPlural` to the suffix           |
| `cutoffPlural` | `String`  | `'other[s]'` | `pluralize()` compatible string to output if there are any more items after the `options.cutOff` value |
| `quote`        | Boolean   | `false`      | Whether to surround entries with speachmarks. If a string this overrides the surrounding char(s)       |


number(value)
-------------
Return a formatted number.
Also available as `formatNumber()`
```javascript
import {number} from '@momsfriendlydevco/formatters';

number(1024); //= "1,024"
```

percentage(value)
-------------
Return a formatted number.
Also available as `formatPercentage()`
```javascript
import {number} from '@momsfriendlydevco/percentage';

percentage(10.2382412314); //= "10.24%"
```

| Option  | Type      | Default | Description                                                                   |
|---------|-----------|---------|-------------------------------------------------------------------------------|
| `float` | `Boolean` | `false` | Treat the incomming value as a floating-point number (i.e. *100 before using) |


plural(value)
-------------
Try to pluralize a word (if it is necessary).
Also available as `formatPlural()`

Note that this function can be called in numerous ways:
```javascript
// Pluralize a single word
pluralize('item') //= "items"

// Pluralize conditionally based on value
pluralize(1, 'item') //= "item"
pluralize(10, 'item') //= "items"
pluralize(1, 'item', {prefix: true}) //= "1 item"
pluralize(10, 'item', {prefix: true}) //= "10 items"

// Specify pluralization rules (pipes)
pluralize(1, 'item|items') //= "item"
pluralize(3, 'item|items') //= "items"
pluralize(1, 'item|items', {prefix: true}) //= "1 item"
pluralize(10, 'item|items', {prefix: true}) //= "10 items"

// Specify pluralization rules (braces)
pluralize(1, 'item[s]') //= "item"
pluralize(3, 'item[s]') //= "items"
pluralize(1, 'pe[erson|ople]') //= "person"
pluralize(3, 'pe[erson|ople]') //= "people"
```

Supported options are:

| Option     | Type      | Default | Description                             |
|------------|-----------|---------|-----------------------------------------|
| `singular` | `String`  |         | The singular varient of the word        |
| `plural`   | `String`  |         | The plural varient of the word if known |
| `prefix`   | `Boolean` | `false` | Include the number as a prefix          |


relativeTime(value, options)
----------------------------
Return a short string indicating a relative time.
Also available as `formatRelativeTime()`
```javascript
import {relativeTime} from '@momsfriendlydevco/formatters';

number(Date.now() - 1000); //= 1s
number(Date.now() + 1000 * 60); //= 1m
number(Date.now() + 1000 * 60 * 60); //= 1h
```

Supported options are:

| Option      | Type      | Default | Description                                                    |
|-------------|-----------|---------|----------------------------------------------------------------|
| `microTime` | `Boolean` | `true`  | Report time as milliseconds if distance to now is sub 1 second |


format(value)
-------------
Apply the above functions to a string or array of strings using square braces to denote markup.

| Markup Type           | Examples                                             | Description                                                                    |
|-----------------------|------------------------------------------------------|--------------------------------------------------------------------------------|--------------------------------------------------------------|
| Simple Plurals        | `[s]`, `[es]`, `[person                              | people]`                                                                       | Apply a plural to the first number backwards from the marker |
| Lists (AND style)     | `[list]${items}[/list]`, `[list and]${items}[/list]` | Format a CSV of items into a `foo, bar and baz` style output                   |
| Lists (OR style)      | `[list or]${items}[/list]`                           | Format a CSV of items into a `foo, bar or baz` style output                    |
| Lists (w/cutoff)      | `[list cutoff=3]${items}[/list]`                     | Specify the maximum number of items before truncation                          |
| Counts                | `[#]`                                                | Show the number of items in the list                                           |
| Transform: bytes      | `1024[bytes]`, `31239182 [bytes]`                    | Format the number to the left of the marker as bytes                           |
| Transform: number     | `1024[number]`, `31239182 [n]`                       | Format the number to the left of the marker as a readable number               |
| Transform: percentage | `12[percent]`, `8.3112[percentage]`, `13.332[%]`     | Format the number to the left of the marker as a readable percentage with sign |


**Notes:**

* Any attribute within square brackets are passed onto that formatter - e.g. `10[% dp=2]` actually calls `formatPercentage(10, {dp: 2})`
* Attributes specified without a value are assumed to specify `true` - e.g. `[list or quote]foo,bar,baz[/list]` -> `formatList(['foo', 'bar', 'baz'], {or: true, quote: true})`
* All `[list]...[/list]` markups expect a CSV (and will auto truncate spacing)
* Usage of `[#]` is limited to one list per string, if you need more prove `format()` an array of strings which will be concatted.


Utilities
=========

config.setLocale(newLocale)
---------------------------
Chanegs the default locale for all modules.
Note that this function *has* to return a Promise as some sub-modules need to dynamically load locale libraries.
```javascript
import formatters from '@momsfriendlydevco/formatters';

formatters.setLocale('de');

formatters.relativeTime(Date.now() - 1000 * 60 * 60); //= 1 Std.
```
