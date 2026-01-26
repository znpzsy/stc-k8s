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

    ApplicationRestServices.constant('SERVICES_BASE', '/dsp/services');

    ApplicationRestServices.factory('MainRestangularConfService', function (Restangular, SessionService, SERVICES_BASE, RESOURCE_NAME) {
        return {
            prepareRestangularConf: function (restangularInstance, serviceLabel, baseUrl) {
                return restangularInstance.withConfig(function (RestangularConfigurer) {
                    RestangularConfigurer.addFullRequestInterceptor(function (element, operation, what, url, headers, params, httpConfig) {
                        headers.Channel = 'CC';
                        headers.Username = SessionService.getUsername();
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
    ApplicationRestServices.factory('ServerConfigurationRestangular', function (Restangular, SessionService, RESOURCE_NAME) {
        return Restangular.withConfig(function (RestangularConfigurer) {
            RestangularConfigurer.addFullRequestInterceptor(function (element, operation, what, url, headers, params, httpConfig) {
                headers.Channel = 'CC';
                headers.Username = SessionService.getUsername();
                headers.TransactionId = new Date().getTime();
                headers.ServiceLabel = 'Server Configuration';
                headers.ResourceName = RESOURCE_NAME;

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

    // Restangular service which connects to SSM rest service
    ApplicationRestServices.factory('SSMSubscribersRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'SSM Subscribers Service', '/ssm-subscribers-rest/v1');
    });
    ApplicationRestServices.factory('SSMMobilySubscribersRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'SSM Mobily Subscribers Service', '/ssm-mobily-subscribers-rest/v1');
    });
    ApplicationRestServices.factory('SSMMobilyQuerySubscribersRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'SSM Mobily Query Subscribers Service', '/ssm-mobily-query-subscribers-rest/v1');
    });
    ApplicationRestServices.factory('SSMSubscriptionsRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'SSM Subscriptions Service', '/ssm-subscriptions-rest/v1');
    });
    // CSSM
    ApplicationRestServices.factory('CSSMSubscriptionsContentRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'CSSM Mobily Subscriptions Content Service', '/cssm-mobily-rest/subscriptions/content/v1');
    });
    ApplicationRestServices.factory('CSSMSubscriptionsQueryRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'CSSM Mobily Subscriptions Query Service', '/cssm-mobily-rest/query/v1');
    });

    // Workflows and OTP services
    ApplicationRestServices.factory('WorkflowsRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Workflows', '/workflows-rest');
    });
    // Notice that this is a different service from the workflows-otp-rest service.
    ApplicationRestServices.factory('OTPRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'One Time Password', '/otp-rest/v1');
    });

    // DCB services
    ApplicationRestServices.factory('DCBRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Direct Carrier Billing', '/dcb-rest');
    });
    ApplicationRestServices.factory('DCBConfigRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'DCB Configuration', '/dcb-rest/config/v1');
    });

    // SMS Portal services
    ApplicationRestServices.factory('SMSPortalRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'SMS Portal', '/smsportal-rest');
    });
    ApplicationRestServices.factory('SMSPortalProvisioningRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'SMS Portal Provisioning', '/smsportal-rest/provisioning/v1');
    });

    // Restangular service which connects to Screening Manager rest service
    ApplicationRestServices.factory('ScreeningManagerV2Restangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Screening Manager', '/screening-manager-rest/v2');
    });
    ApplicationRestServices.factory('ScreeningManagerV3Restangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Screening Manager', '/screening-manager-rest/v3');
    });
    ApplicationRestServices.factory('ScreeningManagerStatsRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Screening Manager Statistics', '/screening-manager-stats-rest/v1');
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

    // Reports
    ApplicationRestServices.factory('ReportsRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Reports', '/reports');
    });

    // Diagnostics
    ApplicationRestServices.factory('DiagnosticsRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Diagnostics', '/diagnostics-rest');
    });

    // Api Manager services
    ApplicationRestServices.factory('ApiManagerRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Api Manager', '/apimanager-rest');
    });
    ApplicationRestServices.factory('ApiManagerProvRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Api Manager Provisioning', '/apimanager-prov-rest');
    });

    // Bulk Messaging Services
    ApplicationRestServices.factory('BulkMessagingDashboardRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Bulk Messaging Dashboard', '/bms-bulkmsg-dashboard-rest/v1');
    });
    ApplicationRestServices.factory('BulkMessagingCampaignsDashboardRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Bulk Messaging Campaigns Dashboard', '/bms-bulkmsg-campaigns-dashboard-rest');
    });
    ApplicationRestServices.factory('BulkMessagingConfGrRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Bulk Messaging Configuration', '/bms-bulkmsg-config-gr-rest/v1');
    });
    ApplicationRestServices.factory('BulkMessagingOperationsCampaignsRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Bulk Messaging Operations Campaigns', '/bms-bulkmsg-operations-campaigns-rest/v1');
    });
    ApplicationRestServices.factory('BulkMessagingOperationsGrRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Bulk Messaging Operations', '/bms-bulkmsg-operations-gr-rest/v1');
    });

    // MessagingGw services
    ApplicationRestServices.factory('MessagingGwRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Messaging Gateway', '/msggw-rest');
    });
    ApplicationRestServices.factory('MessagingGwDashboardRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Messaging Gateway Dashboard', '/msggw-rest/dashboard/msggw/v1');
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

    // Subscription Management Services
    ApplicationRestServices.factory('SubscriptionManagementRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Subscription Management', '/subscription-management-rest');
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

    // Elastic search services
    ApplicationRestServices.service('ESClient', function (esFactory, $location, $log, SERVICES_BASE) {
        var esResServiceUrl = $location.protocol() + '://' + $location.host() + ':' + $location.port() + SERVICES_BASE + '/es-rest';
        $log.debug('Elastic search client url: ', esResServiceUrl);

        return esFactory({
            host: esResServiceUrl,
            log: 'error'
        });
    });
    ApplicationRestServices.service('ApiManagerESClient', function (esFactory, $location, $log, SERVICES_BASE) {
        var esResServiceUrl = $location.protocol() + '://' + $location.host() + ':' + $location.port() + SERVICES_BASE + '/apimanager-es-rest';
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
