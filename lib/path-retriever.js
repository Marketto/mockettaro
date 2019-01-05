const logger = require("@marketto/js-logger").global();
const fs = require('fs');
const path = require('path');
const DEFAULT_RESOURCE = "default";

class PathRetriever {

    static find({ target = "", ext = 'json', prefix }){
        return this.seekPathList({target, ext, prefix}).find( pathToCheck => {
            return fs.existsSync(pathToCheck);
        });
    }

    static seekPathList({ target = "", ext = 'json', prefix }) {
        target = (target.match(/^(.+[^\/])\/?$/) || [])[1] || "";
        function partialSearch(pathArray) {
            const subPathArray = pathArray.slice(0, pathArray.length - 1);
            const alternativePathArray = (subPathArray).concat(DEFAULT_RESOURCE);
            
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
                    .map(pp => pp.concat(DEFAULT_RESOURCE))
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
            fullResults[f] = path.join(__dirname, '../', `${partialPathStr}.${prefix}.${ext}`);
            fullResults[f + 1] = path.join(__dirname, '../', `${partialPathStr}.${ext}`);
        }
        logger.debug(`Path FullSearch: ${JSON.stringify(fullResults, null, 4)}`);
        return fullResults;
    }
}

exports.PathRetriever = PathRetriever;