const chai = require('chai');
chai.should();

describe('PathRetriever', () => {
    const { PathRetriever } = require('../lib/path-retriever.class');
    describe('partialSearch', () => {
        describe('1 level depth', () => {
            it('Should return proper list of 2 possible paths', () => {
                const iterator = PathRetriever.partialSearch(['test']);
                iterator.next().value.join('/').should.be.equal('test');
                iterator.next().value.join('/').should.be.equal('default');
                iterator.next().done.should.be.true;
            });
        });
        describe('2 level depth', () => {
            it('Should return proper list of 4 possible paths', () => {
                const iterator = PathRetriever.partialSearch('test/example'.split('/'));
                iterator.next().value.join('/').should.be.equal('test/example');
                iterator.next().value.join('/').should.be.equal('default/example');
                iterator.next().value.join('/').should.be.equal('test/default');
                iterator.next().value.join('/').should.be.equal('default/default');
                iterator.next().done.should.be.true;
            });
        });
        describe('3 level depth', () => {
            it('Should return proper list of 8 possible paths', () => {
                const iterator = PathRetriever.partialSearch('test/example/resource'.split('/'));
                iterator.next().value.join('/').should.be.equal('test/example/resource');
                iterator.next().value.join('/').should.be.equal('default/example/resource');
                iterator.next().value.join('/').should.be.equal('test/default/resource');
                iterator.next().value.join('/').should.be.equal('default/default/resource');
                iterator.next().value.join('/').should.be.equal('test/example/default');
                iterator.next().value.join('/').should.be.equal('default/example/default');
                iterator.next().value.join('/').should.be.equal('test/default/default');
                iterator.next().value.join('/').should.be.equal('default/default/default');
                iterator.next().done.should.be.true;
            });
        });
    });

    describe('seekPathList', () => {
        it('Should return proper list of 2 possible paths providing target', () => {
            const iterator = PathRetriever.seekPathList({ target: 'test' });
            iterator.next().value.should.be.equal('test.json');
            iterator.next().value.should.be.equal('default.json');
            iterator.next().done.should.be.true;
        });
        it('Should return proper list of 2 possible paths providing target and ext: xml', () => {
            const iterator = PathRetriever.seekPathList({ target: 'test', ext: 'xml' });
            iterator.next().value.should.be.equal('test.xml');
            iterator.next().value.should.be.equal('default.xml');
            iterator.next().done.should.be.true;
        });
        it('Should return proper list of 4 possible paths providing target and prefix', () => {
            const iterator = PathRetriever.seekPathList({ target: 'test', prefix: 'GET' });
            iterator.next().value.should.be.equal('test.GET.json');
            iterator.next().value.should.be.equal('test.json');
            iterator.next().value.should.be.equal('default.GET.json');
            iterator.next().value.should.be.equal('default.json');
            iterator.next().done.should.be.true;
        });
        it('Should return proper list of 4 possible paths providing json and xml extensions', () => {
            const iterator = PathRetriever.seekPathList({ target: 'test', ext: ['json', 'xml'] });
            iterator.next().value.should.be.equal('test.json');
            iterator.next().value.should.be.equal('test.xml');
            iterator.next().value.should.be.equal('default.json');
            iterator.next().value.should.be.equal('default.xml');
            iterator.next().done.should.be.true;
        });
    });

    describe('find', () => {
        it('Should find cities json path', () => {
            PathRetriever.find({target: 'examples/mocks/cities'}).should.be.ok;
        });

        it('Should find cities/Rome/default/shops json path', () => {
            PathRetriever.find({target: 'examples/mocks/cities/Rome/ostia/shops'}).should.be.ok;
        });

        it('Should find cities/Rome/default/shops xml path', () => {
            PathRetriever.find({target: 'examples/mocks/cities/Rome/eur/shops', ext: 'xml'}).should.be.ok;
        });
    });
});