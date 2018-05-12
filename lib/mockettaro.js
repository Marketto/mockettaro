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

function mockServe(resourcesPath = '/', { rootPath = './', responseDelay = 0, cacheLifetime = 3000} = {}) {
    const server = express();
    server.use(bodyParser.json());
    server.use(bodyParser.urlencoded({ extended: true }));

    function mockProvider(req, res) {
        
        //INPUT
        function validateRequest(servicePath) {
            const jsonschemaPath = `${servicePath}.schema.${req.method}.json`;

            fs.readFile(jsonschemaPath, {
                encoding: 'utf-8'
            }, function (err, data) {
                if(err){
                    console.log(`Couldn't find Json-schema to validate request @${jsonschemaPath}`.yellow);

                    loadJson(servicePath);

                } else {
                    const jsv = new jsonschemaValidator();
                    if (jsv.validate(req.method === 'GET' ? req.params : req.body, JSON.parse(data)).valid) {
                        console.log(`Valid request matching ${jsonschemaPath}`.green);

                        loadJson(servicePath);

                    } else {
                        console.log(`Invalid request matching ${jsonschemaPath}`.red);

                        res
                            .status(400)
                            .send("Request doesn't match the its schema");
                    }
                }
            });
        }


        //OUTPUT
        function loadJson(path) {
            const cacheKey = JSON.stringify([path, req.method])
            const cachedData = memoryCache.get(cacheKey);
            const statusCode = loadStatusCode(path);

            if (cachedData) {
                console.log(`Served from cache for ${req.method} on ${req.url}`.blue);

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
                console.log(statusCodePath);
                const statusCode = statusCodePath && parseInt(fs.readFileSync(statusCodePath));
                
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
                } else if (fs.existsSync(`${pathWithDefault}.${ext}`)) {
                    pathArray = pathWithDefault.split("/");
                    break;
                } else {
                    continue;
                }
            }

            const srcPath = `${path.join.apply(null, pathArray)}.${ext}`;
            console.log(srcPath);

            return fs.existsSync(srcPath) ? srcPath : undefined;
        }

        function responseHandler(fullPath, cacheKey, statusCode) {
            fs.readFile(fullPath, {
                encoding: 'utf-8'
            }, function (err, data) {
                setTimeout(function () {
                    if(err){
                        console.log(`ERROR reading json file:\n${JSON.stringify(err,null, 4)}`.red);

                        res
                            .status(500)
                            .send(err);

                    } else {
                        const jsonData = JSON.parse(data);
                        memoryCache.put(cacheKey, jsonData, cacheLifetime);

                        console.log(`Served ${fullPath} for ${req.method} on ${req.url}`.green);

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