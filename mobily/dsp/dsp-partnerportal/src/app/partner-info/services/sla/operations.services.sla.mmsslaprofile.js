(function () {

    'use strict';

    angular.module('partnerportal.partner-info.services.sla.mmsslaprofile', []);

    var PartnerInfoServicesMmsSlaProfileModule = angular.module('partnerportal.partner-info.services.sla.mmsslaprofile');

    PartnerInfoServicesMmsSlaProfileModule.config(function ($stateProvider) {

        $stateProvider.state('partner-info.services.sla.mmsslaprofile', {
            url: "/mms/:serviceId",
            templateUrl: 'partner-info/services/sla/operations.services.sla.mmsslaprofile.detail.html',
            controller: 'PartnerInfoServicesMmsSlaProfileCtrl',
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

    PartnerInfoServicesMmsSlaProfileModule.controller('PartnerInfoServicesMmsSlaProfileCtrl', function ($scope, $log, $state, $translate, notification, UtilService, CMPFService,
                                                                                                        SERVICE_SLA_VIOLATION_POLICIES, service) {
        $log.debug('PartnerInfoServicesMmsSlaProfileCtrl');

        $scope.service = service;

        $scope.SERVICE_SLA_VIOLATION_POLICIES = SERVICE_SLA_VIOLATION_POLICIES;

        // MMSSLAProfile
        var mmsSLAProfiles = CMPFService.getProfileAttributes($scope.service.profiles, CMPFService.SERVICE_MMS_SLA_PROFILE);
        if (mmsSLAProfiles.length > 0) {
            $scope.service.mmsSLAProfile = angular.copy(mmsSLAProfiles[0]);
        } else {
            $scope.service.mmsSLAProfile = {
                IsMaxMMSSizeSLAEnabled: false,
                MaxMMSSize: null,
                MaxMMSSizeViolationPolicy: null,
                IsMaxRecipientsSLAEnabled: false,
                MaxRecipients: null,
                MaxRecipientsViolationPolicy: null,
                IsContentTypesSLAEnabled: false,
                ContentTypesSLAViolationPolicy: null
            };
        }
    });


})();