# Mockettaro

[![NPM Version](http://img.shields.io/npm/v/mockettaro.svg?style=flat)](https://www.npmjs.org/package/mockettaro)
[![NPM Downloads](https://img.shields.io/npm/dm/mockettaro.svg?style=flat)](https://npmcharts.com/compare/mockettaro?minimal=true)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=mockettaro&metric=alert_status)](https://sonarcloud.io/dashboard/index/mockettaro)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=mockettaro&metric=coverage)](https://sonarcloud.io/dashboard/index/mockettaro)
[![Maintainability](https://sonarcloud.io/api/project_badges/measure?project=mockettaro&metric=sqale_rating)](https://sonarcloud.io/dashboard/index/mockettaro)
[![Reliability](https://sonarcloud.io/api/project_badges/measure?project=mockettaro&metric=reliability_rating)](https://sonarcloud.io/dashboard/index/mockettaro)
[![Build Status](http://ci.marketto.it/buildStatus/icon?job=Mockettaro)](http://ci.marketto.it/job/Mockettaro)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FMarketto%2Fmockettaro.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2FMarketto%2Fmockettaro?ref=badge_shield)

Instant Server for JSON Mocks with support for REST structure, VERB specific or generic file mapping, schema for request validation and .code files to specify response HTTP status code

## Upgrade warning
* No default root resource. Read documentation below on upgrade from 1.3.1
* Major implementation changes. Read documentation below on upgrade from 1.2.2

## Installation
### Global
```{r, engine='bash', global_install}
npm install mockettaro -g
```

### Project dependency
```{r, engine='bash', dev_install}
npm install mockettaro --save-dev
```

## Getting Started
### Command line
```{r, engine='bash', run}
mockettaro
```
It will serve the current working directory tree as a REST API (matching JSON files) on http://localhost:8080/

### Nodejs Express
```js
const express = require('express');
const { mockettaro } = require('mockettaro');
const logger = require("@marketto/js-logger").global();

const app = express();
app.use('/mocks', mockettaro({
    //foldername to seek for folderTree / json files
    directory : 'mocks',
    //Current working directory to use as a targed for the given directory
    cwd: __dirname
}));

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
    "message" : "Hello world!"
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
│   ├── default.PUT.schema.json
│   ├── default.PUT.json
│   ├── foo.DELETE.code
│   └── default.GET.json
├── customer.POST.schema.json
├── customer.POST.json
├── customer.POST.code
└── customer.GET.json
```

#### customer.GET.json
```json
{
    "data" : [
        {
            "uid"   : "foo",
            "name"  : "Bar Foo"
        },
        {
            "uid"   : "smith",
            "name"  : "John Smith"
        }
    ]
}
```

#### customer/foo.GET.json
```json
{
    "data" : {
        "uid"   : "foo",
        "name"  : "Bar Foo"
    }
}
```

#### customer/default.GET.json
```json
{
    "data" : {
        "uid"   : "smith",
        "name"  : "John Smith"
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
            "enum": [
                "M",
                "F"
            ]
        }
    },
    "title": "customer/{uid}"
}
```

#### customer/foo.DELETE.code
```text
204
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
            "enum": [
                "M",
                "F"
            ]
        }
    },
    "required": [
        "firstName",
        "lastName"
    ],
    "title": "customer"
}
```

#### customer.POST.code
All POST request to /customer , if passing validation, will have a response with the provided HTTP status code
```text
201
```

#### customer.POST.json
All POST request to /customer , if passing validation, will have a response with the following HTTP body
```json
{
    "uid" : "newCustomer"
}
```

#### Run mock server
```{r, engine='bash', run}
mockettaro -r services
```

#### URL to test
* http://localhost:8080/services/customer           GET, POST
* http://localhost:8080/services/customer/foo       GET, PUT, DELETE
* http://localhost:8080/services/customer/smith     GET, PUT
* http://localhost:8080/services/customer/anything  GET, PUT



## Author
**Marco Ricupero** - [Github](https://github.com/Marketto) - [Blog](http://blog.marketto.it)


## License
This project is licensed under the MIT License - see the [License](/LICENSE) file for details


[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FMarketto%2Fmockettaro.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2FMarketto%2Fmockettaro?ref=badge_large)

## Changelog
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