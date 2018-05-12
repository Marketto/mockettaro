const mockettaro = require('../');
const server = require('express')();
const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);
chai.should();

describe('mockettaro', ()=>{
    let testServer;
    before(function (done) {
        server.use(`/test`, mockettaro.serve('/examples/mocks'));
        testServer = server.listen(9999, done);
    })
    describe('Cities Toulouse DELETE resource', ()=>{
        it('Should return status 204 and an empty body', done => {
            chai.request(server).delete('/test/cities/Toulouse')
                .end((req, res)=>{
                    res.status.should.be.equal(204);
                    res.body.should.be.an('object').that.is.empty;
                    done();
                });
        });
    });

    describe('Cities default PUT resource', () => {
        it('Should return 202 and a body', done => {
            chai.request(server).put('/test/cities/Rome')
                .end((req, res) => {
                    res.status.should.be.equal(202);
                    res.body.should.be.an('object').that.have.property('status').that.is.equal("OK");
                    done();
                });
        });
    });

    describe('Cities GET resource', ()=>{
        it('Should return status 200 and an Array of cities on GET', done => {
            chai.request(server).get('/test/cities')
                .end((req, res) => {
                    res.status.should.be.equal(200);
                    res.body.should.be.an('array').that.is.not.empty;
                    done();
                });
        });
    });
    describe('Cities POST resource', () => {
        it('Should return 201 and a body passing jsonschema validation', done => {
            chai.request(server).post('/test/cities').send({"name":"Naples"})
                .end((req, res) => {
                    res.status.should.be.equal(201);
                    res.body.should.be.an('object').that.have.property('status').that.is.equal("OK");
                    done();
                });
        });
        it('Should return 400 against jsonschema validation', done => {
            chai.request(server).post('/test/cities')
                .end((req, res) => {
                    res.status.should.be.equal(400);
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