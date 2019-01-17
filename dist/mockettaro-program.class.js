/**
 * @class MockettaroProgram
 */
class MockettaroProgram {
    /**
     * @static
     * @readonly
     * @property RESOURCE_MATCHER
     * @returns {RegExp}
     */
    static get RESOURCE_MATCHER() {
        return /^(?:\/?[a-z0-9_-]+)+$/i;
    }

    /**
     * @static
     * @readonly
     * @property FOLDER_MATCHER
     * @returns {RegExp}
     */
    static get FOLDER_MATCHER() {
        return /^(?:(?:[a-z]:|\.{0,2})?(\\|\/))?([^!#$%&+={}[\]\n]+(\\|\/))*[^!#$%&+={}[\]\n]+$/i;
    }

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
          .option('-r, --resource <path>', 'Root resource to serve', MockettaroProgram.RESOURCE_MATCHER, '')
          .option('-f, --folder <path>', 'Sub-folder to fetch for files', MockettaroProgram.FOLDER_MATCHER, './')
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
        server.use(`/${resource}`, mockettaro({
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
                const serverInstance = server.listen(port, () => {
                    logger.info(`Mockettaro serving ${path.join(cwd, folder)} content @ localhost:${port}/${resource}`);
                    resolve(serverInstance);
                });
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports.MockettaroProgram = async (...args) => new MockettaroProgram(...args);
module.exports.RESOURCE_MATCHER = MockettaroProgram.RESOURCE_MATCHER;
module.exports.FOLDER_MATCHER = MockettaroProgram.FOLDER_MATCHER;
