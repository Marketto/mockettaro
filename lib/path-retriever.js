'use strict';

const logger = require('./logger').global();
const fs = require('fs');
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

        const pathArray = target.split("/")
            .filter(e => !!e);
        const partialResults = partialSearch(pathArray);
        const fullResults = [];
        for (let i = 0; i < partialResults.length; i++) {
            const partialPathStr = partialResults[i].join("/");
            fullResults.push(`${partialPathStr}.${prefix}.${ext}`);
            fullResults.push(`${partialPathStr}.${ext}`);
        }
        logger.debug(`Path FullSearch: ${JSON.stringify(fullResults, null, 4)}`);
        return fullResults;
    }
}

exports.PathRetriever = PathRetriever;