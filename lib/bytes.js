import readable from '@momsfriendlydevco/readable';

/**
* Export a human readable, minimal file-size style format from the raw number of bytes
* @param {Number} v The input format
* @returns {String} A human readable string
*/
export default function bytes(v) {
	return v < 0
		? '-' + readable.fileSize(0-v)
		: readable.fileSize(v) || '0b';
}
