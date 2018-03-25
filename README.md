# Project Title

[![NPM Version](http://img.shields.io/npm/v/mockettaro.svg?style=flat)](https://www.npmjs.org/package/mockettaro)
[![NPM Downloads](https://img.shields.io/npm/dm/mockettaro.svg?style=flat)](https://npmcharts.com/compare/mockettaro?minimal=true)

Instant Server for JSON Mocks with support for REST structure, VERB specific or generic file mapping

### Installing

    $ npm install mockettaro -g

    or as dependency of your project

    $ npm install mockettaro --save-dev

## Getting Started

    $ mockettaro

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

* **Marco Ricupero** - *Initial work* - [Marketto](https://github.com/Marketto) - *Blog* - [Blog Marketto](http://blog.marketto.it)


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details