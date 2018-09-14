'use strict';

//dependencies
const logger = require('./logger').global();
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const { RequestValidator } = require('./request-validator');
const { ResourceLoader } = require('./file-loader');


function mockServe({directory = './', responseDelay = 0, cacheLifetime = 3000, verbose = false, errors = true } = {
    directory : './', responseDelay : 0, cacheLifetime : 3000, verbose : false, errors : true
}) {

    logger.config = {
        'error': errors,
        'info': verbose,
        'debug': verbose,
        'warn': errors
    };

    const server = express();
    server.use(bodyParser.json());
    server.use(bodyParser.urlencoded({ extended: true }));

    function configRoute(req, res, next){
        req.servicePath = path.join(directory, (/^([^?]+)/).exec(req.url)[0]);
        req.cacheLifetime = cacheLifetime;
        next();
    }

    function returnResponse(req, res) {
        if (req.resStatusCode || req.resBody){
            setTimeout(() => {
                Object.entries(req.resHeader||{}).forEach(([header, value]) => {
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

    function errorHandler(err, req, res, next) {

        if (err && err.message && err.code && err.code > 399 && err.code < 600){
            logger.warn(err.message);

            res
                .status(err.code)
                .send(err.message);

        } else {
            logger.error(err);
        
            res
                .status(500)
                .send(err);
        }
    }

    server.use(configRoute, RequestValidator.jsonSchemaRoute, ResourceLoader.statusCodeRoute, ResourceLoader.jsonRoute, returnResponse);
    server.use(errorHandler);
    return server;
}

module.exports = mockServe;