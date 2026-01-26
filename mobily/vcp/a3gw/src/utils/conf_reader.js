// Configuration Reader

const pathJs = require('path');
const jsonfile = require('jsonfile');
const chalk = require('chalk');
const nconf = require('nconf');
nconf.argv().env();

/**
 * Reads the file by passed name from the disk and returns content.
 *
 * @param fileName
 * @param isOptional
 * @returns {*}
 */
var readConfigFile = function (fileName, isOptional) {
    var config;
    try {
        config = jsonfile.readFileSync(pathJs.join(__dirname, '/../conf/', fileName))
    } catch (err) {
        if (!isOptional) {
            console.log(chalk.red(err.message))
        }
    }

    // Check the conf file is available.
    if (config) {
        console.log(chalk.green('Configuration file has read:', fileName))
    } else if (!isOptional) {
        console.log(chalk.red('!!! There is no configuration file named:'), chalk.bold.red(fileName), chalk.red(' !!!'));
        process.exit()
    }

    return config
};

console.log('\n');

// Try to read the auth configuration file.
const authConfigFile = nconf.get('auth_config');
const authConfigFileName = authConfigFile || 'auth_config.json';
const authConfig = readConfigFile(authConfigFileName);

// Try to read the jwt configuration file.
const jwtConfigFile = nconf.get('jwt_config');
const jwtConfigFileName = jwtConfigFile || 'jwt_config.json';
const jwtConfig = readConfigFile(jwtConfigFileName);

// Try to read the logger config file.
const loggerConfigFile = nconf.get('logger_config');
const loggerConfigFileName = loggerConfigFile || 'logger_config.json';
const loggerConfig = readConfigFile(loggerConfigFileName);

// Try to read the server config file.
const serverConfigFile = nconf.get('server_config');
const serverConfigFileName = serverConfigFile || 'server_config.json';
const serverConfig = readConfigFile(serverConfigFileName);

// Try to read the service proxies config file.
const serviceProxiesConfigFile = nconf.get('service_proxies_config');
const serviceProxiesConfigFileName = serviceProxiesConfigFile || 'service_proxies_config.json';
const serviceProxiesConfig = readConfigFile(serviceProxiesConfigFileName);

// Try to read the idle config file.
const idleConfigFile = nconf.get('idle_config');
const idleConfigFileName = idleConfigFile || 'idle_config.json';
const idleConfig = readConfigFile(idleConfigFileName, true);

// Try to read the operations config file.
const operationsConfigFile = nconf.get('operations_config');
const operationsConfigFileName = operationsConfigFile || 'operations_config.json';
const operationsConfig = readConfigFile(operationsConfigFileName, true);

var conf = {
    authConfig: authConfig,
    jwtConfig: jwtConfig,
    loggerConfig: loggerConfig,
    serverConfig: serverConfig,
    serviceProxiesConfig: serviceProxiesConfig,
    idleConfig: idleConfig,
    operationsConfig: operationsConfig
};
module.exports = conf;
