const CONFIG = require('./config');
const fs = require('fs');
const path = require('path');
const logger = require('@marketto/js-logger').global();
const memoryCache = require('memory-cache');
const fastXmlParser = require('fast-xml-parser');
const yaml = require('js-yaml');
const { PathRetriever } = require('./path-retriever.class');

/**
 * @description Resource loader utility
 * @class ResourceLoader
 */
class ResourceLoader {

    /**
     * @description Hanlde Route Http Config yaml
     * @static
     * @method statusCodeRoute
     * @param {Express.Request} req Request
     * @param {Express.Response} res Response
     * @param {Function} next Next route
     * @memberof ResourceLoader
     */
    static resourceConfigRoute(req, res, next) {

        const cacheKey = JSON.stringify([req.servicePath, req.method, 'config']);
        const cachedConfig = memoryCache.get(cacheKey);
        const cacheLifetime = req.cacheLifetime || 300;

        if (cachedConfig) {
            logger.info(`Code Served from cache for ${req.method} on ${req.url}`);

            req.resConfig = cachedConfig;
            res.append('cached-config', 'ResourceLoader');

            return next();
        }

        const configPath = PathRetriever.find({
            target : req.servicePath,
            ext : 'config.yml',
            prefix: req.method,
            cwd: req.workingDir
        });

        logger.debug(`[ConfigPath] ${configPath}`);

        if (!configPath) {
            logger.debug(`Config File not found`);
            return next();
        }

        logger.debug(`Config File found`);
        try{
            const parsedConfig = yaml.safeLoad(fs.readFileSync(configPath)) || {};

            if (typeof parsedConfig !== 'object'){
                throw new Error(`Yaml syntax error`);
            }

            //Checking status code
            if (parsedConfig.status) {
                const parsedStatus = parseInt(parsedConfig.status);
                if (!isNaN(parsedStatus) && parsedStatus >= 100 && parsedStatus < 600) {
                    parsedConfig.status = parsedStatus;
                    logger.info(`Status Code loaded: ${parsedStatus}`);
                } else {
                    return next(new Error(`Provided config status is not a valid number between 100 and 599`));
                }
            }

            //Checking delay value
            if (parsedConfig.delay) {
                const parsedDelay = parseInt(parsedConfig.delay);
                if (!isNaN(parsedDelay) && parsedDelay >= 0 && parsedDelay <= CONFIG.MAX_DELAY) {
                    parsedConfig.delay = parsedDelay;
                    logger.info(`Delay Code loaded: ${parsedDelay}`);
                } else {
                    return next(new Error(`Provided config delay is not a valid number between 0 and ${CONFIG.MAX_DELAY}`));
                }
            }

            req.resConfig = parsedConfig;
            memoryCache.put(cacheKey, parsedConfig, cacheLifetime);

            logger.info(`Config loaded ${configPath}: ${parsedConfig}`);
        } catch (e){
            return next(new Error(`Unable to read config.yml file @${configPath} ${e.message}`));
        }

        return next();
    }

    /**
     * @property {Array<string>} TYPES
     * @readonly
     * @static
     * @memberof ResourceLoader
     */
    static get TYPES() {
        return ['json', 'xml', 'txt'];
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
            },
            txt: input => input
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
            res.append('cached-response', 'ResourceLoader');
            req.resBody = cachedData;

            return next();
        }
        logger.debug(`Accepted types: ${JSON.stringify(acceptedTypes)}`);
        const mockPath = PathRetriever.find({
            target : req.servicePath,
            ext : acceptedTypes,
            prefix: req.method,
            cwd: req.workingDir
        });

        if (!mockPath){
            logger.info(`File not found for ${req.servicePath}`);
            return next();

        }

        logger.info(`File found: ${mockPath}`);
        try{
            const jsonData = ResourceLoader.autoParse(fs.readFileSync(mockPath, {
                encoding: 'utf-8'
            }), path.extname(mockPath));
            memoryCache.put(cacheKey, jsonData, cacheLifetime);
            logger.debug(`Served ${mockPath} for ${req.method} on ${req.url}`);
            req.resBody = jsonData;
        } catch (err) {
            return next(new Error(`Unable to read or parse file @${mockPath} ${err}`));
        }
        return next();
    }
}

exports.ResourceLoader = ResourceLoader;
