class Mockettaro {
    /**
     * @description Creates an instance of Mockettaro.
     * @param {string} [directory = './'] Mock source path
     * @param {number} [responseDelay = 0] Response delay to simulate
     * @param {number} [cacheLifetime = 3000] Response Codes and Bodies cache life time
     * @param {string} [cwd = __dirname] Current working dir, __dirname as default
     * @param {Object} [verbose = false] Verbose log level
     * @param {Object} [errors = true] Error log level
     * @param {Object} [info = true] Info log level
     * @returns {Express} Express instance
     * @example new Mockettaro({directory: './'})
     */
    constructor({
        directory = './',
        responseDelay = 0,
        cacheLifetime = 3000,
        cwd = process.cwd(),
        verbose = false,
        errors = true,
        info = true
    } = {
        directory: './',
        responseDelay: 0,
        cacheLifetime: 3000,
        cwd: process.cwd(),
        verbose: false,
        errors: true,
        info: true
    }) {
        //dependencies
        const path = require('path');
        const express = require('express');
        const bodyParser = require('body-parser');
        const logger = require('@marketto/js-logger').global();

        const { RequestValidator } = require('./request-validator.class');
        const { ResourceLoader } = require('./resource-loader.class');

        logger.config = {
            'error': errors || verbose,
            info,
            'debug': verbose,
            'warn': errors || verbose
        };

        this.srcPath = this.constructor.ABSOLUTE_PATH_MATCHER.test(directory) ? directory : path.join(cwd, directory);
        this.cacheLifetime = cacheLifetime;
        this.responseDelay = responseDelay;

        this.server = express();
        this.server.use(bodyParser.json());
        this.server.use(bodyParser.urlencoded({ extended: true }));
        this.server.use(this.configRoute, RequestValidator.jsonSchemaRoute, ResourceLoader.statusCodeRoute, ResourceLoader.jsonRoute, this.returnResponse);
        this.server.use(this.constructor.errorHandler);

        return this.server;
    }

    /**
     * @readonly
     * @static
     * @param ABSOLUTE_PATH_MATCHER
     * @description Absolute path win/*nix
     * @returns {Regexp} Regular expression to match an absolute win/*nix path
     * @memberof Mockettaro
     * @example Mockettaro.ABSOLUTE_PATH_MATCHER
     */
    static get ABSOLUTE_PATH_MATCHER() {
        return /(?:^\/)|(?:^\w:\\)/i;
    }

    /**
     * @method configRoute
     * @description Configuration Route
     * @param {Express.Request} req Request / previous route params
     * @param {Express.Response} res Response instance
     * @param {Function} next Callback to be called to step forward in route chain
     * @memberof Mockettaro
     * @example const express = require('express');<br>const app = express();<br>...<br>app.use(Mockettaro.configRoute);
     */
    get configRoute() {
        const {srcPath, cacheLifetime} = this;
        return ( req, res, next ) => {
            [req.servicePath] = (/^([^?]+)/).exec(req.url);
            req.workingDir = srcPath;
            req.cacheLifetime = cacheLifetime;
            next();
        };
    }

    /**
     * @method returnResponse
     * @description Configuration Route
     * @param {Express.Request} req Request / previous route params
     * @param {Express.Response} res Response instance
     * @memberof Mockettaro
     * @example const express = require('express');<br>const app = express();<br>...<br>app.use(Mockettaro.returnResponse);
     */
    get returnResponse() {
        const {responseDelay} = this;
        const logger = require('@marketto/js-logger').global();
        return ( req, res ) => {
            if (req.resStatusCode || req.resBody){
                setTimeout(() => {
                    Object.entries(req.resHeader||{}).forEach(( [header, value] ) => {
                        res.append(header, value);
                    });

                    logger.debug(`Headers: ${JSON.stringify(res.header, 4)}`);

                    res
                        .status(req.resStatusCode||200)
                        .send(req.resBody);
                }, responseDelay);
            } else {
                res
                    .status(404)
                    .send();
            }
        }
    }

    /**
     * @method errorHandler
     * @description Error Handler Route
     * @param {string|Error} err Raised error
     * @param {Express.Request} [req] Request / previous route params
     * @param {Express.Response} res Response instance
     * @param {Function} [next] Callback to be called to step forward in route chain, needed for Express to manage it as an Error Handler
     * @memberof Mockettaro
     * @example const express = require('express');<br>const app = express();<br>...<br>app.use(Mockettaro.errorHandler);
     */
    static errorHandler(err, req, res, next) { //eslint-disable-line no-unused-vars
        const logger = require('@marketto/js-logger').global();
        logger.warn(err.message);
        res
            .status(500)
            .send(err.message);
    }
}

module.exports = config => new Mockettaro(config);
