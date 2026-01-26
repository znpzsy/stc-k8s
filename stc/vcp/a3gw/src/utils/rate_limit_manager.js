// Keeps rates by ip addresses on the memcache server or memory.

const Memcached = require('memcached');
const rateLimit = require("express-rate-limit");
const MemcachedStore = require('rate-limit-memcached');
const _ = require('underscore');
const chalk = require('chalk');

const {authConfig, serverConfig} = require('./conf_reader.js');

const REQUEST_LIMITER_CACHE_PREFIX = 'a3gw_remote_ip_requests:';

var rateLimitOptions = {
    windowMs: serverConfig.rateLimit.expiration * 1000, // 10 minutes
    max: serverConfig.rateLimit.max, // limit each IP to 500 requests per windowMs
    delayMs: 0
};

function RateLimitManager() {
    if (serverConfig.rateLimit.enabled && authConfig.memcachedServers && authConfig.memcachedServers.length > 0) {
        rateLimitOptions.store = new MemcachedStore({
            expiration: serverConfig.expiration,
            client: new Memcached(authConfig.memcachedServers),
            prefix: REQUEST_LIMITER_CACHE_PREFIX
        });
    }
}

/**
 * Start a rate limiter for the passed express application.
 *
 * @param app
 * @returns {*}
 */
RateLimitManager.prototype.start = function (app) {
    var limiter = rateLimit(rateLimitOptions);

    //  apply to all requests
    app.use(limiter);
};

module.exports = new RateLimitManager();
