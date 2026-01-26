// Main Application

const http = require('http');
const express = require('express');
const cookieParser = require("cookie-parser");
const { legacyCreateProxyMiddleware } = require('http-proxy-middleware');
const pathJs = require('path');
const _ = require('underscore');
const chalk = require('chalk');

const nconf = require('nconf');
nconf.argv().env();

const {authConfig, serverConfig, operationsConfig} = require('./utils/conf_reader.js');

const Filter = require('./utils/filter.js');

const ServiceProxies = require('./service_proxies.js');

const JWT = require('./utils/jwt.js');
const permissionManager = require('./utils/permission_manager.js');
const rateLimitManager = require('./utils/rate_limit_manager.js');

var LoggerJS = require('./utils/logger.js');
const logger = new LoggerJS();

// Create the main express application.
var mainApp = express();

mainApp.set('trust proxy', true) // trust first proxy

if (nconf.get('env') === 'production') {
    // Do the production things.
}

if (serverConfig.rateLimit.enabled) {
    rateLimitManager.start(mainApp);
}

mainApp.use(express.json({limit: '50mb'}));
mainApp.use(express.urlencoded({limit: '50mb'}));

mainApp.use(cookieParser());

// Parse JSON bodies for this app. Make sure you put
// `app.use(express.json())` **before** your route handlers!
mainApp.use(express.json());

// Check for Syntax Errors
// Parse request and see if the body contains valid JSON
mainApp.use((error, request, response, next) => {
    if (error instanceof SyntaxError) {
        response.setHeader('X-Error-Message', 'Bad Request / Invalid request body');
        response.status(400).end('Bad Request');
    }
    else
        next();
});

// Check the jwt token first on the storage. If there are a token and it is different from the
// actual token, then reject the reqest.
mainApp.use(function (req, res, next) {
    var jwt = JWT.verifyTokenOnRequest(req);
    if (jwt && authConfig.allowOnlyOneSession) {
        // Grab the token from request headers
        var actualToken = JWT.getTokenFromAuthHeader(req.headers.authorization);

        permissionManager.getUserMemcachedData(jwt.body.sub.username).then(function (cachedToken) {
            //if (cachedToken && (actualToken !== cachedToken)) {
            if (actualToken !== cachedToken) {
                // Audit log here - for response
                logger.auditLog(true, req, res);

                // Send Forbidden status code.
                res.writeHead(403, {
                    'Content-Type': 'text/plain',
                    'Cache-Control': 'no-cache'
                });

                res.end('Forbidden!');

                var result = {error: 'Token is not available!'};

                // Audit log here - for response
                logger.auditLog(false, req, res, result);
            } else {
                next();
            }
        });
    } else {
        next();
    }
});

// Check if a password update operation called for a user.
// Remove the stored token from the storage.
mainApp.use(function (req, res, next) {
    var jwt = JWT.verifyTokenOnRequest(req);
    if (jwt && authConfig.allowOnlyOneSession) {
        var requestPath = req._parsedUrl.pathname;

        if (req.body && (requestPath === ('/cmpf-rest/useraccounts/' + req.body.id)) && req.body.password) {
            permissionManager.deleteUserMemcachedData(req.body.userName).then(function () {
                next();
            });
        } else {
            next();
        }
    } else {
        next();
    }
});

// Main request handler. All requests visits this method. Checks all requests according to path, folder or file type
// values JWT token also and decides the request allowed or not.
mainApp.use(function (req, res, next) {
    var jwt = JWT.verifyTokenOnRequest(req);
    if (Filter.allowedFilter(req._parsedUrl.pathname, req) || jwt) {
        // If operation check is enabled.
        if (jwt && operationsConfig) {
            // Get the cmpfToken object.
            var cmpfToken = jwt.body.sub.cmpfToken;
            var resourceName = jwt.body.resourceName;
            var requestPath = req._parsedUrl.pathname;

            if (requestPath.startsWith('/adminportal') || requestPath.startsWith('/ccportal') || requestPath.startsWith('/partnerportal')) {
                next();
            } else if (requestPath.startsWith('/cmpf-rest/useraccounts/' + cmpfToken.uid + '/rights')) {
                // Get and Update permission cache since the auth request is succeeded.
                permissionManager.getRights(cmpfToken, resourceName);

                next();
            } else {
                // This method saves user's all rights list.
                permissionManager.checkPermission(cmpfToken, resourceName, req).then(function (response) {
                    console.log("Is Allowed:", response.isAllowed, ", Request Path:", response.requestPath, ", CMPF Token:", cmpfToken, ", Resource Name:", resourceName);

                    if (response.isAllowed) {
                        next();
                    } else {
                        // Audit log here - for response
                        logger.auditLog(true, req, res);

                        // Send Forbidden status code.
                        res.writeHead(405, {
                            'Content-Type': 'text/plain',
                            'Cache-Control': 'no-cache'
                        });

                        res.end('Method Not Allowed! Request Path: ' + response.requestPath);

                        var result = {error: 'Method Not Allowed!'};

                        // Audit log here - for response
                        logger.auditLog(false, req, res, result);
                    }
                });
            }
        } else {
            next();
        }
    } else {
        var resolvedPath = pathJs.resolve(req._parsedUrl.pathname);
        if (_.findWhere(serverConfig.applications, {path: resolvedPath})) {
            // If get a request with only application root path, send location redirect then.
            res.writeHead(301, {
                'Location': resolvedPath + '/index.html',
                'Cache-Control': 'no-cache'
            });

            res.end('Redirect!');
        } else {
            // Send Forbidden status code.
            res.writeHead(403, {
                'Content-Type': 'text/plain',
                'Cache-Control': 'no-cache'
            });

            res.end('Forbidden!');
        }
    }
});

console.log('\n');

// Main application proxy. All application specific requests visits this proxy definition.
// serverConfig.applications array contains connection informations of all available single page
// applications.
_.each(serverConfig.applications, function (application) {

    var options = {
        proxyTimeout: 120000, // Timeout is 2 minutes.
        timeout: 120000, // Timeout is 2 minutes.
        target: application.targetHost,
        changeOrigin: true,
        logLevel: serverConfig.logLevel
    };

    if (application.pathRewrite) {
        options.pathRewrite = application.pathRewrite
    }

    console.log(chalk.bold.red('Application proxy binding: ', application.resourceName || application.path));

    var applicationProxy =  legacyCreateProxyMiddleware(options);
    
    mainApp.use(application.path, applicationProxy)
});

// Proxy definitions of the 3rd party web services or restful services.
ServiceProxies.generateServiceProxies(mainApp);

// Server start method
var startServer = function (app) {
    var httpServer = http.createServer(app);

    httpServer.setMaxListeners(50);

    httpServer.listen(serverConfig.proxy.servicesHttpPort, serverConfig.proxy.servicesHttpHost, function () {
        var host = httpServer.address().address;
        var port = httpServer.address().port;

        console.log(chalk.bold.red('\nMain Proxy Server'));
        const startStr = 'Running at http://' + host + ':' + port;
        console.log(chalk.bold.blue(startStr))
    });

    return httpServer
};

// Start Http server
startServer(mainApp);
