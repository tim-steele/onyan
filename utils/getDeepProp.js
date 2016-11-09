/**
 * @name getDeepProp
 * @function Checks if a string referencing a deep nested
 * property in a object exists, and returns its value;
 *
 * @exports {Function} getDeepProp
 *
 * @prop {Object} data - data object to look for property.
 * @prop {String} property - string of deep nested property.
 *
 * @returns value of property;
 */
const getDeepProp = function getDeepProp ( data, property ) {
	if ( typeof property === 'string' && typeof data === 'object' ) {

		const properties = property.split( '.' );

		return (function recursivelyLookForProperty ( data, properties ) {

			const prop = properties.shift();

			// We got to the end, return what we have;
			if ( !prop ) return data;

			// Have props, if there, go deeper;
			if ( data[ prop ] ) return recursivelyLookForProperty ( data[ prop ], properties );

			// Else doesn't exist so return null;
			return null;

		})( data, properties );

	} return null; // didn't get what we need;
};

module.exports = getDeepProp;
