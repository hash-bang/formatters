@MomsFriendlyDevCo/Formatters
=============================
Collection of string formatters in ES6 exportable format.

All formatters are usable as either sub-methods or individual stand-alone libraries:

```javascript
// Import as global formatter object
import formatters from '@momsfriendlydevco/formatters';

formatters.bytes(1024); //= 1kb
``

```javascript
// Import just the function
import {bytes} from '@momsfriendlydevco/formatters';

bytes(1024); //= 1kb
``

```javascript
// Import function, but prefixed
import {formatBytes} from '@momsfriendlydevco/formatters';

formatBytes(1024); //= 1kb
``


Formatters
==========
As above all formatters are either camel cased from the main module, exported as the same or can be addressed as `format${MODULE}`.

bytes(value)
------------
Return a short, human readable byte string.
```javascript
import {bytes} from '@momsfriendlydevco/formatters';

bytes(1024); //= 1kb
```


list(value) / listAnd(value) / listOr(value)
--------------------------------------------
Combine a list of strings into a readable list.

```javascript
import {list, listOr} from '@momsfriendlydevco/formatters';

list(['Foo', 'Bar', 'Baz']); //= "Foo, Bar and Baz"
listOr(['Foo', 'Bar', 'Baz']); //= "Foo, Bar or Baz"
```


number(value)
-------------
Return a formatted number.
```javascript
import {number} from '@momsfriendlydevco/formatters';

number(1024); //= 1K
```

relativeTime(value)
-------------------
Return a short string indicating a relative time.
```javascript
import {relativeTime} from '@momsfriendlydevco/formatters';

number(Date.now() - 1000); //= 1s
number(Date.now() + 1000 * 60); //= 1m
number(Date.now() + 1000 * 60 * 60); //= 1h
```


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
