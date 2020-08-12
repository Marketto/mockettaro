const express = require('express');
const j2xParser = new (require('fast-xml-parser').j2xParser)();
const xmlBodyparser = require('express-xml-bodyparser');
const logger = require('@marketto/js-logger').global();
const { RequestValidator } = require('./request-validator.class');
const { ResourceLoader } = require('./resource-loader.class');

class TypeHandler {
    /**
    * @description Hanlde Route by accepted request type
    * @static
    * @property {Router} router
    * @memberof TypeHandler
    */
    static get router() {
        const router = express.Router();

        router.use(
            express.json(),
            express.urlencoded({ extended: true }),
            xmlBodyparser(),
            RequestValidator.jsonSchemaRoute,
            ResourceLoader.resourceRoute,
            ResourceLoader.resourceConfigRoute,
            this.encodeResponseBody
        );
        return router;
    }

    /**
     * @description Encode body to accepted format if handled
     * @static
     * @method encodeResponseBody
     * @param {Express.Request} req Request
     * @param {Express.Response} res Response
     * @param {Function} next Next route
     * @memberof TypeHandler
     */
    static encodeResponseBody(req, res, next) {
        const [type] = ResourceLoader.acceptedTypes(req);
        if (req.resBody) {
            req.resJsonBody = req.resBody;
            req.resConfig = req.resConfig || {};
            req.resConfig.headers = req.resConfig.headers || {};

            switch(type) {
                case 'xml':
                    req.resBody = `<?xml version="1.0" encoding="UTF-8" ?>${j2xParser.parse(req.resJsonBody)}`;
                    Object.assign(req.resConfig.headers, {
                        'Content-Type': 'application/xml'
                    });
                    break;
                case 'json':
                    req.resBody = JSON.stringify(req.resJsonBody);
                    Object.assign(req.resConfig.headers, {
                        'Content-Type': 'application/json'
                    });
                    break;
                default:
            }
        }

        logger.debug(`response body: ${req.resBody}`);
        next();
    }
}

module.exports.TypeHandler = TypeHandler;