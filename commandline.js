#!/usr/bin/env node

const program = require('commander');
const package = require('./package.json');
require('colors');

program
  .version(package.version)
  .description(package.description)
  .option('-p, --port <portNumber>', 'Serve on specified port', v=>parseInt(v), 8080)
  .option('-r, --resource <resource>', 'Root resource to serve', /^[a-z0-9\_\-]*$/i, 'mock')
  .option('-d, --response-delay <responseDelay>', 'Response delay in ms', v=>parseInt(v), 0)
  .option('-t, --cache-lifetime <cacheLifetime>', 'JSON cache lifetime', v=>parseInt(v), 3000)
  .parse(process.argv);

const mockettaro = require('./');
const server = require('express')();

server.use(`/${program.resource}`, mockettaro.serve('./', program));

server.listen(program.port, ()=>{
    console.log(`Mockettaro serveing on port ${program.port}`.magenta);
});