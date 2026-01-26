(function () {

    'use strict';

    angular.module('partnerportal.partner-info.services.sla.smsslaprofile', []);

    var PartnerInfoServicesSmsSlaProfileModule = angular.module('partnerportal.partner-info.services.sla.smsslaprofile');

    PartnerInfoServicesSmsSlaProfileModule.config(function ($stateProvider) {

        $stateProvider.state('partner-info.services.sla.smsslaprofile', {
            url: "/sms/:serviceId",
            templateUrl: 'partner-info/services/sla/operations.services.sla.smsslaprofile.detail.html',
            controller: 'PartnerInfoServicesSmsSlaProfileCtrl',
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

    PartnerInfoServicesSmsSlaProfileModule.controller('PartnerInfoServicesSmsSlaProfileCtrl', function ($scope, $log, $state, $translate, notification, UtilService, CMPFService,
                                                                                                        SERVICE_SLA_VIOLATION_POLICIES, service) {
        $log.debug('PartnerInfoServicesSmsSlaProfileCtrl');

        $scope.service = service;

        $scope.SERVICE_SLA_VIOLATION_POLICIES = SERVICE_SLA_VIOLATION_POLICIES;

        // SMSSLAProfile
        var smsSLAProfiles = CMPFService.getProfileAttributes($scope.service.profiles, CMPFService.SERVICE_SMS_SLA_PROFILE);
        if (smsSLAProfiles.length > 0) {
            $scope.service.smsSLAProfile = angular.copy(smsSLAProfiles[0]);
        } else {
            $scope.service.smsSLAProfile = {
                IsMaxSMSLengthSLAEnabled: false,
                MaxSMSLength: null,
                MaxSMSLengthSLAViolationPolicy: null,
                IsMaxRecipientsSLAEnabled: false,
                MaxRecipients: null,
                MaxRecipientsSLAViolationPolicy: null
            };
        }
    });


})();