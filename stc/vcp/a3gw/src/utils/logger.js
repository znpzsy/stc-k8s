// Logger utility

const winston = require('winston');
const {createLogger, format, transports} = winston;
const {combine, timestamp, printf} = format;
const pathJs = require('path');
const moment = require('moment-timezone');
const _ = require('underscore');
const chalk = require('chalk');

const {loggerConfig, serverConfig} = require('./conf_reader.js');
const JWT = require('./jwt.js');

const TIMEZONE = loggerConfig.timezone;
const DATE_TIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSSZZ';
const LOG_MAX_SIZE = loggerConfig.maxSize;
const LOG_MAX_FILES = loggerConfig.maxFiles;

/**
 options: {
    maxBodyLength: Specify maximum payload length to print log file. Default value is 10000 character.
 }
 */
function Logger(options) {
    this.options = options || {};
    _.defaults(this.options, {
        maxBodyLength: 10000
    });

    const myTimestamp = function () {
        return moment().tz(TIMEZONE).format(DATE_TIME_FORMAT);
    };

    const myFormat = printf(function (info) {
        return `{"timestamp":"${myTimestamp()}", ${info.message}}`
    });

    var _self = this;
    _self.auditLoggers = {};

    console.log('\n');

    // Create a logger for each application.
    _.each(serverConfig.applications, function (application) {
        // Generate an application name value from the path definition of the application to be able to use
        // as a key can be kept in an object.
        var applicationName = application.path.slice(1).split('/').join('_').toLowerCase();
        if (application.resourceName) {
            console.log(chalk.bold.magenta('Application logger creating: ', application.resourceName));

            var logger = createLogger({
                exitOnError: false,
                format: combine(
                    myFormat
                ),
                transports: [
                    new transports.File({
                        timestamp: true,
                        json: true,
                        tailable: true,
                        filename: applicationName + '.log',
                        dirname: pathJs.join(__dirname, '..', '..', 'logs'),
                        maxsize: LOG_MAX_SIZE,
                        maxFiles: LOG_MAX_FILES
                    })
                ]
            });

            // TODO: Make this configurable in the real repo [IMPORTANT]
            logger.add(new transports.Console());

            _self.auditLoggers[applicationName] = logger
        }
    })
}

var pid = process && process.pid ? process.pid.toString(36) : '';

/**
 * Returns an unique process identifier value which has created by using current date and process id.
 *
 * @param prefix
 * @returns {string}
 */
Logger.prototype.uniqueId = function (prefix) {
    var time = Date.now();
    return (prefix || '') + pid + time.toString(36)
};

/**
 * Returns current nanotime.
 *
 * @returns {number}
 */
Logger.prototype.nanotime = function () {
    return (new Date()).getTime()
};

/**
 * Check the key is containing the passed value.
 *
 * @param key
 * @param value
 * @returns {boolean}
 */
var isKeyContains = function (key, value) {
    return key ? key.toString().toLowerCase().indexOf(value) > -1 : false
};

/**
 * Clean values of the found password fields.
 *
 * @param obj
 */
var cleanPasswordValues = function (obj) {
    _.each(obj, function (value, key) {
        if (_.isObject(value)) {
            cleanPasswordValues(value)
        } else {
            if (isKeyContains(key, 'password') || isKeyContains(key, 'passwd') || isKeyContains(key, 'token')) {
                obj[key] = '***'
            }
        }
    })
};

/**
 * Audit log printer method.
 *
 * @param isRequest
 * @param req
 * @param res
 * @param responseData
 */
