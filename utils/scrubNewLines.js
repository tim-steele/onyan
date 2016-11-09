const matchNewLines = /[\n\r]/g;

/**
 * @name scrubNewLines
 * @function scrubs new lines from JSON strings, replacing them
 * with double escapes so we don't get a "Unexpected token" error.
 *
 * @exports {Function} scrubNewLines
 *
 * @prop {String} string - string to be scrubbed.
 *
 * @returns {String} scrubbedString - scrubbed string.
 */
const scrubNewLines = function scrubNewLines ( string ) {
	if ( typeof string === 'string' ) {

		return string.replace( matchNewLines, '\\n' );

	} return null; // didn't get what we need;
};

module.exports = scrubNewLines;
