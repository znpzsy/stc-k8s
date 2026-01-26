// Keeps rights list of the logged in users on the runtime memory.

const request = require('request');
const _ = require('underscore');
const chalk = require('chalk');

// Response modifier only works with json responses. For XML/HTTP response use the default body writer.
const modifyResponse = require('node-http-proxy-json');

const Memcached = require('memcached');

const {authConfig, operationsConfig} = require('./conf_reader.js');

const DEFAULT_LIST_TTL = 60; // 10 minutes;
const USERNAME_CACHE_PREFIX = 'a3gw_username_';

var memcached;

function PermissionManager() {
    if (!this.userRightsList) {
        this.userRightsList = []
    }

    if (authConfig.memcachedServers && authConfig.memcachedServers.length > 0) {
        memcached = new Memcached(authConfig.memcachedServers, {
            retries: 10,
            retry: 10000,
            remove: true
        });

        // each time a server fails
        memcached.on( "issue", function( issue ){
            console.log( "Issue occured on server " + issue.server + ", " + issue.retries  + " attempts left untill failure" );
        });

        memcached.on( "failure", function( issue ){
            console.log( issue.server + " failed!" );
        });

        memcached.on( "reconnecting", function( issue ){
            console.log( "reconnecting to server: " + issue.server + " failed!" );
        })

    }
}

/**
 * Get value by username.
 *
 * @param username
 * @returns {*}
 */
PermissionManager.prototype.getUserMemcachedData = async function (username) {
    let promise = new Promise((resolve, reject) => {
        if (memcached) {
            memcached.get(USERNAME_CACHE_PREFIX + username, function (err, data) {
                if (err) {
                    console.log(chalk.bold.red('Get Data Error:', err));
                }

                resolve(data);
            })
        } else {
            resolve(null);
        }
    });

    let result = await promise; // wait until the promise resolves (*)

    return result;
}

/**
 * Put a value for a username.
 *
 * @param username
 * @param value
 * @returns {*}
 */
PermissionManager.prototype.putUserMemcachedData = async function (username, value) {
    let promise = new Promise((resolve, reject) => {
        if (memcached) {
            memcached.set(USERNAME_CACHE_PREFIX + username, value, 10000, function (err, result) {
                if (err) {
                    console.log(chalk.bold.red('Set Data Error:', err));
                }

                resolve('success');
            });
        } else {
            resolve(null);
        }
    });

    let result = await promise; // wait until the promise resolves (*)

    return result;
}

/**
 * Delete value by username.
 *
 * @param username
 * @returns {*}
 */
PermissionManager.prototype.deleteUserMemcachedData = async function (username) {
    let promise = new Promise((resolve, reject) => {
        if (memcached) {
            memcached.del(USERNAME_CACHE_PREFIX + username, function (err, result) {
                if (err) {
                    console.log(chalk.bold.red('Delete Data Error:', err));
                }

                resolve('success');
            });
        } else {
            resolve(null);
        }
    });

    let result = await promise; // wait until the promise resolves (*)

    return result;
}

var getCMPFUserById = function (cmpfToken, userId) {
    return new Promise(resolve => {
        // Set the headers
        var headers = {
            'uid': cmpfToken.uid,
            'token': cmpfToken.token,
            'hash': cmpfToken.hash,
            'Content-Type': 'application/json'
        };

        // Configure the request
        var options = {
            url: authConfig.accountsUrl + '/' + userId + '?withchildren=true',
            method: 'GET',
            headers: headers
        };

        // Start the request
        request(options, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                resolve(body);
            }
        });
    });
};

/**
 * Check if list is expired
 *
 * @param userRights
 * @returns {*}
 */
PermissionManager.prototype.isExpired = function (userRights) {
    var isExpired = userRights && (userRights.expireTime < (new Date()).getTime());
    if (isExpired) {
        console.log('User right list is expired!');
    }

    return isExpired;
};

