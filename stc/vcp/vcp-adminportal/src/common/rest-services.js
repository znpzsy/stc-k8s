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
    //ApplicationRestServices.constant('SERVICES_BASE', '/dsp/services');

    ApplicationRestServices.factory('MainRestangularConfService', function (Restangular, SERVICES_BASE, SessionService, RESOURCE_NAME) {
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
    ApplicationRestServices.factory('ScreeningManagerRestangularV2', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Screening Manager', '/screening-manager-rest/v2');
    });

    ApplicationRestServices.factory('ScreeningManagerRestangularV3', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Screening Manager', '/screening-manager-rest/v3');
    });

    ApplicationRestServices.factory('ScreeningManagerStatsRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Screening Manager Statistics', '/screening-manager-stats-rest/v1');
    });

    //  SMSC rest services

    ApplicationRestServices.factory('SmppProxyRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'SMPP Proxy', '/smspp-proxy-rest');
    });
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
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Voice Mail Provisioning', '/voicemail-rest/provisioning/v2');
    });

    // P4M
    ApplicationRestServices.factory('P4MRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'P4M Service', '/p4m-rest/v3');
    });

    // RBT
    ApplicationRestServices.factory('RBTConfigurationRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'RBT Configuration Service', '/rbt-rest/configuration/v1');
    });
    // RBT
    ApplicationRestServices.factory('CRBTConfigurationRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'CRBT Configuration Service', '/crbt-rest/v1/configurations');
    });


    // Voice SMS (Taken from Jawwal)
    ApplicationRestServices.factory('VSMSDashboardRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Voice SMS Dashboard', '/voicesms-rest/dashboard/v1');
    });
    ApplicationRestServices.factory('VSMSConfigurationRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Voice SMS Configuration', '/voicesms-rest/configuration/v1');
    });
    ApplicationRestServices.factory('VSMSSelfCareRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Voice SMS Self Care', '/voicesms-rest/cc/v4');
    });
    ApplicationRestServices.factory('VSMSProvisioningRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Voice SMS Provisioning', '/voicesms-rest/provisioning/v2');
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


    ////// DSP Services - Start
    // Api Manager services
    ApplicationRestServices.factory('ApiManagerRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Api Manager', '/apimanager-rest');
    });
    ApplicationRestServices.factory('ApiManagerProvRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Api Manager Provisioning', '/apimanager-prov-rest');
    });

    // Bulk Messaging Services (Campaign Management)
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
    // Outbound IVR Services
    ApplicationRestServices.factory('OIVRDashboardRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Outbound IVR Dashboard', '/oivr-dashboard-rest/v1');
    });
    ApplicationRestServices.factory('OIVRConfigRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Outbound IVR Configuration', '/oivr-config-rest/v1');
    });


    // OBIVR Services (Outbound IVR)

    ApplicationRestServices.factory('OutboundIVRConfigRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Outbound IVR Configuration', '/obivr-config-rest/v1');
    });

    // Content Management Services
    ApplicationRestServices.factory('ContentManagementRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Content Management', '/content-management-rest');
    });
    // TODO: Altosis removed - Should these be combined into one service?
    ApplicationRestServices.factory('RBTContentManagementRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'RBT Content Management', '/content-management-rest');
    });
    ApplicationRestServices.factory('RBTSCGatewayRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'RBT SC Gateway', '/scgateway-rest/v1');
    });
    ApplicationRestServices.factory('RBTBackendRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'RBT Backend', '/rbt-backend-rest');
    });
    ApplicationRestServices.factory('RBTHotCodeRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'RBT HotCode', '/rbt-hotcode-rest');
    });
    ApplicationRestServices.factory('RBTSMSAutomationRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'RBT SMS Automation', '/rbt-sms-automation-rest/v1');
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

    // ChargingGw Services
    ApplicationRestServices.factory('ChargingGwRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Charging Gateway', '/chggw-rest/rest/v1');
    });

    // Restangular services which connects to NGSSM rest services
    ApplicationRestServices.factory('SSMSubscriptionsRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'SSM Subscriptions Service', '/ssm-subscriptions-rest/');
    });

    ApplicationRestServices.factory('SSMCampaignsRestangular', function (Restangular, MainRestangularConfService) {
         return MainRestangularConfService.prepareRestangularConf(Restangular, 'SSM Campaigns Service', '/ssm-campaigns-rest');
    });
    // ApplicationRestServices.factory('SSMSubscriptionsRestangular', function (Restangular, MainRestangularConfService) {
    //     return MainRestangularConfService.prepareRestangularConf(Restangular, 'SSM Subscriptions Service', '/ssm-subscriptions-rest/v1');
    // });
    // ApplicationRestServices.factory('SSMSubscribersRestangular', function (Restangular, MainRestangularConfService) {
    //     return MainRestangularConfService.prepareRestangularConf(Restangular, 'SSM Subscribers Service', '/ssm-subscribers-rest/v1');
    // });

    // TODO: Should these be altered?
    ApplicationRestServices.factory('SSMMobilySubscribersRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'SSM Subscribers Service', '/ssm-subscribers-rest/v1');
    });
    ApplicationRestServices.factory('SSMMobilyQuerySubscribersRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'SSM Query Subscribers Service', '/ssm-query-subscribers-rest/v1');
    });
    // CSSM - Content Related NGSSM Services // TODO: MAY BE REMOVED
    ApplicationRestServices.factory('CSSMSubscriptionsContentRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'CSSM Subscriptions Service', '/cssm-subscriptions-rest/v1');
    });
    // ApplicationRestServices.factory('CSSMSubscriptionsContentRestangular', function (Restangular, MainRestangularConfService) {
    //     return MainRestangularConfService.prepareRestangularConf(Restangular, 'CSSM Subscriptions Content Service', '/cssm-rest/subscriptions/content/v1');
    // });
    ApplicationRestServices.factory('CSSMSubscriptionsQueryRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'CSSM Subscriptions Query Service', '/cssm-query-rest/v1');
    });

    // Workflows and OTP services
    ApplicationRestServices.factory('WorkflowsRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Workflows', '/workflows-rest');
    });
    // Notice that this is a different service from the workflows-otp-rest service.
    ApplicationRestServices.factory('OTPRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'One Time Password', '/otp-rest/v1');
    });


    // SMS Portal services - This is somehow related to SSM Templates
    ApplicationRestServices.factory('SMSPortalRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'SMS Portal', '/smsportal-rest');
    });
    ApplicationRestServices.factory('SMSPortalProvisioningRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'SMS Portal Provisioning', '/smsportal-rest/provisioning/v1');
    });

    ////// DSP Services - End 


    // Elastic Search services
    // Elastic Search (VCP products, services, diagnostics, etc.)
    ApplicationRestServices.service('ESClient', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Elastic Search Main', '/vcp-es-rest');
    });
    ApplicationRestServices.factory('DiagnosticsRestangular', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Diagnostics', '/diagnostics-rest');
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
    ApplicationRestServices.service('WorkflowsESClient', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Elastic Search Workflows', '/workflows-es-rest');
    });
    ApplicationRestServices.service('SsmESClient', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Elastic Search SSM', '/ssm-es-rest');
    });
    ApplicationRestServices.service('BulkSmscESClient', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Elastic Search BMS', '/smartads-es-rest');
    });

    // Charging Gw Elastic Search service
    ApplicationRestServices.service('ChargingGwESAdapterClient', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Charging Gateway Elastic Search Adapter', '/chggw-rest/rest/v1');
    });
    // Messaging Gw Elastic Search service
    ApplicationRestServices.service('MessagingGwESAdapterClient', function (Restangular, MainRestangularConfService) {
        return MainRestangularConfService.prepareRestangularConf(Restangular, 'Messaging Gateway Elastic Search Adapter', '/msggw-rest');
    });

})();
