const { chai } = require('./test.utils');
const { expect } = require('chai');
const express = require('express');
const { PathRetriever } = require('../lib/path-retriever.class');
const { MockettaroProgram, mockettaroProgram } = require('../lib/mockettaro-program.class');
const { mockettaro } = require('../');

describe('Mockettaro Error handling', () => {
    
    const testResourcePath = '../examples/mocks';
    const testPort = Math.round(MockettaroProgram.MIN_PORT + (Math.random() * (MockettaroProgram.MAX_PORT - MockettaroProgram.MIN_PORT)));

    const server = express();
    let testServer;
    before(done => {

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

    describe('Port in use', () => {
        it('Should throw error', async () => {
            let errorCode;
            const mp = mockettaroProgram({
                argv: [
                    process.argv[0],
                    'commandline.js',
                    '-p',
                    testPort
                ],
                cwd: process.cwd()
            })
            .then(serverInstance => serverInstance.close())
            .catch(e => {
                errorCode = e.code;
                return;
            });
            await mp;
            expect(errorCode).to.be.equal('EADDRINUSE');
        });
    });

    describe('PathRetriever.seekPathList', () => {
        it('Should throw error', () => {
            expect(() => Array.from(PathRetriever.seekPathList({}))).to.throw('target path is mandatory');
        })
    });

    after(() => {
        if (testServer){
            testServer.close();
            testServer = undefined;
        }
    });
});