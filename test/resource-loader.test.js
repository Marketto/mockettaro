const { expect } = require('./test.utils');

describe('ResourceLoader', () => {
    const { ResourceLoader } = require('../lib/resource-loader.class');
    describe('autoparse', () => {
        it('Should throw error for fileType not handled', () => {
            expect(() => ResourceLoader.autoParse(null, 'xls')).to.throw(Error, 'Can\'t parse xls files');
        });
        it('Should throw error for fake xml', () => {
            expect(() => ResourceLoader.autoParse('<<<$ifhg@>></<>', 'xml')).to.throw(Error);
        });
    });
});