Logger.prototype.auditLog = function (isRequest, req, res, responseData) {
    var username = '';
    var resourceName = '';
    var jti = '';
    var subscriberNumber = '';
    var serviceLabel = '';

    // Extract necessary values from the jwt token.
    var jwt = JWT.verifyTokenOnRequest(req);

    // If this is a secure or authentication request
    if (jwt) {
        // Get the username and resource name from the jwt token.
        username = jwt.body.sub.username;
        resourceName = jwt.body.resourceName;
        jti = jwt.body.jti
    } else if (req.body && req.body.username) {
        // Extract the username and the resourcename values from the request header and the request body.
        username = req.body.username;
        resourceName = req.headers['ResourceName'] || req.headers['resourceName'] || req.headers['resourcename'] || 'unknown'
    } else {
        username = 'unknown';
        resourceName = req.headers['ResourceName'] || req.headers['resourceName'] || req.headers['resourcename'] || 'unknown'
    }

    subscriberNumber = req.headers['SubscriberNumber'] || req.headers['subscriberNumber'] || req.headers['subscribernumber'] || 'unknown';
    serviceLabel = req.headers['ServiceLabel'] || req.headers['serviceLabel'] || req.headers['servicelabel'];

    // Main log body.
    var logMessage = {
        'username': username,
        'service': serviceLabel,
        'method': req.method,
        'userAgent': req.headers['user-agent'],
        'url': req.url,
        'resourceName': resourceName,
        'jti': jti,
        'ipAddresses': req.ips,
        'subscriberNumber': subscriberNumber
    };

    // Make a decision whether this a client request or server response.
    if (isRequest) {
        // Request

        // Create a transaction id.
        req.transactionId = this.uniqueId();
        logMessage = _.extend({transactionId: req.transactionId}, logMessage);

        // Create a request nanotime.
        req.nanotime = this.nanotime();

        // Do not write the body if it is a get request.
        if (req.method !== 'GET' && req.body) {
            let requestDataString = _.isObject(req.body) ? JSON.stringify(req.body) : req.body;
            var parsedRequestData = JSON.parse(requestDataString);
            cleanPasswordValues(parsedRequestData);
            var parsedRequestDataString = JSON.stringify(parsedRequestData);
            logMessage.body = {
                'data': parsedRequestDataString
            };
        }
    } else {
        // Response

        // Use the request transaction id.
        logMessage = _.extend({transactionId: req.transactionId}, logMessage);

        // Status information of the response.
        logMessage.status = res.statusCode + ' [' + res.statusMessage + ']';

        // Duration information of the two package, request and response.
        var resNanotime = this.nanotime();
        var reqNanotime = req.nanotime;
        var duration = resNanotime - reqNanotime;
        logMessage.duration = duration + 'ms';

        if (responseData) {
            // Check exception just in case if the body is not a json object.
            try {
                if (serviceLabel && (serviceLabel.toLowerCase().indexOf('pentaho') > -1) && (serviceLabel.toLowerCase().indexOf('download') > -1)) {
                    responseData = 'Pentaho or content response!';
                    throw new Error('Pentaho or content response!');
                }

                var parsedResponseData = _.isObject(responseData) ? responseData : JSON.parse(responseData);
                cleanPasswordValues(parsedResponseData);
                var parsedResponseDataString = JSON.stringify(parsedResponseData);
                logMessage.body = {
                    'data': parsedResponseDataString
                };

                // Modify the body if it is not large from the maximum body (e.g. 1000) character limit.
                if (parsedResponseDataString.length > this.options.maxBodyLength) {
                    logMessage.body.message = 'Response body is too long!';
                    logMessage.body.data = parsedResponseDataString.substr(0, this.options.maxBodyLength);
                }
            } catch (e) {
                logMessage.body = {
                    'message': 'Response body is not a json object!',
                    'data': responseData
                }
            }
        }
    }

    const referer = req.headers['referer'];

    // Find proper logger instance to write right log file by resource (web application specific log file).
    var auditLogger = _.find(this.auditLoggers, function (auditLogger, key) {
        if (referer) {
            return (referer.toLowerCase().indexOf(key.split('_').join('/')) > -1)
        }

        return false
    });

    if (auditLogger) {
        // Remove the curly brace characters of the top wrapper of the body after jsonizing the log message in order not
        // to break json log object and write as an info log.
        auditLogger.info(JSON.stringify(logMessage).slice(1, -1))
    } else {
        console.log('Audit logger does not found for this referer:', referer)
    }
};

module.exports = Logger;
