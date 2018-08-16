# Mockettaro

[![NPM Version](http://img.shields.io/npm/v/mockettaro.svg?style=flat)](https://www.npmjs.org/package/mockettaro)
[![NPM Downloads](https://img.shields.io/npm/dm/mockettaro.svg?style=flat)](https://npmcharts.com/compare/mockettaro?minimal=true)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=mockettaro&metric=alert_status)](https://sonarcloud.io/dashboard/index/mockettaro)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=mockettaro&metric=coverage)](https://sonarcloud.io/dashboard/index/mockettaro)
[![Maintainability](https://sonarcloud.io/api/project_badges/measure?project=mockettaro&metric=sqale_rating)](https://sonarcloud.io/dashboard/index/mockettaro)
[![Reliability](https://sonarcloud.io/api/project_badges/measure?project=mockettaro&metric=reliability_rating)](https://sonarcloud.io/dashboard/index/mockettaro)
![Build Status](http://ci.marketto.it/buildStatus/icon?job=Mockettaro)

Instant Server for JSON Mocks with support for REST structure, VERB specific or generic file mapping, schema for request validation and .code files to specify response HTTP status code

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
It will serve the current working directory tree as a REST API (matching JSON files) on http://localhost:8080/mockettaro/

### Nodejs Express
```js
'use strict';

const express = require('express');
const mockettaro = require('mockettaro');

const app = express();
app.use('/mocks', mockettaro.serve('mocks')); //foldername to seek for folderTree / json files

const port = 3000;
app.listen(port, ()=>{
    console.log(`Mockettaro test server running on  port ${port}`);
});
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
try to visit http://localhost:8080/mockettaro/test

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
