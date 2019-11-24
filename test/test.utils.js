const chai = require('chai');
const { expect } = chai;
const logger = require("@marketto/js-logger").global();
const moment = require('moment');

chai.use(require('chai-http'));
chai.use(require('chai-things'));
chai.should();

const testResourcePath = '../examples/mocks';

logger.config = { error: true, info: false, debug: false, warn: false };

module.exports = { expect, logger, testResourcePath, chai, moment };