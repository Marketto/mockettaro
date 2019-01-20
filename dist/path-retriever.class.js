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
     * @param {string} [settings.ext='json'] Mosck target extension to find
     * @param {string} prefix Mock prefix: {PATH}.{PREFIX}.{EXT}
     * @param {string} cwd Current Working Directory: Path to seek for resources
     * @returns {string} Existing resource path
     * @memberof PathRetriever
     */
    static find({ target = '', ext = 'json', prefix, cwd }){
        const fs = require('fs');
        const path = require('path');
        const possiblePaths = this.seekPathList({target, ext, prefix});
        const firstAvailablePath = possiblePaths.find( pathToCheck => {
                return fs.existsSync(path.join(cwd, pathToCheck));
            });
        return firstAvailablePath && path.join(cwd, firstAvailablePath);
    }

    /**
     * @static
     * @property DEFAULT_RESOURCE
     * @memberof PathRetriever
     */
    static get DEFAULT_RESOURCE() {
        return 'default';
    }

    /**
     * Returns a list of all possible paths, for the given resource settings, sorted by priority
     *
     * @static
     * @param {Object} settings Path Seek Settings Object
     * @param {string} [settings.target=''] Target resource path
     * @param {string} [settings.ext='json'] Mosck target extension to find
     * @param {string} prefix Mock prefix: {PATH}.{PREFIX}.{EXT}
     * @returns {Array<string>} List of possible paths
     * @memberof PathRetriever
     */
    static seekPathList({ target = '', ext = 'json', prefix }) {
        const logger = require('@marketto/js-logger').global();
        const path = require('path');

        target = (target.match(/^(.+[^/])\/?$/) || [])[1] || '';
        const partialSearch = pathArray => {
            const subPathArray = pathArray.slice(0, pathArray.length - 1);
            const alternativePathArray = (subPathArray).concat(this.DEFAULT_RESOURCE);

            if (pathArray.length > 1) {
                const subSearchResults = partialSearch(subPathArray);

                let resultList = [pathArray];

                subSearchResults
                    .map(pp => pp.concat(pathArray[pathArray.length - 1]))
                    .forEach(pp=>{
                        resultList.push(pp);
                    });

                resultList.push(alternativePathArray);

                subSearchResults
                    .map(pp => pp.concat(this.DEFAULT_RESOURCE))
                    .forEach(pp => {
                        resultList.push(pp);
                    });

                return resultList;
            } else {
                return [
                    pathArray,
                    alternativePathArray
                ];
            }
        }

        const pathArray = target.split(/\/|\\/)
            .filter(e => !!e);
        const partialResults = partialSearch(pathArray);
        const fullResults = Array(partialResults.length * 2);
        for (let i = 0; i < partialResults.length; i++) {
            const partialPathStr =  path.join(...partialResults[i]);
            const f = i * 2;
            fullResults[f] = `${partialPathStr}.${prefix}.${ext}`;
            fullResults[f + 1] = `${partialPathStr}.${ext}`;
        }
        logger.debug(`Path FullSearch: ${JSON.stringify(fullResults, null, 4)}`);
        return fullResults;
    }
}

exports.PathRetriever = PathRetriever;
