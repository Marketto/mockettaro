# Mockettaro


[![Dependency Status](https://david-dm.org/preboot/angular-webpack/status.svg)](https://david-dm.org/preboot/angular-webpack#info=dependencies)
[![NPM Version](http://img.shields.io/npm/v/mockettaro.svg?style=flat)](https://www.npmjs.org/package/mockettaro)
[![NPM Downloads](https://img.shields.io/npm/dm/mockettaro.svg?style=flat)](https://npmcharts.com/compare/mockettaro?minimal=true)

Instant Server for JSON Mocks with support for REST structure, VERB specific or generic file mapping

### Installing
```{r, engine='bash', global_install}
npm install mockettaro -g
```

or as dependency of your project


```{r, engine='bash', dev_install}
npm install mockettaro --save-dev
```

## Getting Started

```{r, engine='bash', run}
mockettaro
```

or

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

## Authors

* **Marco Ricupero** - [Github](https://github.com/Marketto) - [Blog](http://blog.marketto.it)


## License

This project is licensed under the MIT License - see the [License](LICENSE.md) file for details