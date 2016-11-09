/**
 * @name Onyan
 * @author Tim Steele <tim.steele@whoistimsteele.com>
 * @license MIT
 */

const request		= require( 'request' );
const stream		= require( 'stream' );
const getDeepProp	= require( './utils/getDeepProp' );
const scrubNewLines	= require( './utils/scrubNewLines' );

/**
 * @class Onyan
 * @classdesc Class that extends the stream.Writable
 * interface to send .write() to an endpoint instead
 * of a file. Meant to be used as a Bunyan plug-in.
 * @implements {stream.Writable}
 *
 * @module Onyan
 * @exports {Class} Onyan
 *
 * @prop {Function} write - method for writing an incoming stream.
 * @prop {Object} config - configuration properties
 *
 * @example
 	bunyan.createLogger({
		name: "myLog",
		stream: new Onyan({
			url: 'https://my.endpoint.com:80',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			custom: {
				json: true
			}
		})
	});
 */
class Onyan extends stream.Writable {

	/**
	 * @constructs Onyan
	 *
	 * @throws {Error} - Will throw an error if `url` is not
	 * provided, `url` is not a string, or `url` is empty string.
	 * @throws {Error} - Will throw an error if `method` is provided
	 * and method is not a String or not 'GET' or 'POST'.
	 *
	 * @param {Object} configs - configuration for Onyan instance.
	 * @param {String} configs.url - url of log consuming endpoint.
	 * @param {String} [configs.method] - HTTP method for XHR request.
	 * @param {Object} [configs.headers] - HTTP headers for XHR request.
	 * @param {Object} [configs.custom] - Custom properties to be sent with XHR request.
	 */
	constructor ( configs ) {
		super();

		// Cache local the configs from the
		// config argument;
		const {
			url,
			method,
			headers,
			custom,
			schema
		} = configs;
		let xhr = {};
		const parser = /{{([a-zA-Z-\.]+)}}/g;


		// Make sure we have a proper url;
		if ( !url || typeof url !== 'string' || url.trim() === '' ) {
			throw new Error( "Onyan requires a {String} `url` configuration property." );
		}

		/**
		 * @name xhr#url
		 * @type String
		 *
		 * @desc URL of the log consuming endpoint.
		 */
		Object.defineProperty( xhr,
			'url', {
				configurable: false,
				enumerable: true,
				writable: false,
				value: url
			}
		);

		// Check if the method exists, and if so is it as expected;
		if ( method ) {
			if ( typeof method !== 'string' && [ 'POST', 'GET' ].indexOf( method ) === -1 ) {
				throw new Error( 'Onyan accepts only {String} "POST" and "GET" as configurable method values' );
			}
		} else {
			method = "POST"
		};

		/**
		 * @name xhr#method
		 * @type String
		 * @enum {"POST", "GET"}
		 * @default "POST"
		 *
		 * @desc HTTP method to use when making a request to the
		 * log consuming endpoint.
		 */
		Object.defineProperty( xhr,
			'method', {
				configurable: false,
				enumerable: true,
				writable: false,
				value: method
			}
		);

		// Check for headers, and if they are as expected;
		if ( headers && headers !== null && typeof headers === 'object' ) {

			/**
			 * @name xhr#headers
			 * @type Object
			 * @default undefined
			 *
			 * @desc Headers to be sent along with the XHR to
			 * the log consuming endpoint.
			 */
			Object.defineProperty( xhr,
				'headers', {
					configurable: false,
					enumerable: true,
					writable: false,
					value: headers
				}
			);
		};

		// Check for custom properties, and if they are as expected;
		if ( custom && custom !== null && typeof custom === 'object' ) {

			/*
				Merge the `custom` properties with the `xhr`
				object. We want to merge `xhr` into `custom`
				so we don't have any property collision from
				`custom` properties overwriting `xhr` properties.

				For example:
				custom.url will be overwritten by xhr.url - instead
				of custom.url overwriting the validated xhr.url.
			*/
			xhr = Object.assign( {}, custom, xhr );
		};

		// Check if the user sent a schema string for formatting data;
		if ( schema && typeof schema === "string" ) {

			// Give this object a render function;
			this.render = function render ( schema, data ) {

				// Force a copy of the schema object;
				var schema = ( ' ' + schema ).slice( 1 );

				return ( function renderSchemaWithData ( schema, data ) {
						// Replaceing {{}} with `data` properties;
	                    return schema.replace( parser, function parse ( match, substring, index, original ) {

							// Are we shallow property or a deep property;
							const prop = ( substring.indexOf( '.' ) === -1 ) ? data[ substring ] : getDeepProp( data, substring );

							// return the value if we got, otherwise empty string;
	                        return ( prop ) ? scrubNewLines( prop ) : '';
	                    });
					}
				).call( this, schema, data );

			}.bind( this, schema );

		};


		/**
		 * @name Onyan#xhr
		 * @type Object
		 *
		 * @desc The final configuration Object used when
		 * request({..configs}) is invoked.
		 */
		Object.defineProperty( this,
			'xhr', {
				configurable: false,
				enumerable: true,
				writable: false,
				value: xhr
			}
		);


	};

	/**
	 * @name write
	 * @function takes a write stream and sends it via XHR to
	 * a log consuming endpoint;
	 * @override
	 *
	 * @param {String} stream - write stream to send to endpoint.
	 */
	write ( stream ) {

		var stream = stream;

		// Check if stream is a string; If so,
		// Make sure that stream is parsable JSON;
		if ( typeof stream === 'string' ) {
			try {
				stream = JSON.parse( stream );
			} catch ( e ) {
				return console.log( e.toString() );
			};
		};

		const payload = ( typeof this.render === 'function' ) ? JSON.parse( this.render( stream ) ) : stream;

		console.log( 'PAYLOAD', payload )

		// Create the request object, and attach the
		// the body JSON;
		const req = Object.assign( {}, this.xhr, { body: payload } );

		// Make the request to the server - if something goes wrong
		// write the errors to the console instead of throwing them
		// so your logging doesn't kill the JS thread;
		request( req, ( error, response, body ) => {
			if ( error ) console.log( error.stack );
			if ( response && response.statusCode !== 200 ) console.log( 'Onyan Error: ', response.statusCode + ' - ' + response.statusMessage );
		});

	};

};


module.exports = Onyan;
