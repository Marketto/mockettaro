const { chai, moment } = require('./test.utils');
const fastXmlParser = require('fast-xml-parser');

describe('Mockettaro REST resources', ()=>{
    const testResourcePath = '../examples/mocks';
    const testPort = Math.round(3000 + (Math.random() * 6999));

    const server = require('express')();
    let testServer;
    before(done => {
        const {mockettaro} = require('..');

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


    describe('Toulouse DELETE', () => {
        it('Should return status 204 and an empty body', done => {
            chai.request(server).delete('/test/cities/Toulouse')
            .set('Accept', 'application/json')
            .end((req, res) => {
                res.status.should.be.equal(204);
                res.body.should.be.an('object').that.is.empty;
                res.header.should.not.own.property('cached-response');
                res.header.should.not.own.property('cached-status');
                done();
            });
        });

        it('Should return same status from cache', done => {
            chai.request(server).delete('/test/cities/Toulouse').then(() => {
                chai.request(server).delete('/test/cities/Toulouse')
                .set('Accept', 'application/json')
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
    });

    describe('Default PUT', () => {
        it('Should return 202 and a body', done => {
            chai.request(server).put('/test/cities/Rome')
            .set('Accept', 'application/json')
            .end((req, res) => {
                res.status.should.be.equal(202);
                res.body.should.be.an('object').that.have.property('status').that.is.equal("OK");
                res.header.should.not.own.property('cached-response');
                res.header.should.not.own.property('cached-status');
                done();
            });
        });
        it('Should return same status and data from cache', done => {
            chai.request(server).put('/test/cities/Rome').then(() => {
                chai.request(server).put('/test/cities/Rome')
                .set('Accept', 'application/json')
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
    });

    describe('GET', () => {
        it('Should return status 200 and an Array of cities on GET from file', done => {
            chai.request(server).get('/test/cities')
            .set('Accept', 'application/json')
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
            chai.request(server).get('/test/cities').then(() => {
                chai.request(server).get('/test/cities')
                .set('Accept', 'application/json')
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
    });

    describe('POST', () => {
        it('Should return 201 and a body passing jsonschema validation from file', done => {
            chai.request(server)
            .post('/test/cities').send({
                "name": "Naples"
            })
            .set('Accept', 'application/json')
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
            .set('Accept', 'application/json')
            .end((req, res) => {
                res.status.should.be.equal(400);
                res.header.should.not.own.property('cached-response');
                res.header.should.not.own.property('cached-status');
                done();
            });
        });
    });

    describe('Rome/San Paolo/shops', () => {
        describe('No specific accept type', () => {
            it('Should return 200 and a json array of shops', done => {
                chai.request(server).get('/test/cities/Rome/San Paolo/shops')
                //.set('Accept', 'application/json')
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

        describe('Accepting JSON only', () => {
            it('Should return 200 and a json array of shops', done => {
                chai.request(server).get('/test/cities/Rome/San Paolo/shops').then(() => {
                    chai.request(server).get('/test/cities/Rome/San Paolo/shops')
                    .set('Accept', 'application/json')
                    .end((req, res) => {
                        res.status.should.be.equal(200);
                        res.body.should.be.an('array').that.include.something.that.deep.equals({
                            "name" : "Figaro",
                            "type" : "barber shop"
                        });
                        res.header.should.own.property('cached-response');
                        res.header.should.not.own.property('cached-status');
                        done();
                    });
                });
            });
        });

        describe('Accepting XML only', () => {
            const request = require('request');
            it('Should return 200 and an xml of shops', done => {
                const resource = '/test/cities/Rome/San Paolo/shops';
                (new Promise((resolve, reject) => request.get({
                    url: `http://localhost:${testPort}${resource}`,
                    headers: {
                        'Accept': 'application/xml'
                    }
                }, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        fastXmlParser.validate(body).should.be.true;
                        resolve( { ...response, body: fastXmlParser.parse(body) });
                    }
                })))
                .then( response => {
                    const { headers, body, statusCode } = response;
                    statusCode.should.be.equal(200);
                    headers['content-type'].split('; ').should.contain('application/xml');
                    headers.should.not.own.property('cached-response');
                    headers.should.not.own.property('cached-status');

                    body.should.be.an('object').that.own.property('shop');
                    const { shop } = body;
                    shop.should.be.an('object').that.own.property('name');
                    shop.name.should.be.equals('Figaro');
                    shop.should.be.an('object').that.own.property('type');
                    shop.type.should.be.equals('Barber shop');
                    done();
                })
                .catch(err => {
                    err.should.be.not.ok;
                    done();
                });
            });
        });
    });

    describe('Delayed resource', () => {
        it('Should return a body in more than 2 seconds', done => {
            const timer = moment();
            chai.request(server).get('/test/cities/Moscow/places')
            .set('Accept', 'application/json')
            .end((req, res) => {
                res.status.should.be.equal(200);
                res.body.should.be.an('array').that.include.something.that.deep.equals({
                    "name" : "Царицыно",
                    "type" : "park"
                });
                res.header.should.not.own.property('cached-response');
                res.header.should.not.own.property('cached-status');
                moment.duration(moment().diff(timer)).asSeconds().should.be.gte(2);
                done();
            });
        }).timeout(2500);

        it('Should return same data from cache in more than 2 seconds', done => {
            const timer = moment();
            chai.request(server).get('/test/cities/Moscow/places').then(() => {
                chai.request(server).get('/test/cities/Moscow/places')
                .set('Accept', 'application/json')
                .end((req, res) => {
                    res.status.should.be.equal(200);
                    res.body.should.be.an('array').that.include.something.that.deep.equals({
                        "name" : "Царицыно",
                        "type" : "park"
                    });
                    res.header.should.not.own.property('cached-response');
                    res.header.should.not.own.property('cached-status');
                    moment.duration(moment().diff(timer)).asSeconds().should.be.gte(4);
                    done();
                });
            });
        }).timeout(5000);
    });

    after(() => {
        if (testServer){
            testServer.close();
            testServer = undefined;
        }
    });
});