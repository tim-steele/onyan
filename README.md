# Onyan [uhn-yuh n]

Pronounced 'Onion', a Bunyan plugin that sends logs to a configured API endpoint that consumes JSON.

Onyan uses [request](https://github.com/request/request) to make HTTP calls to the API endpoint.

## Configurations
### url
**Type:** _String_

The URL of API endpoint.

### [ method ]
**Type:** _{ "POST", "GET" }_

HTTP Method to use, either POST or GET.

### [headers]
**Type:** _Object_

An object with key-value pairs of headers to include with the HTTP request.

### [custom]
**Type:** _Object_

An object with key-value pairs to include with the HTTP request.

## Example
```
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
```
