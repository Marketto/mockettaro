# Mockettaro

[![NPM Version](http://img.shields.io/npm/v/mockettaro.svg?style=flat)](https://www.npmjs.org/package/mockettaro)
[![NPM Downloads](https://img.shields.io/npm/dm/mockettaro.svg?style=flat)](https://npmcharts.com/compare/mockettaro?minimal=true)

Instant Server for JSON Mocks with support for REST structure, VERB specific or generic file mapping

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

### Nodejs Express
```js
'use strict';

const express = require('express');
const mockettaro = require('mockettaro');

const app = express();
app.use('/mocks', mockettaro.serve('mocks'));

const port = 3000;
app.listen(port, ()=>{
    console.log(`Mockettaro test server running on  port ${port}`);
});
```

## Author

**Marco Ricupero** - [Github](https://github.com/Marketto) - [Blog](http://blog.marketto.it)


## License

This project is licensed under the MIT License - see the [License](/LICENSE) file for details