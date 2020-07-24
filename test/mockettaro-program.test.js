const { expect, testResourcePath, chai } = require('./test.utils');
const path = require('path');
const { MockettaroProgram, mockettaroProgram } = require('../lib/mockettaro-program.class');

describe('MockettaroProgram', () => {
    describe('Properties', () => {

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
    });

    describe('Methods', () => {
        describe('cmdParser', () => {
            const mockettaroProgramCmdParser = (...args) => MockettaroProgram.cmdParser('node', 'mockettaro', ...args);

            it('Should not parse port, delay, cacheLifetime and set MINs / MAXs', () => {
                const program = mockettaroProgramCmdParser(
                    '-p', `${MockettaroProgram.MIN_PORT - 1}`,
                    '-d', '75000000',
                    '-t', '990000007'
                );
                program.port.should.be.equal(MockettaroProgram.DEFAULT_PORT);
                program.responseDelay.should.be.equal(MockettaroProgram.MAX_DELAY);
                program.cacheLifetime.should.be.equal(MockettaroProgram.MAX_CACHE_LIFETIME);
            });

            it('Should parse port 80', () => {
                const program = mockettaroProgramCmdParser(
                    '-p', '80'
                );
                program.port.should.be.equal(80);
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
            it('Should parse resource and folder', () => {
                const program = mockettaroProgramCmdParser(
                    '-r', 'te-st',
                    '-f', 'ex-am-ple'
                );
                program.resource.should.be.equal('te-st');
                program.folder.should.be.equal('ex-am-ple');
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

    describe('Instance', () => {
        const port = '8888';
        const resource = 'mocks';

        let server;
        before(done => {
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

        describe('REST resource', ()=>{
            it('Should return status 200 and an Array of cities on GET from file', done => {
                chai.request(server).get(`/${resource}/cities/Florence`)
                    .end((req, res) => {
                        res.status.should.be.equal(200);
                        res.body.should.be.an('object').that.deep.equal({
                            "name": "Florence",
                            "originalName": "Firenze",
                            "population": 380885,
                            "area": 102.41,
                            "metropolitanCity": true,
                            "region": "Tuscany",
                            "dialingCode": "055"
                        });
                        done();
                    });
            });
        });

        describe('Error handling', () => {
            it('Should return status 500 on Corrupted Json', done => {
                chai.request(server).get(`/${resource}/errors/corruptedJson`)
                    .end((req, res) => {
                        res.status.should.be.equal(500);
                        res.header.should.not.own.property('cached-response');
                        res.header.should.not.own.property('cached-status');
                        done();
                    });
            });

            it('Should reject promise trying to run new instance on same port', done => {
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
                        serverInstance.should.be.null;
                        serverInstance.close();
                        done();
                    })
                    .catch(err => {
                        err.should.be.an('Error');
                        done();
                    });
            });
        });

        it('Should throw an error on Silent + Verbose', done => {
            mockettaroProgram({
                argv: [
                    process.argv[0],
                    'commandline.js',
                    '--verbose',
                    '-s'
                ],
                cwd: process.cwd()
            })
            .then(serverInstance => {
                serverInstance.should.be.null;
                serverInstance.close();
                done();
            })
            .catch(err => {
                err.message.should.be.equal('Can\'t run in both silent and verbose mode');
                done();
            });
        });

        after(() => {
            if (server){
                server.close();
                server = undefined;
            }
        });
    });
});