/**
 * Filter out the user rights by id and resource name.
 *
 * @param userId
 * @param resourceName
 * @returns {*}
 */
PermissionManager.prototype.filterUserRightsByIdAndResourceName = function (userId, resourceName) {
    return _.findWhere(this.userRightsList, {userId: userId, resourceName: resourceName});
}

/**
 * Get rights list of a user.
 *
 * @param cmpfToken
 * @param resourceName
 * @returns {*}
 */
PermissionManager.prototype.getRights = function (cmpfToken, resourceName) {
    var promise = new Promise(resolve => {
        var userRights = this.filterUserRightsByIdAndResourceName(cmpfToken.uid, resourceName);
        if (userRights && !this.isExpired(userRights)) {
            resolve(userRights.rights);
        } else {
            this.updateRights(cmpfToken, resourceName).then(function (availableRights) {
                resolve(availableRights);
            });
        }
    });

    return promise;
};

/**
 * Set rights list of a user.
 *
 * @param cmpfToken
 * @param resourceName
 * @param newRights
 */
PermissionManager.prototype.setRights = function (cmpfToken, resourceName, newRights) {
    var userRights = this.filterUserRightsByIdAndResourceName(cmpfToken.uid, resourceName);
    if (userRights) {
        userRights.rights = newRights;
        userRights.expireTime = (new Date()).getTime() + (DEFAULT_LIST_TTL * 1000);
    } else {
        this.userRightsList.push({
            userId: cmpfToken.uid,
            resourceName: resourceName,
            rights: newRights,
            expireTime: (new Date()).getTime() + (DEFAULT_LIST_TTL * 1000)
        });
    }
};

/**
 * Update rights list of a user by asking account server. This method is special to the CMPF authentication server
 * and works only for its user permission design.
 *
 * @param cmpfToken
 * @param resourceName
 */
PermissionManager.prototype.updateRights = function (cmpfToken, resourceName) {
    var _self = this;

    return new Promise(resolve => {
        // Set the headers
        var headers = {
            'uid': cmpfToken.uid,
            'token': cmpfToken.token,
            'hash': cmpfToken.hash,
            'Content-Type': 'application/json'
        };

        // Configure the request
        var options = {
            url: authConfig.accountsUrl + '/' + cmpfToken.uid + '/rights',
            method: 'GET',
            headers: headers
        };

        // Start the request
        request(options, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                var rights = JSON.parse(body);

                var filteredUserRights = _.where(rights, {resourceName: resourceName})
                var availableRights = _.map(filteredUserRights, _.iteratee('operationName'));

                // Update the rights of the user.
                _self.setRights(cmpfToken, resourceName, availableRights);

                resolve(availableRights);

                console.log('User right list updated.');
            }
        });
    });
};

var checkRequestMethod = function (serviceMethod, requestMethod) {
    return (serviceMethod === 'ALL') || (serviceMethod === requestMethod);
};

