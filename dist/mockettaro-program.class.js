/**
 * @class MockettaroProgram
 */
class MockettaroProgram {
    /**
     * @constructor
     * @param {Object} param Main parameter object
     * @param {Array<string>} param.argv command line arguments
     * @param {string|Function} param.cwd Current Working Directory
     * @returns {Promise<number>} Returns the copy process final status
     */
    constructor({argv = [], cwd = process.cwd()}) {
        const program = require('commander');
        const pkgjson = require('../package.json');

        program
          .version(pkgjson.version, '-v, --version')
          .description(pkgjson.description)
          .option('-p, --port <number>', 'Serve on specified port', v => parseInt(v), 8080)
          .option('-r, --resource <path>', 'Root resource to serve', /^(?:\/?[a-z0-9_-]+)+$/i, '')
          .option('-f, --folder <path>', 'Sub-folder to fetch for files', /^(?:[a-z]|\.):((\\|\/)[a-z0-9\s_@\-^!#$%&+={}[\]]+)+$/i, './')
          .option('-d, --response-delay <milliseconds>', 'Response delay in ms', v => parseInt(v), 0)
          .option('-t, --cache-lifetime <milliseconds>', 'JSON cache lifetime', v => parseInt(v), 3000)
          .option('-s, --silent', 'No logs')
          .option('--verbose', 'Verbose logs')
          .parse(argv);

        if (program.verbose && program.silent) {
            throw new Error('Can\'t run in both silent and verbose mode');
        }

        const mockettaro = require('./mockettaro.class');
        const logger = require("@marketto/js-logger").global();
        const server = require('express')();
        const path = require('path');

        const {port, resource, folder, responseDelay, cacheLifetime, silent, verbose} = program;
        server.use(`/${program.resource}`, mockettaro({
            port,
            resource,
            directory: folder,
            responseDelay,
            cacheLifetime,
            cwd,
            verbose,
            errors: true,
            info: !silent
        }));

        return new Promise((resolve, reject) => {
            try {
                const serverInstance = server.listen(program.port, () => {
                    logger.info(`Mockettaro serving ${path.join(cwd, program.folder)} content @ localhost:${program.port}/${program.resource}`);
                    serverInstance.router = server;
                    resolve(serverInstance);
                });
            } catch (err) {
                reject(err);
            }
        });
    }
}
module.exports = async (...args) => new MockettaroProgram(...args);
