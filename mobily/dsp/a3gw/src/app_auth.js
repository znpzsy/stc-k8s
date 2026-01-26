// Authentication Application

const pathJs = require('path');
const nconf = require('nconf');
nconf.argv().env();

// Authentication server related steps.
//
// Try to read the auth service file name. It uses the default cmpf authentication service if not found any parameter.
const authServiceFile = nconf.get('auth_service');
const authServiceFileName = authServiceFile || 'cmpf_authoxy.js';
const authService = require(pathJs.join(__dirname, '/', authServiceFileName));

// Start up the authentication & authorization proxy server.
authService.startServer();
