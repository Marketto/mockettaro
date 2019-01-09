const { mockettaro } = require('../');
const app = require('express')();

app.use('/mocks', mockettaro({ directory: 'mocks', cwd: __dirname }));

const port = 3000;
app.listen(port, ()=>{
    const logger = require("@marketto/js-logger").global();
    logger.info(`Mockettaro test server running on  port ${port}`);
});