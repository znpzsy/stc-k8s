(function () {
    'use strict';

    /* Restful Services */
    angular.module('Application.rest-services', []);

    var ApplicationRestServices = angular.module('Application.rest-services');

    // Restangular service which connects to CMPF rest service
    ApplicationRestServices.factory('CMPFAuthRestangular', function (Restangular, SessionService, RESOURCE_NAME) {
        return Restangular.withConfig(function (RestangularConfigurer) {
            RestangularConfigurer.setDefaultHeaders({
                'Channel': 'CC',
                'Username': (_.isEmpty(SessionService.getUsername()) ? undefined : SessionService.getUsername()),
                'TransactionId': new Date().getTime(),
                'ServiceLabel': 'CMPF Authorization',
                'ResourceName': RESOURCE_NAME
            });
            RestangularConfigurer.setBaseUrl('/cmpf-auth-rest');
        });
    });

    // TODO: changed to use dsp services for demo purposes
    ApplicationRestServices.constant('SERVICES_BASE', '/vcp/services');
    // ApplicationRestServices.constant('SERVICES_BASE', '/dsp/services');

    ApplicationRestServices.factory('MainRestangularConfService', function (Restangular, SERVICES_BASE, SessionService, RESOURCE_NAME) {
        return {
            prepareRestangularConf: function (restangularInstance, serviceLabel, baseUrl) {
                return restangularInstance.withConfig(function (RestangularConfigurer) {
                    RestangularConfigurer.addFullRequestInterceptor(function (element, operation, what, url, headers, params, httpConfig) {
                        headers.Channel = 'CC';

                        var sessionKey = SessionService.getSessionKey();
                        if (sessionKey.token) {
                            headers.userId = SessionService.getUserId();
                            headers.orgId = SessionService.getSessionOrganizationId();
                            headers.Username = SessionService.getUsername();
                        } else {
                            headers.userId = '';
                            headers.orgId = '';
                            headers.Username = '';
                        }

                        headers.TransactionId = new Date().getTime();
                        headers.ServiceLabel = serviceLabel;
                        headers.ResourceName = RESOURCE_NAME;

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
                'Channel': 'CC',
                'Username': (_.isEmpty(SessionService.getUsername()) ? undefined : SessionService.getUsername()),
                'TransactionId': new Date().getTime(),
                'ServiceLabel': 'Server Information',
                'ResourceName': RESOURCE_NAME
            });
            RestangularConfigurer.setBaseUrl('/');
        });
    });

    // CMPF services
    ApplicationRestServices.factory('CMPFRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'CMPF', '/cmpf-rest');
    });

    // Workflows and OTP services
    ApplicationRestServices.factory('WorkflowsRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Workflows', '/workflows-rest');
    });
    ApplicationRestServices.factory('WorkflowsOTPRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Workflows One Time Password', '/workflows-otp-rest');
    });
    ApplicationRestServices.factory('WorkflowsPartnerRegistrationRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Workflows Partner Registration Service', '/workflows-partner-registration-rest');
    });

    // MessagingGw services
    ApplicationRestServices.factory('MessagingGwProvRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Messaging Gateway Provisioning', '/msggw-rest/provisioning/v1');
    });

    // ChargingGw services
    ApplicationRestServices.factory('ChargingGwProvRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Charging Gateway Provisioning', '/chggw-rest/rest');
    });

    // Pentaho
    ApplicationRestServices.factory('PentahoRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Pentaho', '/pentaho');
    });

    // Content Management Services
    ApplicationRestServices.factory('ContentManagementRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Content Management', '/content-management-rest');
    });

    ApplicationRestServices.factory('BulkContentManagementRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Content Management', '/partner-content-management-rest');
    });

    // Api Manager services
    ApplicationRestServices.factory('ApiManagerProvRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Api Manager Provisioning', '/apimanager-prov-rest');
    });

    // Elastic search services
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
