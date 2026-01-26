// CMPF Authentication & Authorization proxy servers.

const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const url = require('url');
const _ = require('underscore');
const chalk = require('chalk');
const zlib = require('zlib');
const {createHash} = require('crypto');

const {authConfig, serverConfig, idleConfig} = require('./utils/conf_reader.js');
const JWT = require('./utils/jwt.js');

const permissionManager = require('./utils/permission_manager.js');
const rateLimitManager = require('./utils/rate_limit_manager.js');

var LoggerJS = require('./utils/logger.js');
const logger = new LoggerJS();

const mongoose = require('mongoose');
let userDatabase;

function MobilySSOAuthoxy() {
    // Connect to the rbt user database.
    const conf = authConfig.authenticationServer;
    const connectionUrl = 'mongodb://' + conf.user + ':' + conf.password + '@' + conf.host + ':' + conf.port + '/' + conf.db;
    mongoose.connect(connectionUrl, {
        authSource: 'admin',
        useNewUrlParser: true,
        useUnifiedTopology: true,
        readPreference: 'primary',
        appname: 'a3gw',
        ssl: false
    });
    userDatabase = mongoose.connection;
    userDatabase.on('error', console.error.bind(console, 'connection error:'));
    userDatabase.once('open', function () {
        console.log(chalk.bold.green('\nSuccessfuly connected to the RBT User List database.'));
    });
}

MobilySSOAuthoxy.prototype.startServer = function (port) {
    var httpMobilySSOAuthoxyApp = express();

    httpMobilySSOAuthoxyApp.set('trust proxy', 'loopback');

    // !!! DO NOT CHANGE THE ORDER OF BELOW MODULES
    // AND DO NOT MOVE ANOTHER LINE THEM.

    // Parse application/x-www-form-urlencoded
    httpMobilySSOAuthoxyApp.use(bodyParser.urlencoded({extended: false}));

    // Parse application/json
    httpMobilySSOAuthoxyApp.use(bodyParser.json());

    // Authentication method implementation.
    httpMobilySSOAuthoxyApp.post(authConfig.authenticationServer.path, function (req, res, next) {
        // Audit log here - for request
        logger.auditLog(true, req, res);

        let result = {};

        let username = req.body ? req.body.username : '';
        let password = req.body ? req.body.password : '';
        let msisdn = req.body ? req.body.msisdn : '';

        // If the sent password is not the hashed username...
        const usernameHashed = createHash("sha256").update(username).digest("hex");
        if (password !== usernameHashed) {
            // Send Forbidden status code.
            res.statusCode = 401;
            res.statusMessage = 'Unauthorized';

            res.end('Unauthorized');

            // Audit log here - for response
            logger.auditLog(false, req, res, {});
        } else {
            // Check the username on the database.
            let rbtuserlist = userDatabase.collection(authConfig.authenticationServer.collection);
            rbtuserlist.find({'name': username}).toArray()
                .then(results => {
                    if (results && results.length > 0) {
                        // Get application resource name from the request headers.
                        var resourceName = req.headers['resourcename'];

                        var claims = {
                            sub: {
                                username: username,
                                password: password,
                                msisdn: msisdn,
                                cmpfToken: authConfig.cmpfToken,
                            },
                            resourceName: resourceName ? resourceName : 'undefined'
                        };

                        // Put the idle configuration into the jwt token too
                        if (idleConfig) {
                            claims.idle = {
                                idleTimeout: idleConfig.idleTimeout,
                                keepaliveInterval: idleConfig.keepaliveInterval
                            }
                        }

                        var {token, jti} = JWT.generate(new Date(), claims);
                        var refreshToken = JWT.generateRefreshToken(new Date(), claims, jti);

                        let result = {};

                        // Add token header to response
                        result[serverConfig.auth.tokenName] = token;
                        result[serverConfig.auth.refreshTokenName] = refreshToken;

                        var bodyData = zlib.gzipSync(JSON.stringify(result));

                        // Set headers
                        res.setHeader('Content-Type', 'appliation/json; charset=utf-8');
                        res.setHeader('Content-Encoding', 'gzip');
                        res.setHeader('Content-Length', Buffer.byteLength(bodyData));
                        res.setHeader('Cache-Control', 'no-cache');

                        res.send(bodyData);

                        // Audit log here - for response
                        logger.auditLog(false, req, res, result);
                    } else {
                        // Send Forbidden status code.
                        res.statusCode = 401;
                        res.statusMessage = 'Unauthorized';

                        res.end('Unauthorized');

                        // Audit log here - for response
                        logger.auditLog(false, req, res, {});
                    }
                })
                .catch(function (err) {
                    // Send Forbidden status code.
                    res.statusCode = 401;
                    res.statusMessage = 'Unauthorized';

                    res.end('Unauthorized');

                    // Audit log here - for response
                    logger.auditLog(false, req, res, {});
                });
        }
    });

    var httpServer = http.createServer(httpMobilySSOAuthoxyApp);
    httpServer.listen(port || authConfig.httpPort, authConfig.httpHost, function () {
        var host = httpServer.address().address;
        var port = httpServer.address().port;

        console.log(chalk.bold.red('\nMobily SSO Validation Proxy Server'));
        const startStr = 'Running at http://' + host + ':' + port;
        console.log(chalk.bold.blue(startStr))
    });

    return httpServer
}
;

module.exports = new MobilySSOAuthoxy();
