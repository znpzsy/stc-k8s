// JWT utility

const nJwt = require('njwt');

const {serverConfig, jwtConfig} = require('../utils/conf_reader.js');

// Read the algorithm property from the configuration according to the selected environment.
const JWT_ENCODING_ALGORITHM = jwtConfig.algorithm;
const JWT_SECRET_KEY = jwtConfig.secret;

const JWT_TOKEN_EXPIRE_TIME = jwtConfig.tokenExpireTime;
const JWT_REFRESH_TOKEN_NOT_BEFORE_TIME = jwtConfig.refreshTokenNotBeforeTime;

function JWT() {
    this.secretKey = JWT_SECRET_KEY
}

/**
 * Generate a new JWT
 *
 * @param date
 * @param claims
 * @param jti
 * @returns {*}
 */
JWT.prototype.generate = function (date, claims, jti) {
    // Check the subscriber's username and userid
    if (claims && !claims.sub) {
        throw new Error('sub is required parameter')
    }

    // Check the resourceName
    if (claims && !claims.resourceName) {
        throw new Error('resourceName is required parameter')
    }

    var issuedAtEpochSec = Math.floor(date.getTime() / 1000);

    var jwt = nJwt.create(claims, this.secretKey, JWT_ENCODING_ALGORITHM);
    jwt.setIssuedAt(issuedAtEpochSec);

    jwt.setExpiration((issuedAtEpochSec * 1000) + Number(JWT_TOKEN_EXPIRE_TIME));

    // If a jti value passed as parameter then use it as jti.
    if (jti) {
        jwt.setJti(jti)
    }

    var token = jwt.compact();

    return {token: token, jti: jwt.body.jti}
};

/**
 * Generate a new JWT
 *
 * @param date
 * @param claims
 * @param jti
 * @returns {*}
 */
JWT.prototype.generateRefreshToken = function (date, claims, jti) {
    // Check the subscriber's username and userid
    if (claims && !claims.sub) {
        throw new Error('sub is required parameter')
    }

    // Check the resourceName
    if (claims && !claims.resourceName) {
        throw new Error('resourceName is required parameter')
    }

    // Put a flag about this token is for refresh only.
    claims.refreshOnly = true;

    var issuedAtEpochSec = Math.floor(date.getTime() / 1000);

    var jwt = nJwt.create(claims, this.secretKey, JWT_ENCODING_ALGORITHM);
    jwt.setIssuedAt(issuedAtEpochSec);

    // Reducing the expiration time to 30 minutes.
    jwt.setExpiration((issuedAtEpochSec * 1000) + Number(JWT_TOKEN_EXPIRE_TIME));
    jwt.setNotBefore((issuedAtEpochSec * 1000) + Number(JWT_REFRESH_TOKEN_NOT_BEFORE_TIME));

    // If a jti value passed as parameter then use it as jti.
    if (jti) {
        jwt.setJti(jti)
    }

    var token = jwt.compact();

    return token
};

/**
 * Verify the passed jwt token with the secrect key.
 *
 * @param token
 * @returns {*} Returns JWT object
 */
JWT.prototype.verify = function (token) {
    var verifiedJwt;

    try {
        verifiedJwt = nJwt.verify(token || '', this.secretKey)
    } catch (e) {
        throw new Error('token is invalid!') // Token has expired, has been tampered with, etc
    }

    return verifiedJwt
};

/**
 * Extracts the Authorization header and find the value of it. Uses the specified header key to able to extract the header.
 * Returns the token value only.
 *
 * @param authorizationHeader
 * @returns {string}
 */
JWT.prototype.getTokenFromAuthHeader = function (authorizationHeader) {
    var token = '';
    if (authorizationHeader) {
        var parts = authorizationHeader.split(' ');
        if (parts.length === 2 && parts[0] === serverConfig.auth.authorizationHeaderKey) {
            token = parts[1]
        }
    }

    return token
};

/**
 * Verify the token that has extracted from the related request header.
 *
 * @param request
 * @returns {*}
 */
JWT.prototype.verifyTokenOnRequest = function (request) {
    var jwt;

    if (request.headers && request.headers.authorization) {
        // Grab the token from request headers
        var token = this.getTokenFromAuthHeader(request.headers.authorization);

        try {
            jwt = this.verify(token)
        } catch (e) {
            // Ignore the error
            // console.log(e.message);
        }
    }

    return jwt
};

module.exports = new JWT();
