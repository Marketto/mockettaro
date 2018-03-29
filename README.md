# Mockettaro

[![NPM Version](http://img.shields.io/npm/v/mockettaro.svg?style=flat)](https://www.npmjs.org/package/mockettaro)
[![NPM Downloads](https://img.shields.io/npm/dm/mockettaro.svg?style=flat)](https://npmcharts.com/compare/mockettaro?minimal=true)

Instant Server for JSON Mocks with support for REST structure, VERB specific or generic file mapping

## Installation
### * Global
```{r, engine='bash', global_install}
npm install mockettaro -g
```

### * Project dependency
```{r, engine='bash', dev_install}
npm install mockettaro --save-dev
```

## Getting Started
### * Command line
```{r, engine='bash', run}
mockettaro
```
It will serve the current working directory tree as a REST API (matching JSON files) on http://localhost:8080/mockettaro/

### * Nodejs Express
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

##Managing Mocks
### * Hello World
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

### * RESTful services Mocks
Consider you have a /customer API which provide a list @ /customer and details @ /customer/{uid}
In your Mock folder (anywhere) create the following folder structure:
```
/
├── customer
│   ├── foo.GET.json
│   ├── default.PUT.json.schema
│   ├── default.PUT.json
│   ├── foo.DELETE.json
│   └── default.GET.json
└── customer.GET.json
```

#### - customer.GET.json
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

#### - foo.GET.json
```json
{
    "data" : {
        "uid"   : "foo",
        "name"  : "Bar Foo"
    }
}
```

#### - default.GET.json
```json
{
    "data" : {
        "uid"   : "smith",
        "name"  : "John Smith"
    }
}
```

#### - foo.PUT.json
```json
{}
```

#### - default.PUT.json.schema
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
    "title": "{uid}"
}
```

#### - foo.DELETE.json
```json
{
    "data" : {
        "uid"   : "foo",
        "name"  : "Bar Foo"
    }
}
```

#### - Run mock server
```{r, engine='bash', run}
mockettaro -r services
```

#### - URL to test
* http://localhost:8080/services/customer           GET
* http://localhost:8080/services/customer/foo       GET, PUT, DELETE
* http://localhost:8080/services/customer/smith     GET, PUT
* http://localhost:8080/services/customer/anything  GET, PUT



## Author
**Marco Ricupero** - [Github](https://github.com/Marketto) - [Blog](http://blog.marketto.it)


## License
This project is licensed under the MIT License - see the [License](/LICENSE) file for details
