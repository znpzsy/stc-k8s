(function () {
    'use strict';

    /* Restful Services */
    angular.module('Application.rest-services', []);

    var ApplicationRestServices = angular.module('Application.rest-services');

    // Restangular service which connects to CMPF rest service
    ApplicationRestServices.factory('CMPFAuthRestangular', function (Restangular, RESOURCE_NAME) {
        return Restangular.withConfig(function (RestangularConfigurer) {
            RestangularConfigurer.setDefaultHeaders({
                'ServiceLabel': 'CMPF Authorization',
                'ResourceName': RESOURCE_NAME
            });
            RestangularConfigurer.setBaseUrl('/cmpf-auth-rest');
        });
    });

    ApplicationRestServices.constant('SERVICES_BASE', '/vcp/services');

    ApplicationRestServices.factory('MainRestangularConfService', function (Restangular, SERVICES_BASE, SessionService) {
        return {
            prepareRestangularConf: function (restangularInstance, serviceLabel, baseUrl) {
                return restangularInstance.withConfig(function (RestangularConfigurer) {
                    RestangularConfigurer.addFullRequestInterceptor(function (element, operation, what, url, headers, params, httpConfig) {
                        headers.Channel = 'CC';
                        headers.Username = SessionService.getUsername();
                        headers.TransactionId = new Date().getTime();
                        headers.ServiceLabel = serviceLabel;

                        return {
                            headers: headers
                        };
                    });

                    RestangularConfigurer.setBaseUrl(SERVICES_BASE + baseUrl);
                });
            }
        };
    });

    // Server Information and Configuration Restangular
    ApplicationRestServices.factory('ServerInformationRestangular', function (Restangular) {
        return Restangular.withConfig(function (RestangularConfigurer) {
            RestangularConfigurer.setBaseUrl('/');
        });
    });

    ApplicationRestServices.factory('CMPFRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'CMPF', '/cmpf-rest');
    });
    ApplicationRestServices.factory('CMPFCacheRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'CMPF Cache', '/cmpf-cache-rest');
    });

    // Restangular service which connects to Subscriber rest service
    ApplicationRestServices.factory('SubscriberRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Subscriber Service', '/subscriber-rest/v1');
    });

    // Restangular service which connects to Screening Manager rest service
    ApplicationRestServices.factory('ScreeningManagerRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Screening Manager', '/screening-manager-rest/v2');
    });
    ApplicationRestServices.factory('ScreeningManagerStatsRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Screening Manager Statistics', '/screening-manager-stats-rest/v1');
    });

    //  SMSC rest services
    ApplicationRestServices.factory('SmscProvRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'SMSC Provisioning', '/smsc-gr-rest/provisioning/v1');
    });
    ApplicationRestServices.factory('SmscOperationRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'SMSC Operation', '/smsc-operation-local-rest/v1');
    });
    ApplicationRestServices.factory('SmscRemoteOperationRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'SMSC Remote Operation', '/smsc-operation-remote-rest/v1');
    });
    ApplicationRestServices.factory('SfeReportingRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'SFE Reporting', '/smsc-sfe-reporting-local-rest/v1');
    });
    ApplicationRestServices.factory('SfeRemoteReportingRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'SFE Remote Reporting', '/smsc-sfe-reporting-remote-rest/v1');
    });
    ApplicationRestServices.factory('SmscSenderApplicationRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'SMSC Sender Application', '/smsc-sender-application-local-rest/application/sender');
    });
    ApplicationRestServices.factory('SmscRemoteSenderApplicationRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'SMSC Sender Remote Application', '/smsc-sender-application-remote-rest/application/sender');
    });

    // Restangular service that MMSC troubleshooting rest service uses
    ApplicationRestServices.factory('MmscTroubleshootingRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'MMSC Troubleshooting', '/mmsc-troubleshooting-local-rest/v2');
    });
    ApplicationRestServices.factory('MmscRemoteTroubleshootingRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'MMSC Troubleshooting Remote', '/mmsc-troubleshooting-remote-rest/v2');
    });

    // SMS AntiSpam Services
    ApplicationRestServices.factory('SMSAntiSpamRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'SMS Anti-Spam', '/smsantispam-core-gr-rest');
    });
    ApplicationRestServices.factory('SMSAntiSpamConfigRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'SMS Anti-Spam Configuration', '/smsantispam-config-gr-rest/v1');
    });

    // USSD Gateway restangular definitions
    ApplicationRestServices.factory('UssdBrowserRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'USSD Browser', '/ussd-browser-gr-rest/v1');
    });

    // Missed Call Notification
    ApplicationRestServices.factory('MCAProvRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Missed Call Notification', '/mcn-provisioning-gr-rest/v3');
    });
    ApplicationRestServices.factory('MCAConfigRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Missed Call Notification Configuration', '/mcn-configuration-gr-rest/v5');
    });

    // Voice Mail
    ApplicationRestServices.factory('VMConfigurationRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Voice Mail Configuration', '/voicemail-rest/configuration/v1');
    });
    ApplicationRestServices.factory('VMSelfCareRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Voice Mail Self Care', '/voicemail-rest/cc/v4');
    });
    ApplicationRestServices.factory('VMProvisioningRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Voice Mail Provisioning', '/voicemail-rest/provisioning/v1');
    });

    // P4M
    ApplicationRestServices.factory('P4MRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'P4M Service', '/p4m-rest/v2');
    });

    // Elastic search services
    ApplicationRestServices.service('ESClient', function (esFactory, $location, $log, SERVICES_BASE) {
        var esResServiceUrl = $location.protocol() + '://' + $location.host() + ':' + $location.port() + SERVICES_BASE + '/es-local-rest';
        $log.debug('Elastic search client url: ', esResServiceUrl);

        return esFactory({
            host: esResServiceUrl,
            log: 'error'
        });
    });
    ApplicationRestServices.service('ESClientRemote', function (esFactory, $location, $log, SERVICES_BASE) {
        var esResServiceUrl = $location.protocol() + '://' + $location.host() + ':' + $location.port() + SERVICES_BASE + '/es-remote-rest';
        $log.debug('Elastic search client remote url: ', esResServiceUrl);

        return esFactory({
            host: esResServiceUrl,
            log: 'error'
        });
    });
    ApplicationRestServices.service('SmscESClient', function (esFactory, $location, $log, SERVICES_BASE) {
        var esResServiceUrl = $location.protocol() + '://' + $location.host() + ':' + $location.port() + SERVICES_BASE + '/smsc-es-local-rest';
        $log.debug('SMSC Elastic Search client url: ', esResServiceUrl);

        return esFactory({
            host: esResServiceUrl,
            log: 'error'
        });
    });
    ApplicationRestServices.service('SmscESClientRemote', function (esFactory, $location, $log, SERVICES_BASE) {
        var esResServiceUrl = $location.protocol() + '://' + $location.host() + ':' + $location.port() + SERVICES_BASE + '/smsc-es-remote-rest';
        $log.debug('SMSC Elastic Search client remote url: ', esResServiceUrl);

        return esFactory({
            host: esResServiceUrl,
            log: 'error'
        });
    });
    ApplicationRestServices.service('SmscESAdapterClient', function (esFactory, $location, $log, SERVICES_BASE) {
        var esResServiceUrl = $location.protocol() + '://' + $location.host() + ':' + $location.port() + SERVICES_BASE + '/smsc-es-adapter-local-rest';
        $log.debug('SMSC Elastic Search adapter client url: ', esResServiceUrl);

        return esFactory({
            host: esResServiceUrl,
            log: 'error'
        });
    });
    ApplicationRestServices.service('SmscESAdapterClientRemote', function (esFactory, $location, $log, SERVICES_BASE) {
        var esResServiceUrl = $location.protocol() + '://' + $location.host() + ':' + $location.port() + SERVICES_BASE + '/smsc-es-adapter-remote-rest';
        $log.debug('SMSC Elastic Search adapter client remote url: ', esResServiceUrl);

        return esFactory({
            host: esResServiceUrl,
            log: 'error'
        });
    });
    ApplicationRestServices.service('SMSAntiSpamESClient', function (esFactory, $location, $log, SERVICES_BASE) {
        var esResServiceUrl = $location.protocol() + '://' + $location.host() + ':' + $location.port() + SERVICES_BASE + '/smsantispam-es-local-rest';
        $log.debug('SMSAntiSpam Elastic Search client url: ', esResServiceUrl);

        return esFactory({
            host: esResServiceUrl,
            log: 'error'
        });
    });
    ApplicationRestServices.service('SMSAntiSpamESClientRemote', function (esFactory, $location, $log, SERVICES_BASE) {
        var esResServiceUrl = $location.protocol() + '://' + $location.host() + ':' + $location.port() + SERVICES_BASE + '/smsantispam-es-remote-rest';
        $log.debug('SMSAntiSpam Elastic Search client url: ', esResServiceUrl);

        return esFactory({
            host: esResServiceUrl,
            log: 'error'
        });
    });
    ApplicationRestServices.service('SMSAntiSpamESAdapterClient', function (esFactory, $location, $log, SERVICES_BASE) {
        var esResServiceUrl = $location.protocol() + '://' + $location.host() + ':' + $location.port() + SERVICES_BASE + '/smsantispam-es-adapter-local-rest';
        $log.debug('SMSAntiSpam Elastic Search adapter client url: ', esResServiceUrl);

        return esFactory({
            host: esResServiceUrl,
            log: 'error'
        });
    });
    ApplicationRestServices.service('SMSAntiSpamESAdapterClientRemote', function (esFactory, $location, $log, SERVICES_BASE) {
        var esResServiceUrl = $location.protocol() + '://' + $location.host() + ':' + $location.port() + SERVICES_BASE + '/smsantispam-es-adapter-remote-rest';
        $log.debug('SMSAntiSpam Elastic Search adapter client url: ', esResServiceUrl);

        return esFactory({
            host: esResServiceUrl,
            log: 'error'
        });
    });
    ApplicationRestServices.service('RBTESClient', function (esFactory, $location, $log, SERVICES_BASE) {
        var esResServiceUrl = $location.protocol() + '://' + $location.host() + ':' + $location.port() + SERVICES_BASE + '/rbt-es-local-rest';
        $log.debug('RBT Elastic Search client url: ', esResServiceUrl);

        return esFactory({
            host: esResServiceUrl,
            log: 'error'
        });
    });
    ApplicationRestServices.service('RBTESClientRemote', function (esFactory, $location, $log, SERVICES_BASE) {
        var esResServiceUrl = $location.protocol() + '://' + $location.host() + ':' + $location.port() + SERVICES_BASE + '/rbt-es-remote-rest';
        $log.debug('RBT Elastic Search client url: ', esResServiceUrl);

        return esFactory({
            host: esResServiceUrl,
            log: 'error'
        });
    });

})();
