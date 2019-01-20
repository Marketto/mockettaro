class MockettaroProgram {
    /**
     * @static
     * @readonly
     * @property RESOURCE_MATCHER
     * @returns {RegExp}
     * @memberof MockettaroProgram
     * @example MockettaroProgram.RESOURCE_MATCHER
     */
    static get RESOURCE_MATCHER() {
        return /^(?:\/?[a-z0-9_-]+)+$/i;
    }

    /**
     * @static
     * @readonly
     * @property FOLDER_MATCHER
     * @returns {RegExp}
     * @memberof MockettaroProgram
     * @example MockettaroProgram.FOLDER_MATCHER
     */
    static get FOLDER_MATCHER() {
        return /^(?:(?:[a-z]:|\.{0,2})?(\\|\/))?([^!#$%&+={}[\]\n]+(\\|\/))*[^!#$%&+={}[\]\n]+$/i;
    }

    /**
     * @static
     * @readonly
     * @property DEFAULT_PORT
     * @returns {number}
     * @memberof MockettaroProgram
     * @example MockettaroProgram.DEFAULT_PORT
     */
    static get DEFAULT_PORT() {
        return 8080;
    }

    /**
     * @static
     * @readonly
     * @property DEFAULT_RESOURCE
     * @returns {string}
     * @memberof MockettaroProgram
     * @example MockettaroProgram.DEFAULT_RESOURCE
     */
    static get DEFAULT_RESOURCE() {
        return '';
    }

    /**
     * @static
     * @readonly
     * @property DEFAULT_FOLDER
     * @returns {string}
     * @memberof MockettaroProgram
     * @example MockettaroProgram.DEFAULT_RESOURCE
     */
    static get DEFAULT_FOLDER() {
        return './';
    }

    /**
     * @static
     * @readonly
     * @property DEFAULT_DELAY
     * @returns {number}
     * @memberof MockettaroProgram
     * @example MockettaroProgram.DEFAULT_DELAY
     */
    static get DEFAULT_DELAY() {
        return 0;
    }

    /**
     * @static
     * @readonly
     * @property DEFAULT_CACHE_LIFETIME
     * @returns {number}
     * @memberof MockettaroProgram
     * @example MockettaroProgram.DEFAULT_CACHE_LIFETIME
     */
    static get DEFAULT_CACHE_LIFETIME() {
        return 3000;
    }

    /**
     * @static
     * @readonly
     * @property MIN_PORT
     * @returns {number}
     * @memberof MockettaroProgram
     * @example MockettaroProgram.MIN_PORT
     */
    static get MIN_PORT() {
        return 3000;
    }

    /**
     * @static
     * @readonly
     * @property MAX_PORT
     * @returns {number}
     * @memberof MockettaroProgram
     * @example MockettaroProgram.MAX_PORT
     */
    static get MAX_PORT() {
        return 30000;
    }

    /**
     * @static
     * @readonly
     * @property MAX_DELAY
     * @returns {number}
     * @memberof MockettaroProgram
     * @example MockettaroProgram.MAX_DELAY
     */
    static get MAX_DELAY() {
        return 120000;
    }

    /**
     * @static
     * @readonly
     * @property MAX_CACHE_LIFETIME
     * @returns {number}
     * @memberof MockettaroProgram
     * @example MockettaroProgram.MAX_CACHE_LIFETIME
     */
    static get MAX_CACHE_LIFETIME() {
        return 720000;
    }

    /**
     * @static
     * @method numericArgParser
     * @param {RegExp} matcher Number regexp matcher
     * @param {number} min Lower limit
     * @param {number} max Upper limit
     * @returns {Function} Parser
     * @memberof MockettaroProgram
     * @example MockettaroProgram.numericArgParser(/\d+/, 0, 100)
     */
    static numericArgParser(matcher = /\d+/, min = 0, max = 99999999) {
        return (v = '') => {
            const parsedV = parseInt((v.match(matcher) || [])[0]);
            return isNaN(parsedV) ? null : Math.min(Math.max(min, parsedV), max);
        };
    }

    /**
     * @static
     * @method cmdParser
     * @param {Array<string>} argv command line arguments
     * @returns {Commander} Returns a commander instanced with parsed argv
     * @memberof MockettaroProgram
     * @example MockettaroProgram.cmdParser('abc', 'abc', '-p', '...')
     */
    static cmdParser(...argv) {
        const pkgjson = require('../package.json');
        const program = require('commander');

        return program
          .version(pkgjson.version, '-v, --version')
          .description(pkgjson.description)
          .option('-p, --port <number>', 'Serve on specified port', this.numericArgParser(/\d{3,5}/, this.MIN_PORT, this.MAX_PORT), this.DEFAULT_PORT)
          .option('-r, --resource <path>', 'Root resource to serve', this.RESOURCE_MATCHER, this.DEFAULT_RESOURCE)
          .option('-f, --folder <path>', 'Sub-folder to fetch for files', this.FOLDER_MATCHER, this.DEFAULT_FOLDER)
          .option('-d, --response-delay <milliseconds>', 'Response delay in ms', this.numericArgParser(/\d{1,6}/, 0, this.MAX_DELAY), this.DEFAULT_DELAY)
          .option('-t, --cache-lifetime <milliseconds>', 'JSON cache lifetime', this.numericArgParser(/\d{1,8}/, 0, this.MAX_CACHE_LIFETIME), this.DEFAULT_CACHE_LIFETIME)
          .option('-s, --silent', 'No logs')
          .option('--verbose', 'Verbose logs')
          .parse(argv);
    }

    /**
     * @constructor
     * @param {Array<string>} argv command line arguments
     * @param {string|Function} cwd Current Working Directory
     * @returns {Promise<number>} Returns the copy process final status
     */
    constructor({argv = process.argv, cwd = process.cwd()}) {

        const program = this.constructor.cmdParser(...argv)

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

module.exports.mockettaroProgram = async (...args) => new MockettaroProgram(...args);
module.exports.MockettaroProgram = MockettaroProgram;
