# Onyan [uhn-yuh n]

Pronounced 'Onion', a Bunyan plugin that sends logs to a configured API endpoint that consumes JSON.

Onyan uses [request](https://github.com/request/request) to make HTTP calls to the API endpoint.

## Updates
### 1.1.0

* Added a new configuration property: the ability to send a simple, handlebars-like schema to Onyan to format how errors are sent.
* Added `getDeepProp()` utility to help with schema parsing.
* Added `scrubNewLines()` utility to defend against new lines causing `Unexpected token` errors when parsing strings out of the schema.

## Configurations
### url
**Type:** _String_

The URL of API endpoint.

### [ method ]
**Type:** _{ "POST", "GET" }_

HTTP Method to use, either POST or GET.

### [ headers ]
**Type:** _Object_

An object with key-value pairs of headers to include with the HTTP request.

### [ custom ]
**Type:** _Object_

An object with key-value pairs to include with the HTTP request.

### [ schema ]
**Type:** _String_

A Handlebars-like schema to format how errors are written out to the endpoint. You can include object properties inside {{}} and Onyan will attempt to parse the schema and insert the stream corresponding stream data.

## Example
```
const bigPandaSchema = `{
	"app_key": "<My App Key>",
	"status": "critical",
	"host": "{{hostname}}",
	"check": "PID: {{pid}}",
	"description": "{{err.stack}}"
}`;

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
		},
		schema: bigPandaSchema
	})
});
```