var VCP_ADMIN_GROUP = 'VCP Admin';
var checkUserIsPermissable = function (cmpfToken, request) {
    return new Promise(resolve => {
        var requestPath = request._parsedUrl.pathname;

        if (requestPath.startsWith('/cmpf-rest')) {
            getCMPFUserById(cmpfToken, cmpfToken.uid).then(function (userAccountResponse) {
                if (userAccountResponse) {
                    var userAccountJSON = JSON.parse(userAccountResponse);

                    // Check the session user is not a member the default admin group.
                    var foundAdminGroup = _.findWhere(userAccountJSON.userGroups, {'name': VCP_ADMIN_GROUP});
                    if (foundAdminGroup) {
                        // Allow admin users for everything.
                        resolve(true);
                    } else {
                        // Parse the url.
                        var requestPathKeywords = requestPath.split('/');

                        if (requestPathKeywords.length > 3) {
                            if (requestPath.startsWith('/cmpf-rest/useraccounts')) { // If this is a user account request.
                                // Do not allow to Create if they have no same organization id. Or the request has no same user id.
                                if (request.method === 'POST' && (request.body.organizationId !== cmpfToken.oid)) {
                                    resolve(false);
                                } else if (request.method === 'GET' || request.method === 'DELETE') {
                                    getCMPFUserById(cmpfToken, requestPathKeywords[3]).then(function (bPartyUserAccountResponse) {
                                        if (bPartyUserAccountResponse) {
                                            var bPartyUserAccountResponseJSON = JSON.parse(bPartyUserAccountResponse);

                                            // Check if they are same organizations' users.
                                            if (bPartyUserAccountResponseJSON.organizationId !== cmpfToken.oid) {
                                                resolve(false);
                                            } else {
                                                resolve(true);
                                            }
                                        } else {
                                            resolve(false);
                                        }
                                    });
                                } else if (request.method === 'PUT' && (Number(requestPathKeywords[3]) !== cmpfToken.uid)) {
                                    resolve(false);
                                } else {
                                    resolve(true);
                                }
                            } else if (requestPath.startsWith('/cmpf-rest/usergroups')) { // If this is a user groups request.
                                var foundUserGroup = _.findWhere(userAccountJSON.userGroups, {'id': Number(requestPathKeywords[3])});

                                if ((request.method === 'GET' || request.method === 'PUT' || request.method === 'DELETE') && !foundUserGroup) {
                                    // Do not allow to the above operations if the user not members of the group.
                                    resolve(false);
                                } else {
                                    resolve(true);
                                }
                            } else if (requestPath.startsWith('/cmpf-rest/organizations') || requestPath.startsWith('/cmpf-rest/networkoperators') || requestPath.startsWith('/cmpf-rest/virtualoperators') || requestPath.startsWith('/cmpf-rest/partners')) { // If this is a organizations request.
                                if ((request.method === 'GET' || request.method === 'PUT' || request.method === 'DELETE') && (Number(requestPathKeywords[3]) !== cmpfToken.oid)) {
                                    resolve(false);
                                } else {
                                    resolve(true);
                                }
                            } else {
                                resolve(true);
                            }
                        } else {
                            resolve(true);
                        }
                    }
                } else {
                    resolve(false);
                }
            });
        } else {
            resolve(true);
        }
    });
};

/**
 * Checks permission list according to the passwed requestPath value.
 *
 * @param cmpfToken
 * @param resourceName
 * @param request
 */
PermissionManager.prototype.checkPermission = function (cmpfToken, resourceName, request) {
    var requestPath = request._parsedUrl.pathname;

    var _self = this;
    var allowedOperations = [];
    var userRights;

    return new Promise(resolve => {
        _self.getRights(cmpfToken, resourceName).then(function (userRights) {
            // Check the requested urls and compare with the configured operations first.
            _.each(operationsConfig, function (operationConfig) {
                _.each(operationConfig.services, function (service) {
                    if (service.paths) {
                        _.each(service.paths, function (path) {
                            if (requestPath.startsWith(path) && checkRequestMethod(service.method, request.method)) {
                                allowedOperations.push(operationConfig.operation);
                            }
                        });
                    } else if (service.path) {
                        if (requestPath.startsWith(service.path) && checkRequestMethod(service.method, request.method)) {
                            allowedOperations.push(operationConfig.operation);
                        }
                    }
                });
            });

            // Find the operations' intersections.
            var rightIntersection = _.intersection(userRights, allowedOperations);
            var isAllowed = (rightIntersection.length === allowedOperations.length);

            // Check user informations.
            checkUserIsPermissable(cmpfToken, request).then(function (isUserPermissable) {
                isAllowed = isAllowed && isUserPermissable;

                resolve({
                    isAllowed: isAllowed,
                    requestPath: requestPath
                });
            });
        });
    });
};

module.exports = new PermissionManager();
