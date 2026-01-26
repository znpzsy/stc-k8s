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
    ApplicationRestServices.factory('ServerConfigurationRestangular', function (Restangular, SessionService) {
        return Restangular.withConfig(function (RestangularConfigurer) {
            RestangularConfigurer.addFullRequestInterceptor(function (element, operation, what, url, headers, params, httpConfig) {
                headers.Channel = 'CC';
                headers.Username = SessionService.getUsername();
                headers.TransactionId = new Date().getTime();
                headers.ServiceLabel = 'Server Configuration';

                return {
                    headers: headers
                };
            });

            RestangularConfigurer.setBaseUrl('/conf');
        });
    });

    ApplicationRestServices.factory('CMPFRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'CMPF', '/cmpf-rest');
    });
    ApplicationRestServices.factory('CMPFCacheRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'CMPF Cache', '/cmpf-cache-rest');
    });

    // Restangular service which connects to Screening Manager rest service
    ApplicationRestServices.factory('ScreeningManagerRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Screening Manager', '/screening-manager-rest/v2');
    });

    ApplicationRestServices.factory('ScreeningManagerStatsRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Screening Manager Statistics', '/screening-manager-stats-rest/v1');
    });

    //  SMSC rest services
    ApplicationRestServices.factory('SmscConfigRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'SMSC Configuration', '/smsc-gr-rest/configuration/v1');
    });
    ApplicationRestServices.factory('SmscProvRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'SMSC Provisioning', '/smsc-gr-rest/provisioning/v1');
    });
    ApplicationRestServices.factory('SmscDashboardRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'SMSC Dashboard', '/smsc-gr-rest/dashboard/smsc/v1');
    });
    ApplicationRestServices.factory('SmscOperationRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'SMSC Operation', '/smsc-operation-local-rest/v1');
    });
    ApplicationRestServices.factory('SmscRemoteOperationRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'SMSC Remote Operation', '/smsc-operation-remote-rest/v1');
    });
    ApplicationRestServices.factory('SfeDashboardRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'SFE Dashboard', '/smsc-sfe-dashboard-local-rest/v1');
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
    ApplicationRestServices.factory('SmscEDRReportingServiceRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'SMSC EDR Reporting Service', '/smsc-edr-reporting-rest');
    });

    // MMSC rest services
    ApplicationRestServices.factory('MmscConfigRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'MMSC Configuration', '/mmsc-config-gr-rest/v2');
    });
    ApplicationRestServices.factory('MmscOperationRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'MMSC Operation', '/mmsc-operation-gr-rest/v1');
    });
    ApplicationRestServices.factory('MmscDashboardRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'MMSC Dashboard', '/mmsc-dashboard-local-rest/v2');
    });
    ApplicationRestServices.factory('MmscTroubleshootingRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'MMSC Troubleshooting', '/mmsc-troubleshooting-local-rest/v2');
    });
    ApplicationRestServices.factory('MmscRemoteTroubleshootingRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'MMSC Troubleshooting Remote', '/mmsc-troubleshooting-remote-rest/v2');
    });

    // USSD Gateway restangular definitions
    ApplicationRestServices.factory('UssdGwConfigRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'USSD Service Center Configuration', '/ussd-gw-gr-rest/configuration/v1');
    });
    ApplicationRestServices.factory('UssdGwProvRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'USSD Service Center Provisioning', '/ussd-gw-gr-rest/provisioning/v1');
    });
    ApplicationRestServices.factory('UssdGwStatsRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'USSD Service Center Statistics', '/ussd-gw-local-rest/dashboard/ussd/v1');
    });
    ApplicationRestServices.factory('UssdGwSmppStatsRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'USSD Service Center SMPP Statistics', '/ussd-gw-local-rest/dashboard/v1');
    });
    ApplicationRestServices.factory('UssdBrowserRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'USSD Browser', '/ussd-browser-gr-rest/v1');
    });
    ApplicationRestServices.factory('UssdBrowserStatsRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'USSD Browser Statistics', '/ussd-browser-stats-local-rest/v1');
    });

    // USSD Gateway Services
    ApplicationRestServices.factory('UssiGwConfigRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'USSI Service Center Configuration', '/ussi-gw-core-config');
    });
    ApplicationRestServices.factory('UssiGwDashboardRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'USSI Service Center Dashboard', '/ussi-gw-dashboard');
    });

    // SMSF (SMS 5G) Services
    ApplicationRestServices.factory('SmsfConfigRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'SMSF Center Configuration', '/smsf-core-config');
    });
    ApplicationRestServices.factory('SmsfDashboardRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'SMSF Center Dashboard', '/smsf-dashboard');
    });

    // SMS AntiSpam Services
    ApplicationRestServices.factory('SMSAntiSpamRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'SMS Anti-Spam', '/smsantispam-core-gr-rest');
    });
    ApplicationRestServices.factory('SMSAntiSpamConfigRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'SMS Anti-Spam Configuration', '/smsantispam-config-gr-rest/v1');
    });

    // Missed Call Notification
    ApplicationRestServices.factory('MCAProvRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Missed Call Notification', '/mcn-provisioning-gr-rest/v3');
    });
    ApplicationRestServices.factory('MCAConfigRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Missed Call Notification Configuration', '/mcn-configuration-gr-rest/v5');
    });
    ApplicationRestServices.factory('MCADashboardRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Missed Call Notification Dashboard', '/mcn-dashboard-local-rest/v4');
    });

    // Voice Mail
    ApplicationRestServices.factory('VMDashboardRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Voice Mail Dashboard', '/voicemail-rest/dashboard/v1');
    });
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
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'P4M Service', '/p4m-rest/v3');
    });

    // RBT
    ApplicationRestServices.factory('RBTConfigurationRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'RBT Configuration Service', '/rbt-rest/configuration/v1');
    });

    // License Manager
    ApplicationRestServices.factory('LicenseManagerRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'License Manager', '/license-manager-rest');
    });

    // Pentaho
    ApplicationRestServices.factory('PentahoRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Pentaho', '/pentaho');
    });
    ApplicationRestServices.factory('PentahoApiRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Pentaho API', '/pentaho/api');
    });

    // Diagnostics
    ApplicationRestServices.factory('DiagnosticsRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Diagnostics', '/diagnostics-rest');
    });

    // Subscription Management Services
    ApplicationRestServices.factory('SubscriptionManagementRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Subscription Management', '/subscription-management-rest');
    });

    // Subscription Management Services
    ApplicationRestServices.factory('SubscriptionManagementRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Subscription Management', '/subscription-management-rest');
    });

    // Advertisement Configuration Services
    ApplicationRestServices.factory('AdvertisementConfigurationRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Advertisement Configuration', '/ad-configuration-rest/v1');
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
