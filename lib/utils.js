import {CanonMap} from 'big-m';

/**
* Since Map uses pointer posisions we have to use a wrapper see https://stackoverflow.com/a/58000586/1295040
* @type {CanonMap}
*/
let singletonCache = new CanonMap();

/**
* Creates a new instance of the specified class, reusing an existing instance singleto if one is already available
* @param {Function} base A class-compatible creation function which returns an instance
* @param {*} [options...] Additional options to create the class instance
*/
export function singleton(base, ...options) {
	let cachedItem = singletonCache.get(options);
	if (!cachedItem) {
		cachedItem = new base(...options);
		singletonCache.set(options, cachedItem);
	}
	return cachedItem;
}
