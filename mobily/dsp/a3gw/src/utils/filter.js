// Filter utility

const pathJs = require('path');
const _ = require('underscore');

const {serverConfig} = require('./conf_reader.js');

function Filter() {
}

/**
 * Filter method which checks requests according to file names, pathes and file types.
 *
 * @param path
 * @param req
 * @returns {boolean}
 */
Filter.prototype.allowedFilter = function (path, req) {
    var parsedPath = pathJs.parse(path);

    var isAllowed = false;
    _.each(serverConfig.filter.allowedExts, function (allowedExt) {
        if (_.isArray(allowedExt)) {
            _.each(allowedExt, function (subAllowedExt) {
                isAllowed = isAllowed || '.' + subAllowedExt === parsedPath.ext
            })
        } else {
            isAllowed = isAllowed || ('.' + allowedExt === parsedPath.ext)
        }
    });

    _.each(serverConfig.filter.allowedFiles, function (allowedFile) {
        isAllowed = isAllowed || allowedFile === parsedPath.base
    });

    _.each(serverConfig.filter.allowedDirectories, function (allowedDirectory) {
        _.each(serverConfig.applications, function (application) {
            isAllowed = isAllowed || parsedPath.dir.startsWith(application.path + allowedDirectory)
        })
    });

    _.each(serverConfig.filter.allowedPathes, function (allowedPath) {
        isAllowed = isAllowed || (path === allowedPath)
    });

    _.each(serverConfig.filter.allowedRestServices, function (allowedRestService) {
        isAllowed = isAllowed || path.startsWith(allowedRestService)
    });

    return isAllowed
};

module.exports = new Filter();
