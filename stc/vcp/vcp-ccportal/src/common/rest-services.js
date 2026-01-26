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

    // TODO: changed to use dsp services for demo purposes
    ApplicationRestServices.constant('SERVICES_BASE', '/vcp/services');
    // ApplicationRestServices.constant('SERVICES_BASE', '/dsp/services');

    ApplicationRestServices.factory('MainRestangularConfService', function (Restangular, SERVICES_BASE, SessionService) {
        return {
            prepareRestangularConf: function (restangularInstance, serviceLabel, baseUrl) {
                return restangularInstance.withConfig(function (RestangularConfigurer) {
                    RestangularConfigurer.addFullRequestInterceptor(function (element, operation, what, url, headers, params, httpConfig) {
                        headers.Channel = 'CC';
                        headers.Username = SessionService.getUsername();
                        headers.SubscriberNumber = SessionService.getMsisdn();
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

    // Restangular service which connects to SSM rest service
    ApplicationRestServices.factory('SSMMobilySubscribersRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'SSM Subscribers Service', '/ssm-subscribers-rest/v1');
    });
    ApplicationRestServices.factory('SSMSubscriptionsRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'SSM Subscriptions Service', '/ssm-subscriptions-rest');
    });
    ApplicationRestServices.factory('CSSMSubscriptionsRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'CSSM Subscriptions Service', '/cssm-subscriptions-rest');
    });

    // Restangular service which connects to SSM rest service
    ApplicationRestServices.factory('SSMSubscribersRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'SSM Subscribers Service', '/ssm-subscribers-rest/v1');
    });

    // Restangular service which connects to Subscriber rest service
    ApplicationRestServices.factory('SubscriberRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Subscriber Service', '/subscriber-rest/v1');
    });

    // Restangular service which connects to Screening Manager rest service
    ApplicationRestServices.factory('ScreeningManagerRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Screening Manager', '/screening-manager-rest/v2');
    });
    ApplicationRestServices.factory('ScreeningManagerV3Restangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Screening Manager V3', '/screening-manager-rest/v3');
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
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Voice Mail Provisioning', '/voicemail-rest/provisioning/v2');
    });

    // Voice SMS
    ApplicationRestServices.factory('VSMSConfigurationRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Voice SMS Configuration', '/voicesms-rest/configuration/v1');
    });
    ApplicationRestServices.factory('VSMSSelfCareRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Voice SMS Self Care', '/voicesms-rest/cc/v4');
    });
    ApplicationRestServices.factory('VSMSProvisioningRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Voice SMS Provisioning', '/voicesms-rest/provisioning/v2');
    });

    // P4M
    ApplicationRestServices.factory('P4MRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'P4M Service', '/p4m-rest/v3');
    });

    // Elastic search services
    // Elastic Search (VCP products, services, diagnostics, etc.)
    ApplicationRestServices.service('ESClient', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Elastic Search Main', '/vcp-es-rest');
    });
    // Elastic Search (Messaging)
    ApplicationRestServices.service('SmscESClient', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'SMSC Elastic Search', '/smsc-es-rest');
    });
    ApplicationRestServices.service('SmscESAdapterClient', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'SMSC Elastic Search Adapter', '/smsc-es-adapter-local-rest');
    });
    ApplicationRestServices.service('SMSAntiSpamESClient', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Elastic Search SMS Anti-Spam', '/smsantispam-es-rest');
    });
    ApplicationRestServices.service('SMSAntiSpamESAdapterClient', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Elastic Search SMS Anti-Spam Adapter', '/smsantispam-es-adapter-local-rest');
    });
    ApplicationRestServices.service('SmsfESClient', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'SMSF Elastic Search Client', '/smsf-es-rest');
    });
    // Elastic Search (RBT)
    ApplicationRestServices.service('RbtESClient', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Elastic Search RBT', '/rbt-es-rest');
    });
    ApplicationRestServices.service('SsmESClient', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Elastic Search SSM', '/ssm-es-rest');
    });
    // Charging Gw Elastic Search service
    ApplicationRestServices.service('ChargingGwESAdapterClient', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Charging Gateway Elastic Search Adapter', '/chggw-rest/rest/v1');
    });
    // Messaging Gw Elastic Search service
    ApplicationRestServices.service('MessagingGwESAdapterClient', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Messaging Gateway Elastic Search Adapter', '/msggw-rest');
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
    ApplicationRestServices.factory('RBTBackendRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'RBT Backend', '/rbt-backend-rest');
    });

})();
