const chai = require('chai');

chai.use(require('chai-things'));
chai.use(require('chai-http'));
chai.should();

describe('Mockettaro', ()=>{
    const testResourcePath = '../examples/mocks';

    describe('Express with Mockettaro instance', () => {
        const server = require('express')();
        let testServer;
        before(done => {
            const {mockettaro} = require('../');

            const debugMode = false;
            server.use('/test', mockettaro({
                directory: testResourcePath,
                cwd: __dirname,
                errors: debugMode,
                verbose: debugMode,
                info: debugMode
            }));
            testServer = server.listen(9999, done);
        });

        describe('Cities resource', ()=>{

            describe('Toulouse DELETE', () => {
                it('Should return status 204 and an empty body', done => {
                    chai.request(server).delete('/test/cities/Toulouse')
                        .end((req, res) => {
                            res.status.should.be.equal(204);
                            res.body.should.be.an('object').that.is.empty;
                            res.header.should.not.own.property('cached-response');
                            res.header.should.not.own.property('cached-status');
                            done();
                        });
                });

                it('Should return same status from cache', done => {
                    chai.request(server).delete('/test/cities/Toulouse')
                        .end((req, res) => {
                            res.status.should.be.equal(204);
                            res.body.should.be.an('object').that.is.empty;
                            res.header.should.not.own.property('cached-response');
                            res.header.should.include({
                                'cached-status': 'ResourceLoader'
                            });
                            done();
                        });
                });
            });

            describe('Default PUT', () => {
                it('Should return 202 and a body', done => {
                    chai.request(server).put('/test/cities/Rome')
                        .end((req, res) => {
                            res.status.should.be.equal(202);
                            res.body.should.be.an('object').that.have.property('status').that.is.equal("OK");
                            res.header.should.not.own.property('cached-response');
                            res.header.should.not.own.property('cached-status');
                            done();
                        });
                });
                it('Should return same status and data from cache', done => {
                    chai.request(server).put('/test/cities/Rome')
                        .end((req, res) => {
                            res.status.should.be.equal(202);
                            res.body.should.be.an('object').that.have.property('status').that.is.equal("OK");
                            res.header.should.include({
                                'cached-response': 'ResourceLoader',
                                'cached-status': 'ResourceLoader'
                            });
                            done();
                        });
                });
            });

            describe('GET', () => {
                it('Should return status 200 and an Array of cities on GET from file', done => {
                    chai.request(server).get('/test/cities')
                        .end((req, res) => {
                            res.status.should.be.equal(200);
                            res.body.should.be.an('array').that.include.something.that.deep.equals({
                                "name": "Toulouse"
                            });
                            res.header.should.not.own.property('cached-response');
                            res.header.should.not.own.property('cached-status');
                            done();
                        });
                });

                it('Should return same data from cache', done => {
                    chai.request(server).get('/test/cities')
                        .end((req, res) => {
                            res.status.should.be.equal(200);
                            res.body.should.be.an('array').that.include.something.that.deep.equals({
                                "name": "Toulouse"
                            });
                            res.header.should.include({
                                        'cached-response': 'ResourceLoader'
                                    });
                            res.header.should.not.own.property('cached-status');
                            done();
                        });
                });
            });
            describe('POST', () => {
                it('Should return 201 and a body passing jsonschema validation from file', done => {
                    chai.request(server).post('/test/cities').send({
                            "name": "Naples"
                        })
                        .end((req, res) => {
                            res.status.should.be.equal(201);
                            res.body.should.be.an('object').that.have.property('status').that.is.equal("OK");
                            res.header.should.not.own.property('cached-response');
                            res.header.should.not.own.property('cached-status');
                            done();
                        });
                });
                it('Should return 400 against jsonschema validation', done => {
                    chai.request(server).post('/test/cities')
                        .end((req, res) => {
                            res.status.should.be.equal(400);
                            res.header.should.not.own.property('cached-response');
                            res.header.should.not.own.property('cached-status');
                            done();
                        });
                });
            });

            describe('Rome/San Paolo/shops', () => {
                describe('Any method', () => {
                    it('Should return 200 and a json array of shops', done => {
                        chai.request(server).get('/test/cities/Rome/San Paolo/shops')
                            .end((req, res) => {
                                res.status.should.be.equal(200);
                                res.body.should.be.an('array').that.include.something.that.deep.equals({
                                    "name" : "Figaro",
                                    "type" : "barber shop"
                                });
                                res.header.should.not.own.property('cached-response');
                                res.header.should.not.own.property('cached-status');
                                done();
                            });
                    });
                });

                /*describe('Accepting XML only', () => {
                    it('Should return 200 and an xml of shops', done => {
                        chai.request(server).get('/test/cities/Rome/San Paolo/shops')
                            .set('Accept', 'application/xml')
                            .end((req, res) => {
                                res.status.should.be.equal(200);
                                res.body.should.be.an('object').that.own.property('shop');
                                res.body.shop.should.be.an('array').that.include.something.that.deep.equals({
                                    "name" : "Figaro",
                                    "type" : "barber shop"
                                });
                                res.header.should.not.own.property('cached-response');
                                res.header.should.not.own.property('cached-status');
                                done();
                            });
                    });
                });*/
            });
        });

        describe('Error handling', () => {
            describe('Missing Json, Code, JsonSchema and default', () => {
                it('Should return status 404 on GET', done => {
                    chai.request(server).get('/test/errors/missingReasource')
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
                        .end((req, res) => {
                            res.status.should.be.equal(500);
                            res.header.should.not.own.property('cached-response');
                            res.header.should.not.own.property('cached-status');
                            done();
                        });
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

    describe('MockettaroProgram', () => {
        const { MockettaroProgram } = require('../dist/mockettaro-program.class');

        describe('RESOURCE_MATCHER', () => {
            it('Should match test/example', () => MockettaroProgram.RESOURCE_MATCHER.test('test/example').should.be.true);
            it('Should not match test/example?arg=val', () => MockettaroProgram.RESOURCE_MATCHER.test('test/example?arg=val').should.be.false);
            it('Should not match test/@example', () => MockettaroProgram.RESOURCE_MATCHER.test('test/@example').should.be.false);
            it('Should match /test/example', () => MockettaroProgram.RESOURCE_MATCHER.test('/test/example').should.be.true);
        });
        describe('FOLDER_MATCHER', () => {
            it('Should match test/example', () => MockettaroProgram.FOLDER_MATCHER.test('test/example').should.be.true);
            it('Should match test\\example', () => MockettaroProgram.FOLDER_MATCHER.test('test\\example').should.be.true);
            it('Should match X:\\test\\example', () => MockettaroProgram.FOLDER_MATCHER.test('X:\\test\\example').should.be.true);
            it('Should match /test/', () => MockettaroProgram.FOLDER_MATCHER.test('/test/').should.be.true);
            it('Should match ../example/try', () => MockettaroProgram.FOLDER_MATCHER.test('../example/try').should.be.true);
            it('Should match ./example/try', () => MockettaroProgram.FOLDER_MATCHER.test('./example/try').should.be.true);
            it('Should not match example/[try]', () => MockettaroProgram.FOLDER_MATCHER.test('example/[try]').should.be.false);
        });

        describe('cmdParser', () => {
            const mockettaroProgramCmdParser = (...args) => MockettaroProgram.cmdParser(['node', 'mockettaro', ...args]);

            it('Should not parse port, delay, cacheLifetime and set MINs / MAXs', () => {
                const program = mockettaroProgramCmdParser(
                    '-p', '345',
                    '-d', '75000000',
                    '-t', '990000007'
                );
                program.port.should.be.equal(MockettaroProgram.MIN_PORT);
                program.responseDelay.should.be.equal(MockettaroProgram.MAX_DELAY);
                program.cacheLifetime.should.be.equal(MockettaroProgram.MAX_CACHE_LIFETIME);
            });
            it('Should parse port, delay, cacheLifetime, resource and folder', () => {
                const program = mockettaroProgramCmdParser(
                    '-p', '7894',
                    '-r', 'test/example',
                    '-f', './test/example',
                    '-d', '150',
                    '-t', '9600'
                );
                program.port.should.be.equal(7894);
                program.resource.should.be.equal('test/example');
                program.folder.should.be.equal('./test/example');
                program.responseDelay.should.be.equal(150);
                program.cacheLifetime.should.be.equal(9600);
            });
            it('Should not parse port, delay, cacheLifetime, resource, folder and set DEFAULTs', () => {
                const program = mockettaroProgramCmdParser(
                    '-p', 'uj6r',
                    '-r', 'te@st/exam#ple',
                    '-f', '.../te@st/exa!mple',
                    '-d', 'xyz',
                    '-t', '#kk'
                );
                program.port.should.be.equal(MockettaroProgram.DEFAULT_PORT);
                program.resource.should.be.equal(MockettaroProgram.DEFAULT_RESOURCE);
                program.folder.should.be.equal(MockettaroProgram.DEFAULT_FOLDER);
                program.responseDelay.should.be.equal(MockettaroProgram.DEFAULT_DELAY);
                program.cacheLifetime.should.be.equal(MockettaroProgram.DEFAULT_CACHE_LIFETIME);
            });
        });
    });

    describe('Command line mockettaro (MockettaroProgram)', () => {
        const port = '8888';
        const resource = 'mocks';

        let server;
        before(done => {
            const {mockettaroProgram} = require('../dist/mockettaro-program.class');
            const path = require('path');
            mockettaroProgram({
                argv: [
                    process.argv[0],
                    'commandline.js',
                    '-p',
                    port,
                    '-r',
                    resource,
                    '-f',
                    path.relative(process.cwd(), path.join(__dirname, testResourcePath)),
                    '-s'
                ],
                cwd: process.cwd()
            })
            .then(serverInstance => {
                server = serverInstance;
                done();
            })
            .catch(done);
        });

        describe('Cities resource', ()=>{
            describe('GET', () => {
                it('Should return status 200 and an Array of cities on GET from file', done => {
                    chai.request(server).get(`/${resource}/cities`)
                        .end((req, res) => {
                            res.status.should.be.equal(200);
                            res.body.should.be.an('array').that.include.something.that.deep.equals({
                                "name": "Toulouse"
                            });
                            done();
                        });
                });
            });
        });

        describe('Error handling', () => {
            describe('Corrupted Json', () => {
                it('Should return status 500 on GET', done => {
                    chai.request(server).get(`/${resource}/errors/corruptedJson`)
                        .end((req, res) => {
                            res.status.should.be.equal(500);
                            res.header.should.not.own.property('cached-response');
                            res.header.should.not.own.property('cached-status');
                            done();
                        });
                });
            });
        });

        after(() => {
            if (server){
                server.close();
                server = undefined;
            }
        });
    });

    describe('Command line mockettaro (MockettaroProgram) Errors', () => {
        it('Should throw an error on Silent + Verbose', done => {
            const {mockettaroProgram} = require('../dist/mockettaro-program.class');
            mockettaroProgram({
                argv: [
                    process.argv[0],
                    'commandline.js',
                    '--verbose',
                    '-s'
                ],
                cwd: process.cwd()
            })
            .then(server => {
                server.should.be.null;
                server.close();
            })
            .catch(err => {
                err.message.should.be.equal('Can\'t run in both silent and verbose mode');
                done();
            });
        });
    });
});