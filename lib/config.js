require('dotenv').config();

const {env} = process;

const autoParseInt = val => {
    const parsedVal = parseInt(val);
    if (isNaN(parsedVal)) {
        return null;
    }
    return parsedVal;
}

module.exports = {
    DEFAULT_PORT: autoParseInt(env.DEFAULT_PORT) || 8080,
    DEFAULT_RESOURCE: env.DEFAULT_RESOURCE || '',
    DEFAULT_FOLDER: env.DEFAULT_FOLDER || './',
    DEFAULT_DELAY: autoParseInt(env.DEFAULT_DELAY) || 0,
    DEFAULT_CACHE_LIFETIME: parseInt(env.DEFAULT_CACHE_LIFETIME) || 3000,
    MIN_PORT: parseInt(env.MIN_PORT) || 80,
    MAX_PORT: parseInt(env.MAX_PORT) || 30000,
    MAX_DELAY: parseInt(env.MAX_DELAY) || 12000
};