const { expect } = require('./test.utils');

describe('Mockettaro Class', () => {
    const { mockettaro } = require('../');

    it('Should create new instance without parameters', () => {
        expect(mockettaro).not.to.throw();
    });
});