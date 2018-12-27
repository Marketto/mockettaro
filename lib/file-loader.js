'use strict';

const logger = require('./logger').global();
const fs = require('fs');
const memoryCache = require('memory-cache');
const { PathRetriever } = require('./path-retriever');

class ResourceLoader {
    static statusCodeRoute(req, res, next) {
        const cacheKey = JSON.stringify([req.servicePath, req.method, 'code'])
        const cachedStatus = memoryCache.get(cacheKey);
        const cacheLifetime = req.cacheLifetime || 300;

        if (cachedStatus && !isNaN(cachedStatus)) {
            logger.info(`Code Served from cache for ${req.method} on ${req.url}`);
            req.resHeader = Object.assign(req.resHeader||{}, {'cached-status': 'ResourceLoader'});
            req.resStatusCode = cachedStatus;

            next();
        } else {
            const statusCodePath = PathRetriever.find({
                'target'  : req.servicePath, 
                'ext'     : 'code',
                'prefix'  : req.method
            });

            logger.debug(`[StatusCodePath] ${statusCodePath}`);

            if (statusCodePath) {
                try{
                    const parsedStatusCode = parseInt(fs.readFileSync(statusCodePath));
                    if (!isNaN(parsedStatusCode) && parsedStatusCode >= 100 && parsedStatusCode<600) {
                        req.resStatusCode = parsedStatusCode;
                        memoryCache.put(cacheKey, parsedStatusCode, cacheLifetime);
                        logger.info(`Status Code loaded ${statusCodePath}: ${parsedStatusCode}`);

                        next();
                    } else {
                        next(new Error(`Provided status code is not a valid number between 100 and 599`));
                    }
                } catch (e){
                    next(new Error(`Unable to read status code file @${statusCodePath} ${e}`));
                }
            } else {
                logger.debug(`StatusCode File not found`);
                next();
            }
        }
    }

    static jsonRoute(req, res, next){
        const cacheKey = JSON.stringify([req.servicePath, req.method])
        const cachedData = memoryCache.get(cacheKey);
        const cacheLifetime = req.cacheLifetime || 300;

        if (cachedData) {
            logger.info(`Body Served from cache for ${req.method} on ${req.url}`);
            req.resHeader = Object.assign(req.resHeader||{}, {'cached-response': 'ResourceLoader'});
            req.resBody = cachedData;

            next();
            
        } else {
            const mockPath = PathRetriever.find({
                'target': req.servicePath, 
                'ext'   : 'json', 
                'prefix': req.method
            });
            if (mockPath){
                logger.info(`JSON File found: ${mockPath}`);
                try{
                    const jsonData = JSON.parse(fs.readFileSync(mockPath, {
                        encoding: 'utf-8'
                    }));
                    memoryCache.put(cacheKey, jsonData, cacheLifetime);
                    logger.debug(`Served ${mockPath} for ${req.method} on ${req.url}`);
                    req.resBody = jsonData;

                    next();

                } catch (err) {
                    next(new Error(`Unable to read or parse JSON file @${mockPath} ${err}`));
                }
            } else {
                logger.info(`JSON File not found for ${req.servicePath}`);
                next();
            }
        }
    }

    static xmlRoute(req, res, next){

    }
}

exports.ResourceLoader = ResourceLoader;