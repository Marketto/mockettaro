//dependencies
const express = require('express');
const path = require('path');
const logger = require('@marketto/js-logger').global();
const { TypeHandler } = require('./type-handler.class');

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
    } = {}) {


        logger.config = {
            'error': errors || verbose,
            info,
            'debug': verbose,
            'warn': errors || verbose
        };

        //Binding route methods to 'this'
        [
            'returnResponse',
            'resourceConfigRoute'
        ].forEach(routeMethodName => {
            this[routeMethodName] = this[routeMethodName].bind(this);
        });

        this.srcPath = this.constructor.ABSOLUTE_PATH_MATCHER.test(directory) ? directory : path.join(cwd, directory);
        this.cacheLifetime = cacheLifetime;
        this.responseDelay = responseDelay;

        this.server = express();
        this.server.use(this.resourceConfigRoute, TypeHandler.router, this.returnResponse);
        this.server.use(this.constructor.errorHandler);

        return this.server;
    }

    /**
     * @readonly
     * @static
     * @property {Regexp} ABSOLUTE_PATH_MATCHER Regular expression to match an absolute win/*nix path
     * @description Absolute path win/*nix
     * @memberof Mockettaro
     * @example Mockettaro.ABSOLUTE_PATH_MATCHER
     */
    static get ABSOLUTE_PATH_MATCHER() {
        return /(?:^\/)|(?:^\w:\\)/i;
    }

    /**
     * @method resourceConfigRoute
     * @description Configuration Route
     * @param {Express.Request} req Request / previous route params
     * @param {Express.Response} res Response instance
     * @param {Function} next Callback to be called to step forward in route chain
     * @memberof Mockettaro
     * @example const express = require('express');<br>const app = express();<br>...<br>app.use(Mockettaro.resourceConfigRoute);
     */
    resourceConfigRoute( req, res, next ) {
        const {srcPath, cacheLifetime} = this;
        [req.servicePath] = (/^([^?]+)/).exec(req.url);
        req.workingDir = srcPath;
        req.cacheLifetime = cacheLifetime;
        next();
    }

    /**
     * @method returnResponse
     * @description Configuration Route
     * @param {Express.Request} req Request / previous route params
     * @param {Express.Response} res Response instance
     * @memberof Mockettaro
     * @example const express = require('express');<br>const app = express();<br>...<br>app.use(Mockettaro.returnResponse);
     */
    returnResponse( req, res ) {
        const {responseDelay} = this;
        res.append('Access-Control-Allow-Origin', '*');
        if (req.resConfig || req.resBody){
            const config = req.resConfig || {};
            setTimeout(() => {
                Object.entries(config.headers || {})
                    .forEach(( [key, value] ) => {
                        res.append(key, value);
                    });

                res
                    .status(config.status || 200)
                    .end(req.resBody);
                logger.debug(`Headers: ${JSON.stringify(config.headers || {}, 4)}`);
            }, isNaN(config.delay) ? responseDelay : config.delay);
        } else {
            res
                .status(404)
                .send();
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
        logger.warn(err.message);
        res
            .status(500)
            .send(err.message);
    }
}

module.exports = config => new Mockettaro(config);
