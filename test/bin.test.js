const { expect } = require('./test.utils');

describe('Commandline', () => {
    const { exec } = require('child_process');
    const pkgjson = require('../package.json');

    it('Should return package version', done => {
        exec(`node ${pkgjson.bin.mockettaro} -v`, (err, stdout, stderr) => {
            expect(err).to.be.null;
            stderr.should.be.equal('');
            stdout.should.match(new RegExp(`\\s*${pkgjson.version}\\s*`));
            done();
        });
    }).timeout(2500);

    it('Should return error', done => {
        exec(`node ${pkgjson.bin.mockettaro} -s --verbose`, err => {
            expect(err).to.be.an('Error');
            done();
        });
    }).timeout(2500);
});