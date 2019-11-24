const { chai } = require('./test.utils');

describe('Mockettaro Error handling', () => {
    const testResourcePath = '../examples/mocks';
    const testPort = Math.round(3000 + (Math.random() * 6999));

    const server = require('express')();
    let testServer;
    before(done => {
        const { mockettaro } = require('../');

        const debugMode = false;
        server.use('/test', mockettaro({
            directory: testResourcePath,
            cwd: __dirname,
            errors: debugMode,
            verbose: debugMode,
            info: debugMode
        }));
        testServer = server.listen(testPort, done);
    });

    describe('Missing Json, Code, JsonSchema and default', () => {
        it('Should return status 404 on GET', done => {
            chai.request(server).get('/test/errors/missingReasource')
            .set('Accept', 'application/json')
            .end((req, res) => {
                res.status.should.be.equal(404);
                res.header.should.not.own.property('cached-response');
                res.header.should.not.own.property('cached-status');
                done();
            });
        });
    });

    describe('Json file read', () => {
        it('Should return status 500 on GET', done => {
            chai.request(server).get('/test/errors/invalidJson')
            .set('Accept', 'application/json')
            .end((req, res) => {
                res.status.should.be.equal(500);
                res.header.should.not.own.property('cached-response');
                res.header.should.not.own.property('cached-status');
                done();
            });
        });
    });

    describe('Json Schema file read', () => {
        it('Should return status 500 on POST', done => {
            chai.request(server).post('/test/errors/invalidSchema')
            .set('Accept', 'application/json')
            .end((req, res) => {
                res.status.should.be.equal(500);
                res.header.should.not.own.property('cached-response');
                res.header.should.not.own.property('cached-status');
                done();
            });
        });
    });

    describe('Code file read', () => {
        it('Should return status 500 on GET', done => {
            chai.request(server).get('/test/errors/invalidCode')
            .set('Accept', 'application/json')
            .end((req, res) => {
                res.status.should.be.equal(500);
                res.header.should.not.own.property('cached-response');
                res.header.should.not.own.property('cached-status');
                done();
            });
        });
    });

    describe('Delay file read', () => {
        it('Should return status 500 on GET', done => {
            chai.request(server).get('/test/errors/invalidDelay')
            .set('Accept', 'application/json')
            .end((req, res) => {
                res.status.should.be.equal(500);
                res.header.should.not.own.property('cached-response');
                res.header.should.not.own.property('cached-status');
                done();
            });
        });
    });

    after(() => {
        if (testServer){
            testServer.close();
            testServer = undefined;
        }
    });
});