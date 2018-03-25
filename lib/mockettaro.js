'use strict';

//dependencies
require('colors');

const fs = require('fs');
const path = require('path');
const jsonschemaValidator = require('jsonschema').Validator;
const memoryCache = require('memory-cache');
const express = require('express');
const bodyParser = require('body-parser');

//settings
const ROOT_PATH = './';
const responseDelay = 0;

//consts
const DEFAULT_RESOURCE = "default";

function mockServe(resourcesPath) {
    const server = express();
    server.use(bodyParser.json());
    server.use(bodyParser.urlencoded({ extended: true }));

    function mockProvider(req, res) {
        
        //INPUT
        function validateRequest(servicePath, request) {
            const jsonschemaPath = `${servicePath}.schema.${request.method}.json`;

            fs.readFile(jsonschemaPath, {
                encoding: 'utf-8'
            }, function (err, data) {
                if(err){
                    console.log(`Couldn't find Json-schema to validate request @${jsonschemaPath}`.yellow);

                    loadJson(servicePath, request.method);

                } else {
                    const jsv = new jsonschemaValidator();
                    if (jsv.validate(request.method === 'GET' ? request.params : request.body, JSON.parse(data)).valid) {
                        console.log(`Valid request matching ${jsonschemaPath}`.green);

                        loadJson(servicePath, request.method);

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
        function loadJson(path, method) {
            const cacheKey = JSON.stringify([path, method])
            const cachedData = memoryCache.get(cacheKey);
            if (cachedData) {
                console.log(`JSON from cache: ${path} ${method}`.blue);

                res.status(200).json(cachedData);

            } else {
                const jsonMock = pathExists(path, method);

                return responseHandler(jsonMock, cacheKey);

            }
        }

        function pathExists(servicePath="", method) {
            let pathArray = servicePath.split("/").filter(function (e) { return !!e });
            for (let i = 0; i < pathArray.length; i++) {
                let pathWithDefault;
                if (i < pathArray.length - 1) {
                    pathWithDefault = pathArray.slice(0, i).concat(DEFAULT_RESOURCE, pathArray.slice(i + 1)).join("/");
                } else {
                    pathWithDefault = pathArray.slice(0, i).concat(DEFAULT_RESOURCE).join("/");
                }
                let pathToCheck = ((i < pathArray.length - 2) ? pathArray.slice(0, i + 1) : pathArray);
                if (fs.existsSync(`${pathToCheck.join("/")}.${method}.json`)) {
                    pathToCheck[pathToCheck.length - 1] = pathToCheck[pathToCheck.length - 1] + `.${method}`;
                    pathArray = pathToCheck;
                    break;
                } else if (fs.existsSync(`${pathToCheck}.json`)) {
                    pathArray = pathToCheck;
                    break;
                } else if (fs.existsSync(pathWithDefault + '.json')) {
                    pathArray = pathWithDefault.split("/");
                    break;
                } else {
                    continue;
                }
            }

            console.log(pathArray.join("/") + '.json');

            return path.join(pathArray.join("/")) + '.json';
        }

        function responseHandler(fullPath, cacheKey) {
            fs.readFile(fullPath, {
                encoding: 'utf-8'
            }, function (err, data) {
                setTimeout(function () {
                    if(err){
                        console.log("ERROR reading json file:\n" + JSON.stringify(err,null, 4).red);

                        res
                            .status(500)
                            .send(err);

                    } else {
                        const jsonData = JSON.parse(data);
                        memoryCache.put(cacheKey, jsonData, 650);
                        res
                            .status(200)
                            .json(jsonData);

                    }
                }, responseDelay);
            });
        }
        
        validateRequest(path.join(resourcesPath, (/^([^?]+)/).exec(req.url)[0]), req);

    }

    server.all('/*', mockProvider);
    return server;
}

exports.serve = mockServe;