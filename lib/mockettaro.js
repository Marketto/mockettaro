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

    function mockProvider(req, res) {
        
        //INPUT
        function validateRequest(servicePath) {
            const jsonschemaPath = pathExists(`${servicePath}.schema`) || pathExists(servicePath,'schema.json');
            
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

                                loadJson(servicePath);

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
                loadJson(servicePath);
            }
        }


        //OUTPUT
        function loadJson(path) {
            const cacheKey = JSON.stringify([path, req.method])
            const cachedData = memoryCache.get(cacheKey);
            const statusCode = loadStatusCode(path);

            if (cachedData) {
                verbose && console.log(`Served from cache for ${req.method} on ${req.url}`.blue);

                res.status(statusCode||200).append('cached-response', 'Mockettaro').json(cachedData);

            } else {
                const mockPath = pathExists(path);
                if (mockPath){
                    return responseHandler(mockPath, cacheKey, statusCode||200);
                } else if (statusCode){
                    res.status(statusCode).send();
                } else {
                    res.status(404).send();
                }
            }
        }

        //STATUS CODE
        function loadStatusCode(path){
            const cacheKey = JSON.stringify([path, req.method, 'code'])
            const cachedStatus = memoryCache.get(cacheKey);
            if (cachedStatus) {
                res.append('cached-status', 'Mockettaro')
                return cachedStatus;
            } else {
                const statusCodePath = pathExists(path, 'code');
                verbose && console.log(statusCodePath);
                let statusCode;
                if (statusCodePath) {
                    try{
                        const parsedStatusCode = parseInt(fs.readFileSync(statusCodePath));
                        if (!isNaN(parsedStatusCode) && parsedStatusCode >= 100 && parsedStatusCode<600) {
                            statusCode = parsedStatusCode;
                        } else {
                            throw new Error(`Provided status code is not a valid number between 100 and 599`);
                        }
                    } catch (e){
                        errors && console.error(`ERROR reading status code file @${statusCodePath} ${e}`.red);
                        statusCode = 500;
                    }
                }
                
                memoryCache.put(cacheKey, statusCode);
                return statusCode;
            }
        }

        function pathExists(servicePath = "", ext = 'json') {
            
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

            function fullSearch(path) {
                const pathArray = path.split("/")
                    .filter(e => !!e);
                const partialResults = partialSearch(pathArray);
                const fullResults = [];
                for (let i = 0; i < partialResults.length; i++) {
                    const partialPathStr = partialResults[i].join("/");
                    fullResults.push(`${partialPathStr}.${req.method}.${ext}`);
                    fullResults.push(`${partialPathStr}.${ext}`);
                }
                verbose && console.log(JSON.stringify(fullResults, null, 4));
                return fullResults;
            }

            const pathSearchResults = fullSearch(servicePath).find(pathToCheck => {
                    return fs.existsSync(pathToCheck);
                });

            
            verbose && console.log(pathSearchResults);

            return pathSearchResults;
        }

        function responseHandler(fullPath, cacheKey, statusCode) {
            function jsonReadError(err) {
                errors && console.error(`ERROR reading json file @${fullPath} ${err}`.red);
                res
                    .status(500)
                    .send(err);
            }
            
            fs.readFile(fullPath, {
                encoding: 'utf-8'
            }, function (err, data) {
                setTimeout(function () {
                    if(err){
                        jsonReadError(err);
                    } else {
                        try {
                            const jsonData = JSON.parse(data);

                            memoryCache.put(cacheKey, jsonData, cacheLifetime);

                            verbose && console.log(`Served ${fullPath} for ${req.method} on ${req.url}`.green);

                            res
                                .status(statusCode)
                                .json(jsonData);
                        } catch (err) {
                            jsonReadError(err);
                        }

                    }
                }, responseDelay);
            });
        }
        
        validateRequest(path.join(resourcesPath, (/^([^?]+)/).exec(req.url)[0]));

    }

    server.all('/*', mockProvider);
    return server;
}

exports.serve = mockServe;