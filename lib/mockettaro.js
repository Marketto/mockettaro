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

function mockServe(resourcesPath = '/', { rootPath = './', responseDelay = 0, cacheLifetime = 3000, verbose = false} = {}) {
    const server = express();
    server.use(bodyParser.json());
    server.use(bodyParser.urlencoded({ extended: true }));

    function mockProvider(req, res) {
        
        //INPUT
        function validateRequest(servicePath) {
            const jsonschemaPath = pathExists(`${servicePath}.schema`) || pathExists(servicePath,'schema.json');
            if (jsonschemaPath){
                fs.readFile(jsonschemaPath, {
                    encoding: 'utf-8'
                }, function (err, data) {
                    if(err){
                        console.error(`ERROR reading Json-schema file to validate request @${jsonschemaPath}`.red);

                        res
                            .status(500)
                            .send(`ERROR reading Json-schema file to validate request @${jsonschemaPath}`);

                    } else {
                        const jsv = new jsonschemaValidator();
                        if (jsv.validate(req.method === 'GET' ? req.params : req.body, JSON.parse(data)).valid) {
                            verbose && console.log(`Valid request matching ${jsonschemaPath}`.green);

                            loadJson(servicePath);

                        } else {
                            verbose && console.log(`Invalid request matching ${jsonschemaPath}`.red);

                            res
                                .status(400)
                                .send("Request doesn't match the its schema");
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

                res.status(statusCode||200).json(cachedData);

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
                return cachedStatus;
            } else {
                const statusCodePath = pathExists(path, 'code');
                verbose && console.log(statusCodePath);
                let statusCodeString;
                if (statusCodePath) {
                    try{
                        statusCodeString = fs.readFileSync(statusCodePath);
                    } catch (e){
                        console.error(`ERROR reading status code file @${statusCodePath} ${e}`.red);
                        statusCodeString = 500;
                    }
                }
                const statusCode = statusCodeString && parseInt(statusCodeString);
                
                memoryCache.put(cacheKey, statusCode);
                return statusCode;
            }
        }

        function pathExists(servicePath = "", ext = 'json') {
            let pathArray = servicePath.split("/").filter(function (e) { return !!e });
            for (let i = 0; i < pathArray.length; i++) {
                let pathWithDefault;
                if (i < pathArray.length - 1) {
                    pathWithDefault = path.join.apply(null, pathArray.slice(0, i).concat(DEFAULT_RESOURCE, pathArray.slice(i + 1)));
                } else {
                    pathWithDefault = path.join.apply(null, pathArray.slice(0, i).concat(DEFAULT_RESOURCE));
                }
                let pathToCheck = ((i < pathArray.length - 2) ? pathArray.slice(0, i + 1) : pathArray);
                if (fs.existsSync(`${path.join.apply(null, pathToCheck)}.${req.method}.${ext}`)) {
                    pathToCheck[pathToCheck.length - 1] = `${pathToCheck[pathToCheck.length - 1]}.${req.method}`;
                    pathArray = pathToCheck;
                    break;
                } else if (fs.existsSync(`${pathToCheck}.${ext}`)) {
                    pathArray = pathToCheck;
                    break;
                } else if (fs.existsSync(`${pathWithDefault}.${req.method}.${ext}`)) {
                    pathArray = `${pathWithDefault}.${req.method}`.split("/");
                    break;
                } else if (fs.existsSync(`${pathWithDefault}.${ext}`)) {
                    pathArray = pathWithDefault.split("/");
                    break;
                } else {
                    continue;
                }
            }

            const srcPath = `${path.join.apply(null, pathArray)}.${ext}`;
            verbose && console.log(srcPath);

            return fs.existsSync(srcPath) ? srcPath : undefined;
        }

        function responseHandler(fullPath, cacheKey, statusCode) {
            fs.readFile(fullPath, {
                encoding: 'utf-8'
            }, function (err, data) {
                setTimeout(function () {
                    if(err){
                        console.error(`ERROR reading json file:\n${JSON.stringify(err,null, 4)}`.red);

                        res
                            .status(500)
                            .send(err);

                    } else {
                        const jsonData = JSON.parse(data);
                        memoryCache.put(cacheKey, jsonData, cacheLifetime);

                        verbose && console.log(`Served ${fullPath} for ${req.method} on ${req.url}`.green);

                        res
                            .status(statusCode)
                            .json(jsonData);

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