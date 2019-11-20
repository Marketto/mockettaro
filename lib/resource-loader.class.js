const fs = require('fs');
const path = require('path');
const logger = require('@marketto/js-logger').global();
const memoryCache = require('memory-cache');
const fastXmlParser = require('fast-xml-parser');
const { PathRetriever } = require('./path-retriever.class');

/**
 * @description Resource loader utility
 * @class ResourceLoader
 */
class ResourceLoader {
    /**
     * @description Hanlde Route Http Status Code
     * @static
     * @method statusCodeRoute
     * @param {Express.Request} req Request
     * @param {Express.Response} res Response
     * @param {Function} next Next route
     * @memberof ResourceLoader
     */
    static statusCodeRoute(req, res, next) {

        const cacheKey = JSON.stringify([req.servicePath, req.method, 'code']);
        const cachedStatus = memoryCache.get(cacheKey);
        const cacheLifetime = req.cacheLifetime || 300;

        if (cachedStatus && !isNaN(cachedStatus)) {
            logger.info(`Code Served from cache for ${req.method} on ${req.url}`);
            req.resHeader = Object.assign(req.resHeader || {}, {'cached-status': 'ResourceLoader'});
            req.resStatusCode = cachedStatus;

            next();
            return;
        }

        const statusCodePath = PathRetriever.find({
            target : req.servicePath,
            ext : 'code',
            prefix: req.method,
            cwd: req.workingDir
        });

        logger.debug(`[StatusCodePath] ${statusCodePath}`);

        if (statusCodePath) {
            try{
                const parsedStatusCode = parseInt(fs.readFileSync(statusCodePath));
                if (!isNaN(parsedStatusCode) && parsedStatusCode >= 100 && parsedStatusCode < 600) {
                    req.resStatusCode = parsedStatusCode;
                    memoryCache.put(cacheKey, parsedStatusCode, cacheLifetime);
                    logger.info(`Status Code loaded ${statusCodePath}: ${parsedStatusCode}`);

                    next();
                    return;
                }
                next(new Error(`Provided status code is not a valid number between 100 and 599`));
            } catch (e){
                next(new Error(`Unable to read status code file @${statusCodePath} ${e}`));
            }
            return;
        }
        logger.debug(`StatusCode File not found`);
        next();
    }

    /**
     * @description Hanlde Route Http delay value
     * @static
     * @method delayRoute
     * @param {Express.req} req Request
     * @param {Express.res} res Response
     * @param {Express.next} next Next route
     * @memberof ResourceLoader
     */
    static delayRoute(req, res, next) {

        const cacheKey = JSON.stringify([req.servicePath, req.method, 'delay']);
        const cachedStatus = memoryCache.get(cacheKey);
        const cacheLifetime = req.cacheLifetime || 300;

        if (cachedStatus && !isNaN(cachedStatus)) {
            logger.info(`Code Served from cache for ${req.method} on ${req.url}`);
            req.resHeader = Object.assign(req.resHeader || {}, {'cached-status': 'ResourceLoader'});
            req.resStatusCode = cachedStatus;

            next();
            return;
        }

        const delayPath = PathRetriever.find({
            target : req.servicePath,
            ext : 'delay',
            prefix: req.method,
            cwd: req.workingDir
        });

        logger.debug(`[DelayPath] ${delayPath}`);

        if (delayPath) {
            try{
                const MAX_DELAY = 120000;
                const parsedDelay = parseInt(fs.readFileSync(delayPath));
                if (!isNaN(parsedDelay) && parsedDelay >= 0 && parsedDelay <= MAX_DELAY) {
                    req.resDelay = parsedDelay;
                    memoryCache.put(cacheKey, parsedDelay, cacheLifetime);
                    logger.info(`Delay Code loaded ${delayPath}: ${parsedDelay}`);

                    next();
                    return;
                }
                next(new Error(`Provided delay is not a valid number between 0 and ${MAX_DELAY}`));
            } catch (e){
                next(new Error(`Unable to read delay file @${delayPath} ${e}`));
            }
            return;
        }
        logger.debug(`StatusCode File not found`);
        next();
    }

    /**
     * @property {Array<string>} TYPES
     * @readonly
     * @static
     * @memberof ResourceLoader
     */
    static get TYPES() {
        return ['json', 'xml'];
    }

    /**
     * @description Determinates mock types to seek based on accept request header
     * @static
     * @method acceptedTypes
     * @param {Express.Request} req Request
     * @returns {Array<string>}
     * @memberof ResourceLoader
     */
    static acceptedTypes(req) {
        logger.debug(`Req accept JSON: ${req.accepts('json')}`);
        logger.debug(`Req accept XML: ${req.accepts('xml')}`);
        return this.TYPES.sort((typeA, typeB) => !req.accepts(typeA) - !req.accepts(typeB));
    }

    /**
     * @description Recognize content type and returns it parsed
     * @static
     * @param {string} content Raw content to parse
     * @param {string} fileExtension fileExtension
     * @returns {Object}
     * @memberof ResourceLoader
     */
    static autoParse(content, fileExtension) {
        const fileType = ((fileExtension.match(/[^.]+$/i) || [])[0] || '').toLowerCase();
        const PARSE_CFG = {
            xml: input => {
                const valid = fastXmlParser.validate(input);
                if (valid !== true) {
                    throw new Error(valid.err.msg);
                }
                return fastXmlParser.parse(input);
            },
            json: input => {
                return JSON.parse(input);
            }
        };

        logger.debug(`Content type ${fileType}`);

        const parser = PARSE_CFG[fileType];
        if (!parser) {
            throw new Error(`Can't parse ${fileType} files`);
        }
        return parser(content);
    }

    /**
     * @description Hanlde Route Http response raw body (json/xml etc) and request json-schema validation
     * @static
     * @method statusCodeRoute
     * @param {Express.Request} req Request
     * @param {Express.Response} res Response
     * @param {Function} next Next route
     * @memberof ResourceLoader
     */
    static resourceRoute(req, res, next){
        const acceptedTypes = ResourceLoader.acceptedTypes(req);
        const cacheKey = JSON.stringify([req.servicePath, req.method, ...acceptedTypes]);
        const cachedData = memoryCache.get(cacheKey);
        const cacheLifetime = req.cacheLifetime || 300;

        if (cachedData) {
            logger.info(`Body Served from cache for ${req.method} on ${req.url}`);
            req.resHeader = Object.assign(req.resHeader||{}, {'cached-response': 'ResourceLoader'});
            req.resBody = cachedData;

            next();
        } else {
            logger.debug(`Accepted types: ${JSON.stringify(acceptedTypes)}`);
            const mockPath = PathRetriever.find({
                target : req.servicePath,
                ext : acceptedTypes,
                prefix: req.method,
                cwd: req.workingDir
            });
            if (mockPath){
                logger.info(`File found: ${mockPath}`);
                try{
                    const jsonData = ResourceLoader.autoParse(fs.readFileSync(mockPath, {
                        encoding: 'utf-8'
                    }), path.extname(mockPath));
                    memoryCache.put(cacheKey, jsonData, cacheLifetime);
                    logger.debug(`Served ${mockPath} for ${req.method} on ${req.url}`);
                    req.resBody = jsonData;

                    next();
                } catch (err) {
                    next(new Error(`Unable to read or parse file @${mockPath} ${err}`));
                }
            } else {
                logger.info(`File not found for ${req.servicePath}`);
                next();
            }
        }
    }
}

exports.ResourceLoader = ResourceLoader;
