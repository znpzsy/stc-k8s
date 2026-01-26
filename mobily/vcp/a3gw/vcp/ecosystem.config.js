module.exports = {
    /**
     * Application configuration section
     * http://pm2.keymetrics.io/docs/usage/application-declaration/
     */
    apps: [

        // VCP application
        {
            name: 'a3gw_vcp',
            script: 'src/app.js',
            env: {
            }
        },

        // VCP CMPF Auth application
        {
            name: 'a3gw_cmpf',
            script: 'src/app_auth.js',
            env: {
                auth_service: 'cmpf_authoxy.js',
                auth_config: 'auth_config.json'
            }
        },

        // Private static server
        {
            name: "private_8085",
            script: "serve",
            env: {
                "PM2_SERVE_PATH": '/space/a3gw/static/private',
                "PM2_SERVE_HOST": '127.0.0.1',
                "PM2_SERVE_PORT": 8085
            }
        },

        // Public static server
        {
            name: "public_8086",
            script: "serve",
            env: {
                "PM2_SERVE_PATH": '/space/a3gw/static/public',
                "PM2_SERVE_HOST": '127.0.0.1',
                "PM2_SERVE_PORT": 8086
            }
        }

    ],

    /**
     * Deployment section
     * http://pm2.keymetrics.io/docs/usage/deployment/
     */
    deploy: {
        test: {
        },
        preprod: {
        },
        prod: {
        }
    }
};
