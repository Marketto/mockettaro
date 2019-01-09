#!/usr/bin/env node

const program = require('commander');
const pkgjson = require('./package.json');

program
  .version(pkgjson.version, '-v, --version')
  .description(pkgjson.description)
  .option('-p, --port <portNumber>', 'Serve on specified port', v => parseInt(v), 8080)
  .option('-r, --resource <resource>', 'Root resource to serve', /^(?:\/?[a-z0-9_-]+)+$/i, '')
  .option('-f, --folder <directory>', 'Sub-folder to fetch for files', /^(?:[a-z]|\.):((\\|\/)[a-z0-9\s_@\-^!#$%&+={}[\]]+)+$/i, './')
  .option('-d, --response-delay <responseDelay>', 'Response delay in ms', v => parseInt(v), 0)
  .option('-t, --cache-lifetime <cacheLifetime>', 'JSON cache lifetime', v => parseInt(v), 3000)
  .parse(process.argv);

const { mockettaro } = require('./');
const logger = require("@marketto/js-logger").global();
const server = require('express')();

program.cwd = process.cwd();

server.use(`/${program.resource}`, mockettaro(program));

server.listen(program.port, ()=>{
  logger.info(`Mockettaro serving ${program.directory} content @ localhost:${program.port}/${program.resource}`);
});
