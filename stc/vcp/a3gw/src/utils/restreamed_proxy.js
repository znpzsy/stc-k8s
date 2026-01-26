// Proxy restreamer utility.

const { legacyCreateProxyMiddleware } = require('http-proxy-middleware');

const {serverConfig} = require('../utils/conf_reader.js');
const zlib = require('node:zlib'); 

var LoggerJS = require('../utils/logger.js');
const logger = new LoggerJS();

/**
 * Restream parsed body before proxying. Audit log will be created in this base proxy method also for each requests and
 * response.
 *
 * @param context
 * @param opts
 * @returns {module.exports}
 */
var restreamedProxy = function (opts) {
    // Default proxy parameters
    opts.changeOrigin = true; // Change origin of the proxy request
    opts.logLevel = serverConfig.logLevel; // Log level definition of the proxy middleware definitions.

    var _onProxyReq = opts.onProxyReq;
    // Wrapper for the request handler of proxy
    opts.onProxyReq = function (proxyReq, req, res) {
        // Audit log here
        logger.auditLog(true, req, res);

        if (typeof _onProxyReq === 'function') {
            _onProxyReq(proxyReq, req, res)
        }

        // Only restreaming the body data.
        if (req.body && req.headers['content-type']) {
            if (req.headers['content-type'].indexOf('application/json') > -1) {
                var bodyData = JSON.stringify(req.body);

                proxyReq.setHeader('Content-Type', 'application/json');

                proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));

                // Write out body changes to the proxyReq stream.
                proxyReq.write(bodyData);

                proxyReq.end()
            } else if (req.headers['content-type'].indexOf('application/x-www-form-urlencoded') > -1) {
                // Make any needed POST parameter changes
                var body = {};

                // URI encode JSON object
                body = Object.keys(req.body).map(function (key) {
                    return encodeURIComponent(key) + '=' + encodeURIComponent(req.body[key])
                }).join('&');

                // Remove body-parser body object from the request
                if (req.body) delete req.body;

                // Update header
                proxyReq.setHeader('content-type', 'application/x-www-form-urlencoded');
                proxyReq.setHeader('content-length', body.length);

                // Write out body changes to the proxyReq stream
                proxyReq.write(body);

                proxyReq.end()
            }
        }
    };

    var _onProxyRes = opts.onProxyRes;
    // Wrapper for the response handler of proxy
    opts.onProxyRes = function (proxyRes, req, res) {
        var chunks = [];

        var _write = res.write;
        res.write = function (dataBuffer) {
            // If the data type is string, then we have to convert it into byte array
            // to be able to concat them properly in the end handler.
            if (typeof dataBuffer === 'string' || dataBuffer instanceof String) {
                dataBuffer = Buffer.from(dataBuffer);
            }

            chunks.push(dataBuffer);
            _write.call(res, dataBuffer)
        };

        var _end = res.end;
        res.end = function () {
            var buffer = Buffer.concat(chunks);

            var encoding = res.getHeader('content-encoding');
            if (encoding === 'gzip') {
                zlib.gunzip(buffer, function (err, decoded) {
                    var logData = (err || decoded && decoded.toString('utf8'));

                    // Audit log here
                    logger.auditLog(false, req, res, logData);
                });
            } else if (encoding === 'deflate') {
                zlib.inflate(buffer, function (err, decoded) {
                    var logData = (err || decoded && decoded.toString('utf8'));

                    // Audit log here
                    logger.auditLog(false, req, res, logData);
                })
            } else {
                var logData = buffer.toString('utf8');

                // Audit log here
                logger.auditLog(false, req, res, logData);
            }

            _end.call(res)
        };

        if (typeof _onProxyRes === 'function') {
            _onProxyRes(proxyRes, req, res)
        }
    };

    return legacyCreateProxyMiddleware(opts)
};

module.exports = restreamedProxy;
