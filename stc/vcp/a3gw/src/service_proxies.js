// Service Proxy definitions

const bodyParser = require('body-parser');
const pathJs = require('path');
const _ = require('underscore');

// Respose modifier only works with json responses. For XML/HTTP response use the default body writer.
const modifyResponse = require('node-http-proxy-json');

const {authConfig, serverConfig, serviceProxiesConfig} = require('./utils/conf_reader.js');

const JWT = require('./utils/jwt.js');
const permissionManager = require('./utils/permission_manager.js');
const restreamedProxy = require('./utils/restreamed_proxy.js');

function ServiceProxies() {
}

ServiceProxies.prototype.generateServiceProxies = function (app) {
    // !!! DO NOT CHANGE THE ORDER OF BELOW MODULES
    // AND DO NOT MOVE ANOTHER LINE THEM.
    // Parse application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({extended: false}));

    // Parse application/json
    app.use(bodyParser.json());
    /// ////////////////////////////////////////////

    console.log('\nThe proxy definitions:');
    console.log('----------------------------------------------');
    _.each(serviceProxiesConfig, function (serviceProxyConfig) {
        console.log(serviceProxyConfig.name);

        var pathes = [];
        var rewrites = {};
        var headers;
        var queryParams;
        _.each(serviceProxyConfig.contextList, function (context) {
            pathes.push(context.path);
            rewrites['^' + context.path] = context.rewrite;
            headers = context.headers;
            queryParams = context.queryParams
        });

        // Define options
        var options = {
            proxyTimeout: 300000, // Timeout is 5 minutes.
            timeout: 300000, // Timeout is 5 minutes.
            target: serviceProxyConfig.target,
            secure: serviceProxyConfig.secure !== undefined ? serviceProxyConfig.secure : true,
            pathRewrite: rewrites,
            onError: function (err, req, res) {
                if (err) {
                    console.log(err.message)
                }

                res.writeHead(504, {'Content-Type': 'application/json'});
                res.end('{"message": "Gateway Timeout!"}')
            },
            // Create the proxy request handler default. It checks headers object that it could be add as request headers.
            onProxyReq: function (proxyReq, req, res) {
                // Remove the A3GW token from the proxy requests
                if (proxyReq.getHeader("authorization")) {
                    proxyReq.removeHeader("authorization");
                }

                // Carry the variables to local ones to be able to use in this event handler
                var _pathes = pathes;
                var _headers = headers;
                var _queryParams = queryParams;

                _.each(_pathes, function (path) {
                    if (req._parsedUrl.pathname.startsWith(path)) {
                        // Put headers if there are
                        _.each(_headers, function (value, key) {
                            proxyReq.setHeader(key, value)
                        });

                        // Add query parameters to the path if there are
                        if (_queryParams) {
                            var delimiter = (proxyReq.path.indexOf('?') > -1 ? '&' : '?');
                            var queryStringParams = _.map(_queryParams, function (val, key) {
                                return encodeURIComponent(key) + '=' + encodeURIComponent(val)
                            }).join('&');
                            proxyReq.path = proxyReq.path + delimiter + queryStringParams
                        }
                    }
                })
            }
        };

        // Check is this a cmpf proxy
        // General CMPF proxy definition. Handles requests and extract the passed JWT token. Use the
        // CMPF authentication values which are carrying with the JWT token.
        if (serviceProxyConfig.proxyType === 'cmpf') {
            options.onProxyReq = function (proxyReq, req, res) {
                var jwt = JWT.verifyTokenOnRequest(req);

                // Get the cmpfToken object.
                var cmpfToken = jwt.body.sub.cmpfToken;

                proxyReq.setHeader('hash', cmpfToken.hash);
                proxyReq.setHeader('token', cmpfToken.token);
                proxyReq.setHeader('uid', cmpfToken.uid)
            };

            options.onProxyRes = function (proxyRes, req, res) {
                var parsedPath = pathJs.parse(req._parsedUrl.pathname);

                // If this is a 'rights' request
                if (req.method === 'GET' && parsedPath.dir.startsWith(authConfig.accountsPath) && parsedPath.name === 'rights') {
                    modifyResponse(res, proxyRes, function (rights) {
                        if (!rights) {
                            rights = []
                        }

                        return rights;
                    })
                }
            }
        }

        // Check is this a pentaho proxy
        if (serviceProxyConfig.proxyType === 'pentaho') {
            options.onProxyRes = function (proxyRes, req, res) {
                var _pathes = pathes;
                _.each(_pathes, function (path) {
                    if (req._parsedUrl.pathname.startsWith(path)) {
                        // Change the cookie path to the valid path.
                        var cookie = proxyRes.headers['set-cookie'];
                        if (cookie) {
                            proxyRes.headers['set-cookie'] = cookie.map(function (item) {
                                // Replace paths in all cookies. The simple string/replace approach might be too naive in some
                                // cases, so check before you copy&paste before thinking
                                return item.replace(/\/pentaho/g, serverConfig.servicesBase + path)
                            })
                        }

                        // Remove the authentication header
                        delete proxyRes.headers['www-authenticate'];

                        // Change the service root path in the response content if it is a html report request.
                        if (req.query && req.query['output-target'] === 'table/html;page-mode=stream') {
                            var _write = res.write;
                            res.write = function (data) {
                                try {
                                    _write.call(res, data.toString().replace(/\/pentaho/g, serverConfig.servicesBase + path))
                                } catch (err) {
                                    // ignore
                                }
                            }
                        }
                    }
                })
            }
        }

        // Define the proxy with context and options
        app.use(pathes, restreamedProxy(options))
    });
    console.log('----------------------------------------------')
};

module.exports = new ServiceProxies();
