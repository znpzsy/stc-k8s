(function () {

    'use strict';

    angular.module('partnerportal.partner-info.services.sla.webwapslaprofile', []);

    var PartnerInfoServicesWebWapSlaProfileModule = angular.module('partnerportal.partner-info.services.sla.webwapslaprofile');

    PartnerInfoServicesWebWapSlaProfileModule.config(function ($stateProvider) {

        $stateProvider.state('partner-info.services.sla.webwapslaprofile', {
            url: "/web-wap/:serviceId",
            templateUrl: 'partner-info/services/sla/operations.services.sla.webwapslaprofile.detail.html',
            controller: 'PartnerInfoServicesWebWapSlaProfileCtrl',
            data: {
                backState: 'partner-info.services.list'
            },
            resolve: {
                service: function ($stateParams, CMPFService) {
                    return CMPFService.getService($stateParams.serviceId);
                }
            }
        });

    });

    PartnerInfoServicesWebWapSlaProfileModule.controller('PartnerInfoServicesWebWapSlaProfileCtrl', function ($scope, $log, $state, $translate, notification, UtilService, CMPFService,
                                                                                                              SERVICE_SLA_VIOLATION_POLICIES, service) {
        $log.debug('PartnerInfoServicesWebWapSlaProfileCtrl');

        $scope.service = service;

        $scope.SERVICE_SLA_VIOLATION_POLICIES = SERVICE_SLA_VIOLATION_POLICIES;

        // WEBWAPSLAProfile
        var webWAPSLAProfiles = CMPFService.getProfileAttributes($scope.service.profiles, CMPFService.SERVICE_WEB_WAP_SLA_PROFILE);
        if (webWAPSLAProfiles.length > 0) {
            $scope.service.webWAPSLAProfile = angular.copy(webWAPSLAProfiles[0]);
        } else {
            $scope.service.webWAPSLAProfile = {
                IsMaxRecipientsSLAEnabled: false,
                MaxRecipients: null,
                MaxRecipientsSLAViolationPolicy: null
            };
        }
    });


})();