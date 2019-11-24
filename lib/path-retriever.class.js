const fs = require('fs');
const path = require('path');

/**
 * @class PathRetriever
 */
class PathRetriever {

    /**
     * Find first possible existing path for the given settings
     *
     * @static
     * @param {Object} settings Path Seek Settings Object
     * @param {string} [settings.target=''] Target resource path
     * @param {string|Array<string>} [settings.ext='json'] Mock target extension to find
     * @param {string} prefix Mock prefix: {PATH}.{PREFIX}.{EXT}
     * @param {string} [cwd=process.cwd()] Current Working Directory: Path to seek for resources
     * @returns {string} Existing resource path
     * @memberof PathRetriever
     */
    static find({ target = '', ext = 'json', prefix, cwd = process.cwd() }){
        const possiblePaths = this.seekPathList({target, ext, prefix});
        for (const relativeTargetPath of possiblePaths) {
            const targetPath = path.join(cwd, relativeTargetPath);
            if (fs.existsSync(targetPath)) {
                return targetPath;
            }
        }
        return null;
    }

    /**
     * @static
     * @property {string} DEFAULT_RESOURCE
     * @memberof PathRetriever
     */
    static get DEFAULT_RESOURCE() {
        return 'default';
    }

    /**
     * Uri path resource matcher
     *
     * @static
     * @property {RegExp} PATH_RESOURCE_MATCHER
     * @memberof PathRetriever
     */
    static get PATH_RESOURCE_MATCHER() {
        return /([^/]+)/g;
    }

    /**
     * Returns a list of all possible paths, for the given resource, sorted by priority
     *
     * @static
     * @param {Array<string>} relativePath Target resource path array
     * @returns {Array<Array<string>>} List of possible paths
     * @memberof PathRetriever
     */
    static *partialSearch(pathArray) {
        if (!Array.isArray(pathArray)) {
            throw new Error(`pathArray should be an Array, ${pathArray} provided`);
        }
        if (pathArray.length > 1) {
            const subPathArray = pathArray.slice(0, -1);
            const subSearchResults = this.partialSearch(subPathArray);
            const cachedSubSearchResults = [];
            const targetResource = pathArray.slice(-1);

            //Yielding subSearchResults with target resource ending restored
            for (const subPath of subSearchResults) {
                yield [...subPath, targetResource];
                cachedSubSearchResults.push(subPath);
            }

            //Yielding cached subSearchResults with default resource ending replaced
            for (const subPath of cachedSubSearchResults) {
                yield [...subPath, this.DEFAULT_RESOURCE];
            }
        } else {
            //Yielding pathArray
            yield pathArray;
            //Yielding pathArray with default resource ending replaced
            yield [this.DEFAULT_RESOURCE];
        }
    }

    /**
     * Returns a list of all possible paths, for the given resource settings, sorted by priority
     *
     * @static
     * @param {Object} settings Path Seek Settings Object
     * @param {string} settings.target Target resource path
     * @param {string|Array<string>} [settings.ext='json'] Mock target extension to find
     * @param {string} prefix Mock prefix: {PATH}.{PREFIX}.{EXT}
     * @returns {Array<string>} List of possible paths
     * @memberof PathRetriever
     */
    static *seekPathList({ target, ext = 'json', prefix }) {
        if (!target) {
            throw new Error('target path is mandatory');
        }

        const extList = [].concat(ext);
        const pathArray = target.match(this.PATH_RESOURCE_MATCHER);
        const partialResults = this.partialSearch(pathArray);

        for (const pathLikelihood of partialResults) {
            const pathLikelihoodStr =  pathLikelihood.join('/');
            if (prefix) {
                for (const currentExt of extList) {
                    yield `${pathLikelihoodStr}.${prefix}.${currentExt}`;
                }
            }
            for (const currentExt of extList) {
                yield `${pathLikelihoodStr}.${currentExt}`;
            }
        }
    }
}

exports.PathRetriever = PathRetriever;
