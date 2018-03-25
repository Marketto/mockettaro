'use strict';

const express = require('express');
const mockettaro = require('../index');

const app = express();
app.use('/mocks', mockettaro.serve('mocks'));

const port = 3000;
app.listen(port, ()=>{});
console.log(`Mockettaro test server running on  port ${port}`);