// CMPF Authentication & Authorization proxy servers.

const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const url = require('url');
const pathJs = require('path');
const _ = require('underscore');
const chalk = require('chalk');

// Response modifier only works with json responses. For XML/HTTP response use the default body writer.
const modifyResponse = require('node-http-proxy-json');

const {authConfig, serverConfig, idleConfig} = require('./utils/conf_reader.js');
const JWT = require('./utils/jwt.js');
const restreamedProxy = require('./utils/restreamed_proxy.js');

const CaptchaListener = require('./utils/captcha/captcha.js');

const permissionManager = require('./utils/permission_manager.js');
const rateLimitManager = require('./utils/rate_limit_manager.js');

var LoggerJS = require('./utils/logger.js');
const logger = new LoggerJS();

var crypto = require("node:crypto");

function CMPFAuthoxy() {
}

// HTTP Server Initialization
var portalCMPFProxy = restreamedProxy({
    proxyTimeout: 120000, // Timeout is 2 minutes.
    timeout: 120000, // Timeout is 2 minutes.
    target: authConfig.authenticationServer.target,
    pathRewrite: authConfig.authenticationServer.pathRewrite,
    onError: function (err, req, res) {
        if (err) {
            console.log(err.message)
        }

        res.writeHead(504, {'Content-Type': 'application/json'});
        res.end('{"message": "Gateway Timeout!"}')
    },
    onProxyReq: function (proxyReq, req, res) {
        if (req.method === 'POST' && (req._parsedUrl.pathname = authConfig.authenticationServer.path)) {
            // Check the necessary parameters are here.
            if (req.body && req.body.username && req.body.password) {
                if (req.headers['resourcename']) {
                    // Modify the password parameter to adding {PLAIN} text as prefix.
                    req.body.password = '{PLAIN}' + req.body.password
                } else {
                    req.body.password = crypto.randomBytes(20).toString('hex');
                }
            }
        }
    },
    onProxyRes: function (proxyRes, req, res) {
        // Mask errors produced by unimplemented cmpf service methods
        if(req._parsedUrl.pathname = authConfig.authenticationServer.path){
            if (proxyRes.statusCode >= 400) {
                const contentType = proxyRes.headers['content-type']
                if (contentType && contentType.includes('text/html')){
                    // Send Unauthorized status code for these.
                    proxyRes.statusCode = 403;
                    proxyRes.statusMessage = 'Forbidden';
                    proxyRes.headers['content-type'] = 'application/json';
                    proxyRes.headers['content-length'] = 0;
                    proxyRes.headers['access-control-max-age'] = 60 * 60 * 24 * 30
                    modifyResponse(res, proxyRes, async function (body) {
                        if (body && body.toLowerCase().includes('error')) {
                            // modify response body.
                            body = "Forbidden!";
                        }
                        return body;
                    });
                }
            }
        }

        // Mask the response for the OPTIONS method, as the CMPF server's internal address might be revealed.
        if (req.method === 'OPTIONS' && (req._parsedUrl.pathname = authConfig.authenticationServer.path)) {
            proxyRes.statusCode = 405;
            proxyRes.statusMessage = 'Method Not Allowed';
            proxyRes.headers['content-type'] = 'application/json';
            proxyRes.headers['content-length'] = 0;
            proxyRes.headers['access-control-max-age'] = 60 * 60 * 24 * 30
            modifyResponse(res, proxyRes, async function (body) {
                // modify response body.
                body = "Method Not Allowed!";
                return body;
            });
        }


        if (req.method === 'POST' && (req._parsedUrl.pathname = authConfig.authenticationServer.path)) {
            if (proxyRes.statusCode !== 200) {
                // Send Unauthorized status code.
                proxyRes.statusCode = 401;
                proxyRes.statusMessage = 'Unauthorized';
                proxyRes.headers['content-type'] = 'application/json';
                proxyRes.headers['content-length'] = 0;
                proxyRes.headers['access-control-max-age'] = 60 * 60 * 24 * 30

                modifyResponse(res, proxyRes, async function (body) {
                    return body;
                });
            } else {
                // Get application resource name from the request headers.
                var resourceName = req.headers['resourcename'];

                // Get username of the user.
                var username = req.body.username;

                modifyResponse(res, proxyRes, async function (body) {
                    if (!body) {
                        body = {}
                    }

                    var claims = {
                        sub: {
                            cmpfToken: {
                                hash: body.hash,
                                token: body.token,
                                uid: body.uid,
                                oid: body.oid
                            },
                            username: username
                        },
                        resourceName: resourceName
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

                    // Delete the attributes returns from the CMPF authorization service.
                    delete body.token;
                    delete body.hash;
                    delete body.uid;
                    delete body.oid;

                    // Add token header to response
                    body[serverConfig.auth.tokenName] = token;
                    body[serverConfig.auth.refreshTokenName] = refreshToken;

                    proxyRes.headers['content-length'] = token.length + refreshToken.length;

                    // Write the current token for the username to the storage.
                    permissionManager.putUserMemcachedData(username, body.token);

                    return body;
                });
            }
        }

        if (req._parsedUrl.pathname === authConfig.authenticationServer.path) {
            var allowedOrigin = false;
            // Check the origin header
            if (req.headers.origin) {
                const originHostName = url.parse(req.headers.origin).hostname;
                if (originHostName && serverConfig.filter.allowedOrigins.some(function (o) {
                    return o === originHostName
                })) {
                    proxyRes.headers['access-control-allow-origin'] = req.headers.origin;
                    proxyRes.headers['access-control-allow-credentials'] = 'true';
                    allowedOrigin = true;
                }
            }

            if (req.headers['access-control-request-method']) {
                proxyRes.headers['access-control-allow-methods'] = req.headers['access-control-request-method']
            }

            if (req.headers['access-control-request-headers']) {
                proxyRes.headers['access-control-allow-headers'] = req.headers['access-control-request-headers']
            }

            // If the request method is OPTIONS and origin allowed
            if (allowedOrigin && req.method === 'OPTIONS') {
                proxyRes.headers['content-type'] = 'application/json';
                proxyRes.headers['content-length'] = 0;
                proxyRes.headers['access-control-max-age'] = 60 * 60 * 24 * 30;

                proxyRes.statusCode = 200;
                proxyRes.statusMessage = 'OK';

                // Clean the body of the proxy response
                var _write = res.write;
                res.write = function (data) {
                    try {
                        _write.call(res, '')
                    } catch (err) {
                        // ignore
                    }
                }
            }
        }
    }
});

CMPFAuthoxy.prototype.startServer = function (port) {
    var httpCMPFAuthoxyApp = express();

    httpCMPFAuthoxyApp.set('trust proxy', true);

    if (serverConfig.rateLimit.enabled) {
        rateLimitManager.start(httpCMPFAuthoxyApp);
    }

    // !!! DO NOT CHANGE THE ORDER OF BELOW MODULES
    // AND DO NOT MOVE ANOTHER LINE THEM.
    // Parse application/x-www-form-urlencoded
    httpCMPFAuthoxyApp.use(bodyParser.urlencoded({extended: false}));

    // Parse application/json
    httpCMPFAuthoxyApp.use(bodyParser.json());

    // Check for Syntax Errors
    // Parse request and see if the body contains valid JSON
    httpCMPFAuthoxyApp.use((error, request, response, next) => {
        if (error instanceof SyntaxError) {
            response.setHeader('X-Error-Message', 'Bad Request / Invalid request body');
            response.status(400).end('Bad Request');
        }
        else
            next();
    });

    // Checks the token is available on the storage for the current user.
    httpCMPFAuthoxyApp.use(function (req, res, next) {
        if (authConfig.allowOnlyOneSession && req.url === '/cmpf-rest/authenticate' && req.body && req.body.username) {
            permissionManager.getUserMemcachedData(req.body.username).then(function (response) {
                if (response) {
                    permissionManager.deleteUserMemcachedData(req.body.username);
                }

                next();
            });
        } else {
            next();
        }
    });

    // Listener for captcha images.
    CaptchaListener.bindCaptchaListeners(httpCMPFAuthoxyApp);
    // General listener for captcha validation.
    httpCMPFAuthoxyApp.use(function (req, res, next) {
        // Get related application configuration according to the resource name of the request.
        var requestResourceName = req.headers.resourcename;
        var application = _.findWhere(serverConfig.applications, {resourceName: requestResourceName});

        // Check if captcha is enabled and different from the url "/refresh-token" for the application.
        if (application && application.captchaEnabled && req.url !== '/refresh-token') {
            var result = {};

            let captchaText = req.body[CaptchaListener.captchaFieldName];
            var verifyCaptcha = CaptchaListener.checkCaptcha(req, captchaText);
            if (verifyCaptcha) {
                next();
            } else {
                // Audit log here - for request
                logger.auditLog(true, req, res);

                res.writeHead(401, {'Content-Type': 'application/json'});
                res.end('{"message": "Invalid captcha!"}');

                result = {error: 'Invalid captcha!'};

                // Audit log here - for response
                logger.auditLog(false, req, res, result)
            }
        } else {
            next();
        }
    });

    httpCMPFAuthoxyApp.use(authConfig.authenticationServer.path, portalCMPFProxy);
    /// ////////////////////////////////////////////

    // Check the token validity. Crete a new token and return if token is valid.
    httpCMPFAuthoxyApp.get('/refresh-token', function (req, res, next) {
        // Audit log here - for request
        logger.auditLog(true, req, res);

        var result = {};

        var jwt = JWT.verifyTokenOnRequest(req);
        if (jwt && jwt.body.refreshOnly) {
            // Use the claims of the previous jwt.
            var claims = {
                sub: jwt.body.sub,
                resourceName: jwt.body.resourceName
            };

            if (jwt.body.idle) {
                claims.idle = jwt.body.idle
            }

            var {token} = JWT.generate(new Date(), claims, jwt.body.jti);
            var refreshToken = JWT.generateRefreshToken(new Date(), claims, jwt.body.jti);

            // Write and update the current token for the username to the storage.
            permissionManager.putUserMemcachedData(jwt.body.sub.username, token);

            res.setHeader('Content-Type', 'application/json');

            result[serverConfig.auth.tokenName] = token;
            result[serverConfig.auth.refreshTokenName] = refreshToken;

            res.send(JSON.stringify(result))
        } else {
            // Send Forbidden status code.
            res.writeHead(403, {
                'Content-Type': 'text/plain'
            });

            result = {error: 'Invalid refresh token!'};

            res.end('Forbidden!')
        }

        // Audit log here - for response
        logger.auditLog(false, req, res, result)
    });

        // Check the token validity. Crete a new token and return if token is valid.
        httpCMPFAuthoxyApp.get('/logout', function (req, res, next) {
            // Audit log here - for request
            logger.auditLog(true, req, res);
    
            var jwt = JWT.verifyTokenOnRequest(req);
            if (jwt && jwt.body) {
                // Write and update the current token for the username to the storage.
                permissionManager.deleteUserMemcachedData(jwt.body.sub.username);
            }
    
            res.setHeader('Content-Type', 'application/json');
    
            var result = {"message": "Session invalidated."};
            res.send(result);
    
            // Audit log here - for response
            logger.auditLog(false, req, res, result)
        });

    var httpServer = http.createServer(httpCMPFAuthoxyApp);
    httpServer.listen(port || authConfig.httpPort, authConfig.httpHost, function () {
        var host = httpServer.address().address;
        var port = httpServer.address().port;

        console.log(chalk.bold.red('\nCMPF Authorization & Authentication Proxy Server'));
        const startStr = 'Running at http://' + host + ':' + port;
        console.log(chalk.bold.blue(startStr))
    });

    return httpServer
};

module.exports = new CMPFAuthoxy();
