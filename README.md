# mockettaro

[![NPM Version](http://img.shields.io/npm/v/mockettaro.svg?style=flat)](https://www.npmjs.org/package/mockettaro)
[![NPM Downloads](https://img.shields.io/npm/dm/mockettaro.svg?style=flat)](https://npmcharts.com/compare/mockettaro?minimal=true)
[![Dependency status](https://david-dm.org/Marketto/mockettaro.svg)](https://david-dm.org/Marketto/mockettaro)
[![Dev dependency status](https://david-dm.org/Marketto/mockettaro/dev-status.svg)](https://david-dm.org/Marketto/mockettaro?type=dev)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FMarketto%2Fmockettaro.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2FMarketto%2Fmockettaro?ref=badge_shield)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=mockettaro&metric=alert_status)](https://sonarcloud.io/dashboard/index/mockettaro)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=mockettaro&metric=coverage)](https://sonarcloud.io/dashboard/index/mockettaro)
[![Maintainability](https://sonarcloud.io/api/project_badges/measure?project=mockettaro&metric=sqale_rating)](https://sonarcloud.io/dashboard/index/mockettaro)
[![Reliability](https://sonarcloud.io/api/project_badges/measure?project=mockettaro&metric=reliability_rating)](https://sonarcloud.io/dashboard/index/mockettaro)
[![Build Status](http://ci.marketto.it/buildStatus/icon?job=Mockettaro)](http://ci.marketto.it/job/Mockettaro)
[![LICENSE](https://img.shields.io/badge/licese-MIT-gold.svg)](https://github.com/Marketto/mockettaro/blob/master/LICENSE)
[![Blog](https://img.shields.io/badge/blog-marketto-blue.svg)](http://blog.marketto.it)
[![Buy me a coffee](https://img.shields.io/badge/Ko--fi-donate-blueviolet)](https://ko-fi.com/marketto)

Instant Server for JSON and XML Mocks with support for REST structure, VERB specific or generic file mapping, schema for request validation and .config.yml files to specify response delay, HTTP status code and headers; supporting xml/json automatic conversion driven by Accept header

## Upgrade warning

- Config files .code and .delay are no longer supported by 2.0.0, please use .config.yml files
- No default root resource. Read documentation below on upgrade from 1.3.1
- Major implementation changes. Read documentation below on upgrade from 1.2.2

## Supported files for mocks

- **.json** => _resource_
- **.xml** => _resource_
- **.txt** => _resource_
- **.config.yml** => _yaml config for custom status, delay and headers_
- **.schema.json** => _request validator_

## Supported responses

- **JSON** => _Default_
- **XML** => _"Accept"_: **_"application/xml"_**
- **TXT** => _"Accept"_: **_"text/plain"_**

## Supported config (.config.yml)

- **status** _numeric_
- **delay** _numeric_
- **headers** _List of Key/Value_

## Installation

### Global

#### npm

```{r, engine='bash', dev_install}
npm i mockettaro -g
```

#### yarn

```{r, engine='bash', dev_install}
yarn global add mockettaro
```

### Project dependency

#### npm

```{r, engine='bash', dev_install}
npm i mockettaro --save-dev
```

#### yarn

```{r, engine='bash', dev_install}
yarn add mockettaro --dev
```

## Getting Started

### Command line

```{r, engine='bash', run}
mockettaro
```

It will serve the current working directory tree as a REST API (matching JSON files) on http://localhost:8080/

### Nodejs Express

```js
const express = require("express");
const { mockettaro } = require("mockettaro");
const logger = require("@marketto/js-logger").global();

const app = express();
app.use(
	"/mocks",
	mockettaro({
		//foldername to seek for folderTree / json or xml files
		directory: "mocks", //default: './'
		//Current working directory to use as a targed for the given directory
		cwd: __dirname, //default: process.cwd()
		responseDelay: 1000, //default: 0
		cacheLifetime: 1000, //default: 3000
		verbose: false, //default
		errors: true, //default
		info: true, //default
	})
);

const port = 3000;
app.listen(port, () => {
	logger.info(`Mockettaro test server running on  port ${port}`);
});
```

## Command line overview

### Version

Display the current Mockettaro version

```{r, engine='bash', run}
mockettaro -v
```

### Port number

Mockettaro server will listen on the provided port

```{r, engine='bash', run}
mockettaro -p 1234
```

### URI Resource root path

Mockettaro will serve resources, using the provided path as the root

```{r, engine='bash', run}
mockettaro -r my-mock/resource
```

### Folder for static files

Mockettaro will load resources, matching the resource entry URI, fetching the provided local path

```{r, engine='bash', run}
mockettaro -f ./mocks/rest
```

### Delay in ms to provide responses

Mockettaro will serve resources waiting the delay ms before providing each positive response

```{r, engine='bash', run}
mockettaro -d 1500
```

### Cache Lifetime in ms

Mockettaro will cache HTTP codes and response bodies for the provided cache lifetime ms

```{r, engine='bash', run}
mockettaro -t 30000
```

### Silent

Disable all logs except errors

```{r, engine='bash', run}
mockettaro -s
```

### Verbose

Display all levels log messages

```{r, engine='bash', run}
mockettaro --verbose
```

## Managing Mocks

### GUI - ServiceDesigner

To quickly design your RESTful services mocks/json schemas you can use [MK Service Designer](http://servicedesigner.marketto.it/), available also on [GitHub](https://github.com/Marketto/mkServiceDesigner), and export a Mockettaro package which would be ready to use.

[Online Service Designer](http://servicedesigner.marketto.it/)
Once extracted, from the package folder, run from the command line:

```{r, engine='bash', run}
mockettaro
```

### Hello World

Create a folder with a file named test.GET.json which contains the following:

```json
{
	"message": "Hello world!"
}
```

From the command line run:

```{r, engine='bash', run}
mockettaro
```

try to visit http://localhost:8080/test

### RESTful services Mocks

Consider you have a /customer API which provide a list @ /customer and details @ /customer/{uid}
In your Mock folder (anywhere) create the following folder structure:

```
/
├── customer
│   ├── foo.GET.json
│   ├── foo.GET.delay
│   ├── default.PUT.schema.json
│   ├── default.PUT.json
│   ├── foo.DELETE.config.yml
│   └── default.GET.json
├── customer.POST.schema.json
├── customer.POST.json
├── customer.POST.config.yml
└── customer.GET.json
```

#### customer.GET.json

```json
{
	"data": [
		{
			"uid": "foo",
			"name": "Bar Foo"
		},
		{
			"uid": "smith",
			"name": "John Smith"
		}
	]
}
```

#### customer/foo.GET.json

```json
{
	"data": {
		"uid": "foo",
		"name": "Bar Foo"
	}
}
```

#### customer/foo.GET.delay

Delay in milliseconds for the matching resource

```text
500
```

#### customer/default.GET.json

```json
{
	"data": {
		"uid": "smith",
		"name": "John Smith"
	}
}
```

#### customer/foo.PUT.json

```json
{}
```

#### customer/default.PUT.schema.json

All PUT request to /customer/xxxx will be validated against it!

```json
{
	"$schema": "http://json-schema.org/schema#",
	"properties": {
		"firstName": {
			"type": "string",
			"minLength": 3
		},
		"lastName": {
			"type": "string",
			"minLength": 3
		},
		"birthDate": {
			"type": "string",
			"minLength": 10,
			"format": "date-time"
		},
		"gender": {
			"type": "string",
			"enum": ["M", "F"]
		}
	},
	"title": "customer/{uid}"
}
```

#### customer/foo.DELETE.config.yml

Config to return custom code and/or delay and/or headers in response for the matching resource

```yaml
status: 204
#delay: 0
headers:
  test-header: Mockettaro
```

#### customer.POST.schema.json

All POST request to /customer will be validated against it!

```json
{
	"$schema": "http://json-schema.org/schema#",
	"properties": {
		"firstName": {
			"type": "string",
			"minLength": 3
		},
		"lastName": {
			"type": "string",
			"minLength": 3
		},
		"birthDate": {
			"type": "string",
			"minLength": 10,
			"format": "date-time"
		},
		"gender": {
			"type": "string",
			"enum": ["M", "F"]
		}
	},
	"required": ["firstName", "lastName"],
	"title": "customer"
}
```

#### customer.POST.config.yml

All POST request to /customer , if passing validation, will have a response with the provided HTTP status code

```yaml
status: 201 # Response status code
#delay: 0 # Response delay in ms
#headers: # list of headers
#   test-header: Mockettaro # custom header
```

#### customer.POST.json

All POST request to /customer , if passing validation, will have a response with the following HTTP body

```json
{
	"uid": "newCustomer"
}
```

#### Run mock server

##### Global

```{r, engine='bash', run}
mockettaro -r services
```

##### NPX

```{r, engine='bash', run}
npx mockettaro -r services
```

#### URL to test

- http://localhost:8080/services/customer GET, POST
- http://localhost:8080/services/customer/foo GET, PUT, DELETE
- http://localhost:8080/services/customer/smith GET, PUT
- http://localhost:8080/services/customer/anything GET, PUT

## Changelog

### 2.1.2

- Added default Access-Control-Allow-Headers and Access-Control-Allow-Methods Headers to \*

### 2.1.1

- Added default Access-Control-Allow-Origin Header to \*

### 2.1.0

- Added support for txt (text/plain) files

### 2.0.0

- Introduced config.yml files for custom settings
- Added support for custom HTTP status code in config.yml files
- Added support for custom responde delay in config.yml files
- Added support for custom headers in config.yml files
- Removed support for .code files
- Removed support for .delay files

### 1.4.4

- Fixed min port number: 80
- Increased test coverage over classes (error handling focused)

### 1.4.3

- Fixed delay parameter bug
- Fixed resource delay cache bug
- Package json scripts now use npx
- Tests and coverage use only nyc and mocha
- Mocha and Nyc config/parameters moved to test/mocha.opts and .nycrc.json
- jsdoc comments review
- Increased test coverage over classes (error handling focused)

### 1.4.2

- Improved performance implementing iterators
- Implemented xml support for mocks
- Implemented dynamic response conversion to json or xml depending on request Accept type (JSON default)
- Improved unit tests to ensure they are independent from others

### 1.4.1

- Sonar config to exclude docs from coverage

### 1.4.0

- Docs

### 1.3.12

- Used standard paths for bin and lib
- Fixed default params for MockettaroProgram
- Divided tests per class
- Added bin Unit
- Added separate unit test to prevent cache test issues

### 1.3.11

- Minor fixes
- Completed jsdoc

### 1.3.10

- Fixed missing args for MockettaroProgram

### 1.3.9

- Fixed typo in dependency

### 1.3.8

- Arg Number Parser moved as static method
- Added more tests
- Removed deprecated code

### 1.3.7

- Implemented MockettaroProgram.parser and MIN, MAX and DEFAULT constants
- Implemented MockettaroProgram.parser tests for parsing and setting MIN, MAX or DEFAULTS

### 1.3.6

- Fixed Resource RegExp
- Path and resource RegExps moved as static property in MockettaroProgram
- Added unit tests for Path and Resource regexps
- Added test for corrupted json mock reading

### 1.3.5

- Fully migrated to ES6
- Command line logics moved to MockettaroProgram class
- MockettaroProgram covered by tests
- Added -s / --silent and --verbose for silent and verbose mode

### 1.3.4

- Fixed Error Handler
- Mockettaro core refactored as an ES6 Class
- Fixed working directory issue
- Implemented cwd in mockettaro
- Updated test and debug config to pass cwd

### 1.3.3

- Removed all unused dependencies
- Removed logger and chalk dependency
- Used @marketto/js-logger to log event on console
- Removed 'use strict' since it's moving to ES6

### 1.3.2

- Log info on missing and found json
- Fixed compatibility issues with Windows
- Updated example expressUse.json implementation
- Added launch.json for development purpose

### 1.3.1

- Info logger level is true bny default
- Warning logger level is on for debbugging purpose
- Improved compatibility with trailing slash api

### 1.3.0

- Core reworked in classes ES6
- Command Line property -f --folder added
- Removed server method, import the lib as { mockettaro } and use it like mockettaro()
- Mockettaro router accept only an object of optional params in input {directory, responseDelay, cacheLifetime, verbose, errors }
- Provided logger micro-logging embedded utility

## LICENSE

[MIT License](LICENSE)

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FMarketto%2Fmockettaro.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2FMarketto%2Fmockettaro?ref=badge_large)

## AUTHOR

[Marco Ricupero](mailto:marco.ricupero@gmail.com)
