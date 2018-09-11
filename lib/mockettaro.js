'use strict';

//dependencies
require('colors');

const fs = require('fs');
const path = require('path');
const jsonschemaValidator = require('jsonschema').Validator;
const memoryCache = require('memory-cache');
const express = require('express');
const bodyParser = require('body-parser');

//consts
const DEFAULT_RESOURCE = "default";

function mockServe(resourcesPath = '/', { rootPath = './', responseDelay = 0, cacheLifetime = 3000, verbose = false, errors = true} = {}) {
    const server = express();
    server.use(bodyParser.json());
    server.use(bodyParser.urlencoded({ extended: true }));

    function servicePath(req, res, next){
        req.servicePath = path.join(resourcesPath, (/^([^?]+)/).exec(req.url)[0]);
        next();
    }

    //INPUT
    function validateRequest(req, res, next) {
        const jsonschemaPath = pathExists(req.servicePath,'schema.json', req.method);
        
        function jsonSchemaReadError(err) {
            errors && console.error(`ERROR reading Json-schema file to validate request @${jsonschemaPath} ${err}`.red);
            res
                .status(500)
                .send(err);
        }
        
        if (jsonschemaPath){
            fs.readFile(jsonschemaPath, {
                encoding: 'utf-8'
            }, function (err, data) {
                if(err){
                    jsonSchemaReadError(err);

                } else {
                    try {
                        const jsonSchema = JSON.parse(data);
                        const jsv = new jsonschemaValidator();
                        if (jsv.validate(req.method === 'GET' ? req.params : req.body, jsonSchema).valid) {
                            verbose && console.log(`Valid request matching ${jsonschemaPath}`.green);

                            next();

                        } else {
                            verbose && console.log(`Invalid request matching ${jsonschemaPath}`.red);

                            res
                                .status(400)
                                .send("Request doesn't match the its schema");
                        }
                    } catch (err) {
                        jsonSchemaReadError(err);
                    }
                }
            });
        } else {
            next();
        }
    }

    function loadBody(req, res, next) {
        const cacheKey = JSON.stringify([req.servicePath, req.method])
        const cachedData = memoryCache.get(cacheKey);

        if (cachedData) {
            verbose && console.log(`Body Served from cache for ${req.method} on ${req.url}`.blue);
            req.resHeader = Object.assign(req.resHeader||{}, {'cached-response': 'Mockettaro'});
            req.resBody = cachedData;
            next();

        } else {
            const mockPath = pathExists(req.servicePath, 'json', req.method);
            if (mockPath){
                
                fs.readFile(mockPath, {
                    encoding: 'utf-8'
                }, function (err, data) {
                    setTimeout(function () {
                        try {
                            if (err){
                                throw err;
                            }
                            const jsonData = JSON.parse(data);
    
                            memoryCache.put(cacheKey, jsonData, cacheLifetime);
    
                            verbose && console.log(`Served ${mockPath} for ${req.method} on ${req.url}`.green);
    
                            req.resBody = jsonData;
                            next();

                        } catch (e) {
                            errors && console.error(`ERROR reading json file @${mockPath} ${e}`.red);
                            res
                                .status(500)
                                .send(e);
                        }
                    }, responseDelay);
                });
            } else {
                next();
            }
        }
    }
    
    //STATUS CODE
    function loadStatusCode(req, res, next) {
        const cacheKey = JSON.stringify([req.servicePath, req.method, 'code'])
        const cachedStatus = memoryCache.get(cacheKey);

        if (cachedStatus && !isNaN(cachedStatus)) {
            verbose && console.log(`Code Served from cache for ${req.method} on ${req.url}`.blue);
            req.resHeader = Object.assign(req.resHeader||{}, {'cached-status': 'Mockettaro'});
            req.resStatusCode = cachedStatus;
            next();
        } else {
            const statusCodePath = pathExists(req.servicePath, 'code', req.method);
            verbose && console.log(`[StatusCodePath] ${statusCodePath}`);
            if (statusCodePath) {
                try{
                    const parsedStatusCode = parseInt(fs.readFileSync(statusCodePath));
                    if (!isNaN(parsedStatusCode) && parsedStatusCode >= 100 && parsedStatusCode<600) {
                        req.resStatusCode = parsedStatusCode;
                        memoryCache.put(cacheKey, parsedStatusCode);
                        verbose && console.log(`Status Code loaded ${statusCodePath}: ${parsedStatusCode}`);
                        next();
                    } else {
                        throw new Error(`Provided status code is not a valid number between 100 and 599`);
                    }
                } catch (e){
                    errors && console.error(`ERROR reading status code file @${statusCodePath} ${e}`.red);
                    res.status(500).send(e);
                }
            } else {
                verbose && console.log(`Status Code File or cache not found`);
                next();
            }
        }
    }

    function pathExists(servicePath = "", ext = 'json', method) {
        
        function partialSearch(pathArray) {
            const subPathArray = pathArray.slice(0, pathArray.length - 1);
            const alternativePathArray = (subPathArray).concat(DEFAULT_RESOURCE);
            
            if (pathArray.length > 1) {
                const subSearchResults = partialSearch(subPathArray);
                
                let resultList = [pathArray];
                
                subSearchResults
                    .map(pp => pp.concat(pathArray[pathArray.length - 1]))
                    .forEach(pp=>{
                        resultList.push(pp);
                    });
                
                resultList.push(alternativePathArray);

                subSearchResults
                    .map(pp => pp.concat(DEFAULT_RESOURCE))
                    .forEach(pp => {
                        resultList.push(pp);
                    });

                return resultList;
            } else {
                return [
                    pathArray,
                    alternativePathArray
                ];
            }
        }

        function fullSearch(resPath) {
            const pathArray = resPath.split("/")
                .filter(e => !!e);
            const partialResults = partialSearch(pathArray);
            const fullResults = [];
            for (let i = 0; i < partialResults.length; i++) {
                const partialPathStr = partialResults[i].join("/");
                fullResults.push(`${partialPathStr}.${method}.${ext}`);
                fullResults.push(`${partialPathStr}.${ext}`);
            }
            verbose && console.log(`Path FullSearch: ${JSON.stringify(fullResults, null, 4)}`);
            return fullResults;
        }

        const pathSearchResults = fullSearch(servicePath).find(pathToCheck => {
                return fs.existsSync(pathToCheck);
            });

        
        verbose && console.log(`Path search results: ${pathSearchResults}`);

        return pathSearchResults;
    }

    function returnResponse(req, res) {
        if (req.resStatusCode || req.resBody){
            Object.entries(req.resHeader||{}).forEach(([header, value])=>{
                res.append(header, value);
            });

            res
                .status(req.resStatusCode||200)
                .send(req.resBody);
        } else {
            res
                .status(404)
                .send();
        }
    }

    server.all('/*', servicePath, validateRequest, loadStatusCode, loadBody, returnResponse);
    return server;
}

exports.serve = mockServe;