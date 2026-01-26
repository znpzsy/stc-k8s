(function () {
    'use strict';

    /* Restful Services */
    angular.module('Application.rest-services', []);

    var ApplicationRestServices = angular.module('Application.rest-services');

    // Restangular service which connects to CMPF rest service
    ApplicationRestServices.factory('CMPFAuthRestangular', function (Restangular, SessionService, RESOURCE_NAME) {
        return Restangular.withConfig(function (RestangularConfigurer) {
            RestangularConfigurer.setDefaultHeaders({
                'Channel': 'CC-Portal',
                'Username': (_.isEmpty(SessionService.getUsername()) ? undefined : SessionService.getUsername()),
                'TransactionId': new Date().getTime(),
                'ServiceLabel': 'CMPF Authorization',
                'ResourceName': RESOURCE_NAME
            });
            RestangularConfigurer.setBaseUrl('/cmpf-auth-rest');
        });
    });

    // Restangular service which connects to CMPF rest service
    ApplicationRestServices.factory('CMPFSSOAuthRestangular', function (Restangular, SessionService, RESOURCE_NAME) {
        return Restangular.withConfig(function (RestangularConfigurer) {
            RestangularConfigurer.setDefaultHeaders({
                'Channel': 'CC-Portal',
                'Username': (_.isEmpty(SessionService.getUsername()) ? undefined : SessionService.getUsername()),
                'TransactionId': new Date().getTime(),
                'ServiceLabel': 'CMPF SSO Authorization',
                'ResourceName': RESOURCE_NAME
            });
            RestangularConfigurer.setBaseUrl('/cmpf-sso-auth-rest');
        });
    });

    ApplicationRestServices.constant('SERVICES_BASE', '/dsp/services');

    ApplicationRestServices.factory('MainRestangularConfService', function (Restangular, SERVICES_BASE, RESOURCE_NAME, SessionService, UtilService) {
        return {
            prepareRestangularConf: function (restangularInstance, serviceLabel, baseUrl) {
                return restangularInstance.withConfig(function (RestangularConfigurer) {
                    RestangularConfigurer.addFullRequestInterceptor(function (element, operation, what, url, headers, params, httpConfig) {
                        headers.Channel = 'CC-Portal';
                        headers.Username = SessionService.getUsername();
                        headers.TransactionId = new Date().getTime();
                        headers.ServiceLabel = serviceLabel;
                        headers.ResourceName = RESOURCE_NAME;

                        if (!url.includes('/useraccounts') && !url.includes('/usergroups')) {
                            headers.SubscriberNumber = UtilService.getSubscriberMsisdn();
                        }

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
    ApplicationRestServices.factory('ServerInformationRestangular', function (Restangular, SessionService, RESOURCE_NAME) {
        return Restangular.withConfig(function (RestangularConfigurer) {
            RestangularConfigurer.setDefaultHeaders({
                'Channel': 'CC-Portal',
                'Username': (_.isEmpty(SessionService.getUsername()) ? undefined : SessionService.getUsername()),
                'TransactionId': new Date().getTime(),
                'ServiceLabel': 'Server Information',
                'ResourceName': RESOURCE_NAME
            });
            RestangularConfigurer.setBaseUrl('/');
        });
    });

    ApplicationRestServices.factory('CMPFRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'CMPF', '/cmpf-rest');
    });

    // Restangular service which connects to SSM rest service
    ApplicationRestServices.factory('SSMMobilySubscribersRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'SSM Mobily Subscribers Service', '/ssm-mobily-subscribers-rest/v1');
    });
    ApplicationRestServices.factory('SSMSubscriptionsRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'SSM Subscriptions Service', '/ssm-subscriptions-rest/v1');
    });
    ApplicationRestServices.factory('CSSMSubscriptionsRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'CSSM Subscriptions Service', '/cssm-subscriptions-rest');
    });

    // DCB services
    ApplicationRestServices.factory('DCBRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Direct Carrier Billing', '/dcb-rest');
    });
    ApplicationRestServices.factory('DCBConfigRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'DCB Configuration', '/dcb-rest/config/v1');
    });

    // MessagingGw services
    ApplicationRestServices.factory('MessagingGwRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Messaging Gateway', '/msggw-rest');
    });
    ApplicationRestServices.factory('MessagingGwProvRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Messaging Gateway Provisioning', '/msggw-rest/provisioning/v1');
    });
    ApplicationRestServices.factory('MessagingGwConfRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Messaging Gateway Configuration', '/msggw-rest/configuration/v1');
    });

    // ChargingGw services
    ApplicationRestServices.factory('ChargingGwRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Charging Gateway', '/chggw-rest/rest/v1');
    });
    ApplicationRestServices.factory('ChargingGwConfRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Charging Gateway Configuration', '/chggw-rest/config/v1');
    });

    // Restangular service which connects to Screening Manager rest service
    ApplicationRestServices.factory('ScreeningManagerV2Restangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Screening Manager', '/screening-manager-rest/v2');
    });

    // Bulk Messaging Services
    ApplicationRestServices.factory('BulkMessagingOperationsGrRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Bulk Messaging Operations', '/bms-bulkmsg-operations-gr-rest/v1');
    });

    // Content Management Services
    ApplicationRestServices.factory('ContentManagementRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Content Management', '/content-management-rest');
    });
    ApplicationRestServices.factory('RBTContentManagementRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'RBT Content Management', '/altosis-content-management-rest');
    });
    ApplicationRestServices.factory('RBTSCGatewayRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'RBT SC Gateway', '/scgateway-rest/v1');
    });

    // Elastic search service
    ApplicationRestServices.service('ESClient', function (esFactory, $location, $log, SERVICES_BASE) {
        var esResServiceUrl = $location.protocol() + '://' + $location.host() + ':' + $location.port() + SERVICES_BASE + '/es-rest';
        $log.debug('Elastic search client url: ', esResServiceUrl);

        return esFactory({
            host: esResServiceUrl,
            log: 'error'
        });
    });
    // Charging Gw Elastic Search service
    ApplicationRestServices.service('ChargingGwESAdapterClient', function (esFactory, $location, $log, SERVICES_BASE) {
        var esResServiceUrl = $location.protocol() + '://' + $location.host() + ':' + $location.port() + SERVICES_BASE + '/chggw-rest/rest/v1';
        $log.debug('Charging Gateway Elastic Search adapter client url: ', esResServiceUrl);

        return esFactory({
            host: esResServiceUrl,
            log: 'error'
        });
    });
    // Messaging Gw Elastic Search service
    ApplicationRestServices.service('MessagingGwESAdapterClient', function (esFactory, $location, $log, SERVICES_BASE) {
        var esResServiceUrl = $location.protocol() + '://' + $location.host() + ':' + $location.port() + SERVICES_BASE + '/msggw-rest';
        $log.debug('Messaging Gateway Elastic Search adapter client url: ', esResServiceUrl);

        return esFactory({
            host: esResServiceUrl,
            log: 'error'
        });
    });

})();
