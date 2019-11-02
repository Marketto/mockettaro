const chai = require('chai');
const logger = require("@marketto/js-logger").global();

chai.use(require('chai-things'));
chai.should();

logger.config = { error: true, info: false, debug: false, warn: false };

describe('Commandline', () => {
    const { exec } = require('child_process');
    const pkgjson = require('../package.json');

    it('Should return package version', done => {
        exec(`node ${pkgjson.bin.mockettaro} -v`, (err, stdout, stderr) => {
            (!err).should.be.true;
            (!stderr).should.be.true;
            stdout.should.match(new RegExp(`\\s*${pkgjson.version}\\s*`));
            if (err) {
                logger.error(err);
            }
            if (stderr) {
                logger.error(err);
            }
            done();
        });
    }).timeout(2500);
});