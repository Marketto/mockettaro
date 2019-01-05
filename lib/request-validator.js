const logger = require("@marketto/js-logger").global();
const fs = require('fs');
const jsonschemaValidator = require('jsonschema').Validator;
const { PathRetriever } = require('./path-retriever');

class RequestValidator {

    static jsonSchemaRoute(req, res, next){
        const jsonschemaPath = PathRetriever.find({
            'target'    : req.servicePath,
            'ext'       : 'schema.json', 
            'prefix'    : req.method
        });
        
        if (jsonschemaPath){
            try {
                const jsonSchema = JSON.parse(fs.readFileSync(jsonschemaPath, {
                    encoding: 'utf-8'
                }));
                const jsv = new jsonschemaValidator();

                if (jsv.validate(req.method === 'GET' ? req.params : req.body, jsonSchema).valid) {
                    logger.info(`Valid request @${req.servicePath} matching ${jsonschemaPath}`);

                    next();

                } else {
                    logger.warn(`Invalid request @${req.servicePath} matching ${jsonschemaPath}`);

                    res
                        .status(400)
                        .send("Request doesn't match schema");
                }
            } catch (err) {
                next(new Error(`Unable to read or parse JSON-Schema file to validate request @${jsonschemaPath} ${err}`));
            }
        } else {
            next();
        }
    }
}

exports.RequestValidator = RequestValidator;