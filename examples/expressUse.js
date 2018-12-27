'use strict';

const { mockettaro, logger } = require('../');
const app = require('express')();

app.use('/mocks', mockettaro({ directory: '/examples/mocks' }));

const port = 3000;
app.listen(port, ()=>{
    logger.info(`Mockettaro test server running on  port ${port}`);
});